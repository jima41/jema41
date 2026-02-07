import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
  requiredUsername?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole = 'admin',
  requiredUsername = 'Jema41'
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Show loading state if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-admin-text-secondary">Chargement...</p>
        </div>
      </div>
    );
  }

  // Check if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-bg to-admin-card flex items-center justify-center p-4">
        <div className="glass-panel border border-admin-border rounded-lg p-8 max-w-md text-center">
          <p className="text-red-400 text-lg font-bold mb-3">❌ Accès Refusé</p>
          <p className="text-admin-text-secondary mb-4">
            Vous n'avez pas les permissions requises pour accéder à cette section.
          </p>
          <p className="text-xs text-admin-text-secondary mb-6">
            Seul l'administrateur Jema41 peut accéder à cette interface.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-admin-gold text-admin-bg rounded-lg hover:bg-admin-gold-light transition-colors"
          >
            Retourner à l'accueil
          </a>
        </div>
      </div>
    );
  }

  // Check if user has required username (for admin)
  if (requiredUsername && user.username !== requiredUsername) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-bg to-admin-card flex items-center justify-center p-4">
        <div className="glass-panel border border-admin-border rounded-lg p-8 max-w-md text-center">
          <p className="text-red-400 text-lg font-bold mb-3">❌ Accès Refusé</p>
          <p className="text-admin-text-secondary mb-4">
            Seul l'administrateur <span className="font-bold text-admin-gold">Jema41</span> peut accéder à cette section.
          </p>
          <p className="text-xs text-admin-text-secondary mb-6">
            Utilisateur actuel: <span className="font-medium">{user.username}</span>
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-admin-gold text-admin-bg rounded-lg hover:bg-admin-gold-light transition-colors"
          >
            Retourner à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
