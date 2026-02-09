import { useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';

/**
 * Composant d'initialisation de la synchronisation des données
 * Charge les produits depuis Supabase et active la synchronisation temps réel
 */
export function DataSyncInitializer({ children }: { children: React.ReactNode }) {
  const initializeProducts = useAdminStore((state) => state.initializeProducts);
  const setupRealtimeSync = useAdminStore((state) => state.setupRealtimeSync);
  const teardownRealtimeSync = useAdminStore((state) => state.teardownRealtimeSync);
  const isInitialized = useAdminStore((state) => state.isInitialized);
  const productsLoading = useAdminStore((state) => state.productsLoading);
  const products = useAdminStore((state) => state.products);

  console.log('🟢 [DataSyncInitializer] RENDER', { isInitialized, productsLoading, productsCount: products.length });

  // Initialisation des produits au montage du composant
  useEffect(() => {
    console.log('🟡 [DataSyncInitializer] useEffect 1 - Conditions:', { isInitialized, productsLoading });
    
    if (!isInitialized && !productsLoading) {
      console.log('🔷 [DataSyncInitializer] APPEL initializeProducts()');
      initializeProducts().then(() => {
        console.log('🟢 [DataSyncInitializer] initializeProducts() COMPLÉTÉ');
      }).catch((error) => {
        console.error('🔴 [DataSyncInitializer] initializeProducts() ERREUR:', error);
      });
    } else {
      console.log('🟠 [DataSyncInitializer] CONDITIONS NON MET - isInitialized:', isInitialized, ', productsLoading:', productsLoading);
    }
  }, [isInitialized, productsLoading, initializeProducts]);

  // Configuration de la synchronisation en temps réel
  useEffect(() => {
    console.log('🟡 [DataSyncInitializer] useEffect 2 - isInitialized:', isInitialized);
    
    if (isInitialized) {
      console.log('📡 [DataSyncInitializer] setupRealtimeSync()');
      setupRealtimeSync();

      // Nettoyage lors de la destruction du composant
      return () => {
        console.log('🧹 [DataSyncInitializer] teardownRealtimeSync()');
        teardownRealtimeSync();
      };
    }
  }, [isInitialized, setupRealtimeSync, teardownRealtimeSync]);

  return <>{children}</>;
}

export default DataSyncInitializer;
