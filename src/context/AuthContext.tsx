import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/supabase';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (email: string, firstName: string, lastName: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Crée un profil utilisateur basique à partir des infos d'auth (fallback)
 */
const buildFallbackProfile = (authUserId: string, authEmail: string): User => ({
  id: authUserId,
  username: authEmail.split('@')[0],
  email: authEmail,
  firstName: '',
  lastName: '',
  role: authEmail === 'admin@rayha.com' ? 'admin' : 'user',
});

/**
 * Charge le profil utilisateur depuis la table profiles Supabase.
 * Retourne TOUJOURS un profil (fallback sur les infos auth si la DB échoue).
 */
const fetchUserProfile = async (authUserId: string, authEmail: string): Promise<User> => {
  try {
    console.log('🔍 fetchUserProfile: Chargement pour', authUserId);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, first_name, last_name, role')
      .eq('id', authUserId)
      .single();

    console.log('🔍 fetchUserProfile: Résultat select', { data: !!data, error: error?.message });

    if (error || !data) {
      console.warn('⚠️ Profil non trouvé, tentative de création...');
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .upsert({
          id: authUserId,
          email: authEmail,
          username: authEmail.split('@')[0],
          role: authEmail === 'admin@rayha.com' ? 'admin' : 'user',
          first_name: '',
          last_name: '',
        })
        .select()
        .single();

      if (insertError || !newProfile) {
        console.error('❌ Impossible de créer le profil:', insertError?.message);
        return buildFallbackProfile(authUserId, authEmail);
      }

      return {
        id: newProfile.id,
        username: newProfile.username || authEmail.split('@')[0],
        email: newProfile.email || authEmail,
        firstName: newProfile.first_name || '',
        lastName: newProfile.last_name || '',
        role: (newProfile.role as 'admin' | 'user') || 'user',
      };
    }

    return {
      id: data.id,
      username: data.username || authEmail.split('@')[0],
      email: data.email || authEmail,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      role: (data.role as 'admin' | 'user') || 'user',
    };
  } catch (err) {
    console.error('❌ Erreur fetchUserProfile:', err);
    return buildFallbackProfile(authUserId, authEmail);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<User | null>(null);
  const loginInProgress = useRef(false);

  // Garder userRef synchronisé avec user
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Écouter les changements de session Supabase Auth
  useEffect(() => {
    let mounted = true;

    // 1. Récupérer la session existante
    const initSession = async () => {
      try {
        console.log('🔐 initSession: Vérification de la session...');
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          console.log('🔐 initSession: Session trouvée pour', session.user.email);
          const profile = await fetchUserProfile(session.user.id, session.user.email || '');
          if (mounted) setUser(profile);
        } else {
          console.log('🔐 initSession: Pas de session existante');
        }
      } catch (err) {
        console.error('❌ Erreur initSession:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    // 2. Écouter les changements d'état auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event, 'loginInProgress:', loginInProgress.current);

        // Si le login est en cours, on laisse la fonction login gérer le profil
        if (loginInProgress.current) {
          console.log('🔐 Auth event ignoré (login en cours)');
          return;
        }

        // Ignorer INITIAL_SESSION car initSession() le gère déjà
        if (event === 'INITIAL_SESSION') {
          console.log('🔐 INITIAL_SESSION ignoré (géré par initSession)');
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id, session.user.email || '');
          if (mounted) {
            setUser(profile);
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Session rafraîchie, ne rien changer si l'utilisateur est déjà chargé
          if (!userRef.current && mounted) {
            const profile = await fetchUserProfile(session.user.id, session.user.email || '');
            if (mounted) setUser(profile);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    loginInProgress.current = true;
    setIsLoading(true);
    try {
      // Déterminer si l'identifiant est un email ou un pseudo
      let email = identifier.trim();
      const isEmail = email.includes('@');
      console.log('🔐 login: Début', { identifier: email, isEmail });

      if (!isEmail) {
        let foundEmail: string | null = null;
        
        // Méthode 1 : via fonction RPC (bypass RLS)
        try {
          console.log('🔐 login: Tentative RPC get_email_by_username...');
          const { data: emailResult, error: rpcError } = await supabase
            .rpc('get_email_by_username', { p_username: email });
          
          console.log('🔐 login: RPC résultat', { emailResult, rpcError: rpcError?.message });
          if (!rpcError && emailResult) {
            foundEmail = emailResult as string;
          }
        } catch (e) {
          console.warn('🔐 login: RPC échoué', e);
        }

        // Méthode 2 : fallback requête directe sur profiles
        if (!foundEmail) {
          try {
            console.log('🔐 login: Tentative fallback direct profiles...');
            const { data: profileData } = await supabase
              .from('profiles')
              .select('email')
              .ilike('username', email)
              .single();

            if (profileData?.email) {
              foundEmail = profileData.email;
            }
          } catch (e) {
            console.warn('🔐 login: Fallback échoué', e);
          }
        }

        if (!foundEmail) {
          throw new Error('Pseudo introuvable. Vérifiez votre pseudo ou utilisez votre email.');
        }
        email = foundEmail;
        console.log('🔐 login: Email trouvé via pseudo:', email);
      }

      console.log('🔐 login: signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('🔐 login: signIn résultat', { userId: data?.user?.id, error: error?.message });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Identifiant ou mot de passe incorrect');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter');
        }
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('🔐 login: fetchUserProfile...');
        try {
          const profile = await fetchUserProfile(data.user.id, data.user.email || '');
          console.log('🔐 login: Profil chargé', { username: profile.username, role: profile.role });
          setUser(profile);
        } catch (profileErr) {
          // Profil fallback si tout échoue - ne pas bloquer le login
          console.error('🔐 login: Erreur profil, utilisation du fallback', profileErr);
          setUser(buildFallbackProfile(data.user.id, data.user.email || ''));
        }
      }
      
      console.log('🔐 login: Terminé avec succès');
    } catch (err) {
      console.error('🔐 login: Erreur', err);
      throw err;
    } finally {
      // Différer le reset pour laisser onAuthStateChange ignorer l'event SIGNED_IN
      setTimeout(() => {
        loginInProgress.current = false;
      }, 2000);
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            first_name: '',
            last_name: '',
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('Cet email est déjà utilisé');
        }
        throw new Error(error.message);
      }

      // Si l'email doit être confirmé
      if (data.user && !data.session) {
        throw new Error('Un email de confirmation vous a été envoyé. Vérifiez votre boîte mail.');
      }

      // Si l'inscription connecte directement (email confirmation désactivée)
      if (data.user && data.session) {
        const profile = await fetchUserProfile(data.user.id, data.user.email || '');
        setUser(profile);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('❌ Erreur logout:', err);
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (email: string, firstName: string, lastName: string) => {
    if (!user) throw new Error('Aucun utilisateur connecté');

    try {
      // Mettre à jour le profil dans la table profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email,
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw new Error(profileError.message);

      // Mettre à jour l'email dans Supabase Auth si changé
      if (email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email });
        if (authError) {
          console.warn('⚠️ Email non mis à jour dans Auth:', authError.message);
        }
      }

      // Mettre à jour l'état local
      setUser(prev => prev ? { ...prev, email, firstName, lastName } : null);
    } catch (error) {
      throw error;
    }
  }, [user]);

  const updatePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!user) throw new Error('Aucun utilisateur connecté');

    try {
      // Vérifier l'ancien mot de passe en tentant une connexion
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (verifyError) {
        throw new Error('Le mot de passe actuel est incorrect');
      }

      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw new Error(updateError.message);
    } catch (error) {
      throw error;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userId: user?.id || null, isAuthenticated: !!user, isLoading, login, signup, logout, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
