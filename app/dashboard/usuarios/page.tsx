"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import { Ban, Trash2, CheckCircle, UserPlus } from 'lucide-react'

// Definimos un tipo más completo para el perfil del usuario
type UserProfile = {
  id: string
  email: string | null
  full_name: string | null
  credits: number
  is_banned: boolean
  privacidad: 'public' | 'private'
  role: 'admin' | 'user'
}

export default function UsersPage() {
  const supabase = createClientComponentClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [creditAmounts, setCreditAmounts] = useState<{ [key: string]: number }>({})

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_all_users_admin')

    if (error) {
      toast.error('Error al cargar los usuarios.')
      console.error('Error fetching users:', error)
      setUsers([])
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAssignCredits = async (userId: string) => {
    const amount = creditAmounts[userId]
    if (!amount || amount <= 0) {
      toast.error('Por favor, introduce una cantidad de créditos válida.')
      return
    }

    const toastId = toast.loading('Asignando créditos...')

    try {
      const response = await fetch('/api/users/assign-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, amount }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error en el servidor')
      }

      toast.success('Créditos asignados con éxito.', { id: toastId })
      // Actualizar la UI
      setUsers(users.map(u => u.id === userId ? { ...u, credits: u.credits + amount } : u))
      setCreditAmounts(prev => ({ ...prev, [userId]: 0 }))

    } catch (error: any) {
      toast.error(`Error al asignar créditos: ${error.message}`, { id: toastId })
      console.error('Error assigning credits:', error)
    }
  }

  // ... (aquí irían las otras funciones como ban, delete, etc. que podemos añadir después si es necesario)

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
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Estado</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Rol</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Acciones</span>
                  </th>
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
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.is_banned ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'}`}>
                        {user.is_banned ? 'Baneado' : 'Activo'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-primary/10 text-primary/80'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      {/* Aquí irían los botones de acción como Banear/Desbanear/Eliminar */}
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
