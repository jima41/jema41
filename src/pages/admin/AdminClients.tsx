import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/supabase';
import { useAuth } from '@/context/AuthContext';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user';
}

interface UserModalData {
  user: User | null;
  isOpen: boolean;
}

const AdminClients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState<UserModalData>({ user: null, isOpen: false });
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Vérification d'accès admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin' || user.username.trim().toLowerCase() !== 'jema41') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, email, first_name, last_name, role')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allUsers: User[] = (data || []).map((p: any) => ({
        id: p.id,
        username: p.username || '',
        email: p.email || '',
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        role: p.role || 'user',
      }));
      setUsers(allUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const handleViewUser = (user: User) => {
    setModal({ user, isOpen: true });
    setEditForm(user);
  };

  const handleCloseModal = () => {
    setModal({ user: null, isOpen: false });
    setEditForm({});
  };

  const handleSaveUser = async () => {
    try {
      if (!modal.user?.id) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          email: (editForm as any).email || '',
          first_name: (editForm as any).firstName || '',
          last_name: (editForm as any).lastName || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', modal.user.id);

      if (error) throw error;

      await loadUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Supprimer les données associées puis le profil
      await supabase.from('cart_items').delete().eq('user_id', userId);
      await supabase.from('wishlist').delete().eq('user_id', userId);
      const { error } = await supabase.from('profiles').delete().eq('id', userId);

      if (error) throw error;

      await loadUsers();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const nonAdminUsers = users.filter(u => u.role === 'user');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-montserrat font-bold tracking-tighter text-admin-text-primary mb-2">
          Clients
        </h1>
        <p className="text-admin-text-secondary">Gérez les informations et les comptes clients</p>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-surface-secondary border-b border-admin-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-admin-text-primary">Nom d'utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-admin-text-primary">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-admin-text-primary">Prénom</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-admin-text-primary">Nom</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-admin-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {nonAdminUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-admin-text-secondary">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                nonAdminUsers.map(user => (
                  <tr key={user.id} className="hover:bg-admin-surface-secondary transition-colors">
                    <td className="px-6 py-4 text-sm text-admin-text-primary font-medium">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-admin-text-secondary">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-admin-text-secondary">{user.firstName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-admin-text-secondary">{user.lastName || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 hover:bg-admin-surface-secondary rounded transition-colors text-[#D4AF37]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 hover:bg-admin-surface-secondary rounded transition-colors text-[#D4AF37]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-2 hover:bg-red-500/10 rounded transition-colors text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit User */}
      {modal.isOpen && modal.user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-admin-surface rounded-xl max-w-md w-full max-h-screen overflow-y-auto p-6 border border-admin-border"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-admin-text-primary mb-6">Modifier le client</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-admin-text-primary mb-1">
                  Nom d'utilisateur (non modifiable)
                </label>
                <input
                  type="text"
                  value={modal.user.username}
                  disabled
                  className="w-full px-3 py-2 bg-admin-surface-secondary border border-admin-border rounded text-admin-text-secondary cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-text-primary mb-1">Email</label>
                <input
                  type="email"
                  value={(editForm as any).email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-admin-surface-secondary border border-admin-border rounded text-admin-text-primary focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-text-primary mb-1">Prénom</label>
                <input
                  type="text"
                  value={(editForm as any).firstName || ''}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-admin-surface-secondary border border-admin-border rounded text-admin-text-primary focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-text-primary mb-1">Nom</label>
                <input
                  type="text"
                  value={(editForm as any).lastName || ''}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-admin-surface-secondary border border-admin-border rounded text-admin-text-primary focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 bg-admin-surface-secondary border border-admin-border rounded text-admin-text-primary hover:bg-admin-surface transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/50 rounded text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-admin-surface rounded-xl p-6 border border-admin-border max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-admin-text-primary mb-4">Supprimer ce client?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-admin-surface-secondary border border-admin-border rounded text-admin-text-primary hover:bg-admin-surface transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded text-red-500 hover:bg-red-500/30 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminClients;
