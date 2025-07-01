"use client"

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/app/auth/AuthProvider'
import toast from 'react-hot-toast'
import { Ban, Trash2, CheckCircle, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  credits: number;
  privacidad: 'public' | 'private';
  role: 'admin' | 'user';
  created_at: string;
}

// Tipos para los datos crudos que vienen de la API
type RawUser = {
  id: string;
  email?: string;
  created_at: string;
};

type Profile = {
  id: string;
  nombre: string | null;
  credits: number;
  privacidad: 'public' | 'private';
  role: 'admin' | 'user';
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditAmounts, setCreditAmounts] = useState<{ [key: string]: number }>({});
  const { session } = useSupabase();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = session?.access_token;
      if (!token) {
        toast.error('No estás autenticado.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar los datos desde la API.');
      }

      // Se asignan tipos a los datos recibidos para mayor seguridad.
      const { users: rawUsers, profiles }: { users: RawUser[]; profiles: Profile[] } = data;

      // Se crea un mapa de perfiles para una búsqueda eficiente.
      const profilesMap = new Map<string, Profile>(profiles.map((p) => [p.id, p]));

      // Se combinan los datos de usuarios y perfiles en el cliente.
      const combinedData: UserProfile[] = rawUsers.map((user) => {
        const profile = profilesMap.get(user.id);
        return {
          id: user.id,
          email: user.email || null,
          full_name: profile?.nombre || null,
          credits: profile?.credits ?? 0,
          
          privacidad: profile?.privacidad || 'private',
          role: profile?.role || 'user',
          created_at: user.created_at,
        };
      });

      // Se ordenan los datos en el cliente.
      const sortedData = combinedData.sort((a, b) => {
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
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchUsers()
    }
  }, [session, fetchUsers])

  const handleAssignCredits = async (userId: string) => {
    const amount = creditAmounts[userId]
    if (!amount || amount <= 0) {
      toast.error('Por favor, introduce una cantidad de créditos válida.')
      return
    }

    const toastId = toast.loading('Asignando créditos...')

    try {
      const token = session?.access_token
      if (!token) {
        toast.error('No estás autenticado.')
        return
      }

      const response = await fetch('/api/users/assign-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, amount }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error en el servidor')
      }

      toast.success('Créditos asignados con éxito.', { id: toastId })
      fetchUsers() // Recargamos los datos para ver el cambio
      setCreditAmounts(prev => ({ ...prev, [userId]: 0 }))

    } catch (error: any) {
      toast.error(`Error al asignar créditos: ${error.message}`, { id: toastId })
      console.error('Error assigning credits:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Cargando usuarios...</p></div>
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-0">Nombre / Email</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Créditos</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Asignar Créditos</th>
                  
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                      <div className="font-medium text-gray-900 dark:text-white">{user.full_name || 'Sin nombre'}</div>
                      <div className="text-gray-500 dark:text-gray-400">{user.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{user.credits}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={creditAmounts[user.id] || ''}
                          onChange={(e) => setCreditAmounts({ ...creditAmounts, [user.id]: parseInt(e.target.value, 10) })}
                          className="w-20 p-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                          placeholder="Cant."
                        />
                        <Button onClick={() => handleAssignCredits(user.id)} size="sm">
                          <UserPlus className="h-4 w-4 mr-1" /> Asignar
                        </Button>
                      </div>
                    </td>
                    
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-primary/10 text-primary/80'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
