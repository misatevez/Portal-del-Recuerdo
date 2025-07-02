"use client"

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/app/auth/AuthProvider'
import toast from 'react-hot-toast'
import { UserPlus, Search } from 'lucide-react'

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  credits: number;
  privacidad: 'public' | 'private';
  role: 'admin' | 'user';
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditAmounts, setCreditAmounts] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { user, supabase } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        toast.error('No estás autenticado.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: UserProfile[] = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || 'Error al cargar los datos desde la API.');
      }

      const sortedData = data.sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA;
      });

      setUsers(sortedData);

    } catch (error: any) {
      toast.error(`Error al procesar usuarios: ${error.message}`);
      console.error('Error fetching and processing users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAssignCredits = async (userId: string) => {
    const amount = creditAmounts[userId];
    if (!amount || amount <= 0) {
      toast.error('Por favor, introduce una cantidad de créditos válida.');
      return;
    }

    const toastId = toast.loading('Asignando créditos...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        toast.error('No estás autenticado.');
        toast.dismiss(toastId);
        return;
      }

      const response = await fetch('/api/users/assign-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, amount }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error en el servidor');
      }

      toast.success('Créditos asignados con éxito.', { id: toastId });
      fetchUsers();
      setCreditAmounts((prev) => ({ ...prev, [userId]: 0 }));

    } catch (error: any) {
      toast.error(`Error al asignar créditos: ${error.message}`, { id: toastId });
    }
  };

  const filteredUsers = users.filter(u =>
    (u.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-andika text-primary mb-8">Gestión de Usuarios</h1>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text/40" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="elegant-input pl-10 pr-4 py-2 w-full rounded-md font-montserrat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="elegant-card p-6 rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse text-primary text-xl font-andika">Cargando usuarios...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text/60 font-montserrat">No se encontraron usuarios.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary/10">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">Créditos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">Fecha de Registro</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">Asignar Créditos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-text/80 font-montserrat">{u.full_name}</p>
                          <p className="text-xs text-text/60 font-montserrat">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/80 font-montserrat">{u.credits}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-montserrat ${u.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-primary/10 text-primary/80'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60 font-montserrat">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={creditAmounts[u.id] || ''}
                          onChange={(e) => setCreditAmounts({ ...creditAmounts, [u.id]: parseInt(e.target.value, 10) })}
                          className="w-24 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 elegant-input"
                          placeholder="Cant."
                        />
                        <button onClick={() => handleAssignCredits(u.id)} className="elegant-action-button" title="Asignar Créditos">
                          <UserPlus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style jsx global>{`
        .elegant-action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(var(--color-primary-rgb), 0.1);
          color: rgba(var(--color-primary-rgb), 0.8);
          border: 1px solid rgba(var(--color-primary-rgb), 0.2);
          transition: all 0.2s ease;
        }
        .elegant-action-button:hover {
          background-color: rgba(var(--color-primary-rgb), 1);
          color: white;
          transform: translateY(-1px);
        }
        .elegant-input {
          background-color: rgba(var(--color-surface-rgb), 0.8);
          border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        }
      `}</style>
    </div>
  );
}
