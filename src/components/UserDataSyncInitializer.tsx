import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { supabase } from '@/integrations/supabase/supabase';

/**
 * Composant qui gère l'initialisation et la synchronisation en temps réel
 * des données utilisateur (panier et favoris) depuis Supabase
 *
 * À montrer à la racine de l'app (dans App.tsx) pour synchroniser automatiquement
 * les données utilisateur lors de la connexion/déconnexion
 */
export const UserDataSyncInitializer = () => {
  const { user } = useAuth();
  const { initializeCart, setupCartRealtime, teardownCartRealtime } = useCartStore();
  const { initializeFavorites, setupFavoritesRealtime, teardownFavoritesRealtime } = useFavoritesStore();

  useEffect(() => {
    if (!user?.id) {
      // Utilisateur déconnecté: nettoyer les subscriptions et vider les données
      console.log('🔐 Utilisateur déconnecté - nettoyage des données');
      teardownCartRealtime();
      teardownFavoritesRealtime();
      useCartStore.setState({ cartItems: [] });
      useFavoritesStore.setState({ favorites: [] });
      return;
    }

    // Utilisateur connecté: initialiser et synchroniser les données
    console.log(`✅ Utilisateur connecté: ${user.email}`);

    const initializeUserData = async () => {
      try {
        // Charger le panier
        await initializeCart(user.id);
        setupCartRealtime(user.id);

        // Charger les favoris
        await initializeFavorites(user.id);
        setupFavoritesRealtime(user.id);

        console.log('✅ Synchronisation utilisateur complète');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des données utilisateur:', error);
      }
    };

    initializeUserData();

    // Cleanup on unmount
    return () => {
      teardownCartRealtime();
      teardownFavoritesRealtime();
    };
  }, [user?.id, initializeCart, setupCartRealtime, teardownCartRealtime, initializeFavorites, setupFavoritesRealtime, teardownFavoritesRealtime]);

  // Ce composant n'affiche rien, sert uniquement à orchestrer la synchronisation
  return null;
};

export default UserDataSyncInitializer;
