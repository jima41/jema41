import { useDataSync } from '@/hooks/use-data-sync';

/**
 * App Wrapper for Data Synchronization
 * Initializes data sync on app startup and handles periodic validation
 */
export const DataSyncInitializer = ({ children }: { children: React.ReactNode }) => {
  useDataSync(); // Initialize data sync
  return <>{children}</>;
};

export default DataSyncInitializer;
