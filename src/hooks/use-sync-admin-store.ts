import { useEffect, useRef } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { 
  broadcastSync, 
  forceSync, 
  initializeSync,
  getLastSyncedData,
  type SyncData 
} from '@/services/syncService';

/**
 * Hook pour synchroniser le store admin en temps réel
 * Synchronise les données entre web/mobile et entre différents onglets/fenêtres
 */
export const useSyncAdminStore = () => {
  const isInitialized = useRef(false);
  
  // Récupérer les données du store
  const products = useAdminStore((state) => state.products);
  const orders = useAdminStore((state) => state.orders);
  const abandonedCarts = useAdminStore((state) => state.abandonedCarts);
  const featuredProductIds = useAdminStore((state) => state.featuredProductIds);

  // Initialiser la synchronisation
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Initialiser l'écoute des changements depuis d'autres onglets
    const unsubscribe = initializeSync((syncData: SyncData) => {
      // Mettre à jour le store avec les données synchronisées
      useAdminStore.setState({
        products: syncData.products,
        orders: syncData.orders,
        abandonedCarts: syncData.abandonedCarts,
        featuredProductIds: syncData.featuredProductIds,
      });
    });

    // Charger les dernières données synchronisées au démarrage
    const lastSyncedData = getLastSyncedData();
    if (lastSyncedData) {
      useAdminStore.setState({
        products: lastSyncedData.products,
        orders: lastSyncedData.orders,
        abandonedCarts: lastSyncedData.abandonedCarts,
        featuredProductIds: lastSyncedData.featuredProductIds,
      });
    }

    return () => {
      unsubscribe?.();
    };
  }, []);

  // Syncer les changements du store
  useEffect(() => {
    const syncData: SyncData = {
      products,
      featuredProductIds,
      orders,
      abandonedCarts,
      lastSyncTime: Date.now(),
    };

    // Broadcaster les changements à tous les appareils/onglets
    broadcastSync(syncData);
  }, [products, orders, abandonedCarts, featuredProductIds]);

  return {
    products,
    orders,
    abandonedCarts,
    featuredProductIds,
  };
};

/**
 * Hook pour forcer une synchronisation complète
 */
export const useForceSync = () => {
  return () => {
    const state = useAdminStore.getState();
    const syncData: SyncData = {
      products: state.products,
      featuredProductIds: state.featuredProductIds,
      orders: state.orders,
      abandonedCarts: state.abandonedCarts,
      lastSyncTime: Date.now(),
    };
    forceSync(syncData);
  };
};
