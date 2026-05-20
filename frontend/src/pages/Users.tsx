import { useEffect, useState } from 'react';
import { getUsers } from '../services/api';
import { Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Pagination } from '../components/Pagination';

interface User {
  id: number;
  username: string;
  role: string;
}

const PAGE_SIZE = 10;

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        toast.error('Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <UsersIcon className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Usuarios del Sistema</h1>
          <p className="text-zinc-400 text-sm">Gestiona los accesos y roles del condominio</p>
        </div>
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
                        'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
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
    </div>
  );
};
