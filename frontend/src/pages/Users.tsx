import { useEffect, useState } from 'react';
import { getUsers, createUser, adminChangeRole, adminChangePassword, adminDeleteUser } from '../services/api';
import { Users as UsersIcon, Plus, Key, Shield, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Pagination } from '../components/Pagination';
import { useAuthStore } from '../store/useAuthStore';

interface User {
  id: number;
  username: string;
  role: string;
}

const PAGE_SIZE = 10;

export const Users = () => {
  const { role: currentUserRole } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<User | null>(null);

  // Forms state
  const [formData, setFormData] = useState({ username: '', password: '', role: 'RESIDENTE' });
  const [newRole, setNewRole] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createUser(formData);
      toast.success('Usuario creado exitosamente');
      setShowCreateModal(false);
      setFormData({ username: '', password: '', role: 'RESIDENTE' });
      fetchUsers();
    } catch (error) {
      toast.error('Error al crear usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRoleModal) return;
    setIsSubmitting(true);
    try {
      await adminChangeRole(showRoleModal.id, { newRole });
      toast.success('Rol actualizado');
      setShowRoleModal(null);
      fetchUsers();
    } catch (error) {
      toast.error('Error al actualizar rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal) return;
    setIsSubmitting(true);
    try {
      await adminChangePassword(showPasswordModal.id, { newPassword });
      toast.success('Contraseña actualizada');
      setShowPasswordModal(null);
      setNewPassword('');
    } catch (error) {
      toast.error('Error al actualizar contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.role === 'ADMIN') {
      toast.error('No se puede eliminar a un administrador');
      return;
    }
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.username}?`)) return;
    try {
      await adminDeleteUser(user.id);
      toast.success('Usuario eliminado exitosamente');
      fetchUsers();
    } catch (error) {
      toast.error('Error al eliminar usuario');
    }
  };

  const isAdmin = currentUserRole === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <UsersIcon className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Usuarios del Sistema</h1>
            <p className="text-zinc-400 text-sm">Gestiona los accesos y roles del condominio</p>
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Usuario</span>
          </button>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-300">
                <tr>
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Usuario / Email</th>
                  <th className="px-6 py-4 font-medium">Rol</th>
                  {isAdmin && <th className="px-6 py-4 font-medium text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users
                  .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                  .map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">{user.id}</td>
                    <td className="px-6 py-4 font-medium text-zinc-200">{user.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        user.role === 'SEGURIDAD' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        user.role === 'RECEPCION' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 flex justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setNewRole(user.role);
                            setShowRoleModal(user);
                          }}
                          title="Cambiar Rol"
                          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowPasswordModal(user)}
                          title="Cambiar Contraseña"
                          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            title="Eliminar Usuario"
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="px-6 py-8 text-center text-zinc-500">
                      No hay usuarios registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={page}
              totalItems={users.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-100">Crear Nuevo Usuario</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Usuario</label>
                <input 
                  type="text" required
                  value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Contraseña</label>
                <input 
                  type="password" required minLength={6}
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Rol</label>
                <select 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200"
                >
                  <option value="RESIDENTE">RESIDENTE</option>
                  <option value="RECEPCION">RECEPCION</option>
                  <option value="SEGURIDAD">SEGURIDAD</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors mt-4">
                {isSubmitting ? 'Creando...' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-100">Cambiar Rol</h3>
              <button onClick={() => setShowRoleModal(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-4">Usuario: {showRoleModal.username}</p>
            <form onSubmit={handleChangeRole} className="space-y-4">
              <select 
                value={newRole} onChange={e => setNewRole(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200"
              >
                <option value="RESIDENTE">RESIDENTE</option>
                <option value="RECEPCION">RECEPCION</option>
                <option value="SEGURIDAD">SEGURIDAD</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium mt-4">
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-100">Nueva Contraseña</h3>
              <button onClick={() => setShowPasswordModal(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-4">Usuario: {showPasswordModal.username}</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input 
                type="password" required minLength={6} placeholder="Nueva contraseña"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200"
              />
              <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium mt-4">
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
