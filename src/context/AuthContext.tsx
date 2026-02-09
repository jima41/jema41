import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
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
 * Charge le profil utilisateur depuis la table profiles Supabase
 */
const fetchUserProfile = async (authUserId: string, authEmail: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, first_name, last_name, role')
      .eq('id', authUserId)
      .single();

    if (error || !data) {
      console.warn('⚠️ Profil non trouvé, tentative de création...');
      // Le trigger aurait dû créer le profil, mais créons-le manuellement au cas où
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
        console.error('❌ Impossible de créer le profil:', insertError);
        return null;
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
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Écouter les changements de session Supabase Auth
  useEffect(() => {
    let mounted = true;

    // 1. Récupérer la session existante
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const profile = await fetchUserProfile(session.user.id, session.user.email || '');
          if (mounted) setUser(profile);
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
        console.log('🔐 Auth event:', event);

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
          if (!user && mounted) {
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
    setIsLoading(true);
    try {
      // Déterminer si l'identifiant est un email ou un pseudo
      let email = identifier.trim();
      const isEmail = email.includes('@');

      if (!isEmail) {
        let foundEmail: string | null = null;
        
        // Méthode 1 : via fonction RPC (bypass RLS)
        try {
          const { data: emailResult, error: rpcError } = await supabase
            .rpc('get_email_by_username', { p_username: email });
          
          if (!rpcError && emailResult) {
            foundEmail = emailResult as string;
          }
        } catch (e) {
          // RPC non disponible
        }

        // Méthode 2 : fallback requête directe sur profiles
        if (!foundEmail) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('email')
              .ilike('username', email)
              .single();

            if (profileData && (profileData as any).email) {
              foundEmail = (profileData as any).email;
            }
          } catch (e) {
            // Fallback échoué
          }
        }

        if (!foundEmail) {
          throw new Error('Pseudo introuvable. Vérifiez votre pseudo ou utilisez votre email.');
        }
        email = foundEmail;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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
        const profile = await fetchUserProfile(data.user.id, data.user.email || '');
        setUser(profile);
      }
    } finally {
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
