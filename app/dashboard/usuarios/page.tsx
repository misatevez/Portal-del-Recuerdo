"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { supabaseAdmin } from "../../lib/supabaseAdmin"
import { Search, Shield, Trash2, Check, X, Ban, UserCheck } from "lucide-react"
import { toast } from "react-hot-toast"
import { ConfirmDialog } from "../../components/ui/ConfirmDialog"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [userToBan, setUserToBan] = useState<{id: string, isBanned: boolean} | null>(null)
  const [activeTable, setActiveTable] = useState<'profiles' | 'usuarios'>('profiles')
  
  useEffect(() => {
    fetchUsers()
  }, [])
  
  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Llamar a nuestra API segura
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setUsers(data.users || [])
      setActiveTable('profiles')
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      toast.error('No se pudieron cargar los usuarios')
      
      // Intentar cargar solo la tabla usuarios como fallback
      try {
        const { data: usuariosData, error: usuariosError } = await supabase
          .from('usuarios')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (usuariosError) throw usuariosError
        
        setUsers(usuariosData || [])
        setActiveTable('usuarios')
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId)
    setIsDeleteDialogOpen(true)
  }
  
  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    
    try {
      // Llamar a nuestra API para eliminar completamente al usuario
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userToDelete }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar usuario')
      }
      
      // Actualizar la lista de usuarios
      setUsers(users.filter(user => user.id !== userToDelete))
      
      toast.success('Usuario eliminado completamente')
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      toast.error('No se pudo eliminar el usuario completamente')
    } finally {
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }
  
  const handleBanUser = (userId: string, isBanned: boolean) => {
    setUserToBan({ id: userId, isBanned })
    setIsBanDialogOpen(true)
  }
  
  const confirmBanUser = async () => {
    if (!userToBan) return
    
    try {
      // Llamar a nuestra API para banear/desbanear al usuario
      const response = await fetch('/api/users/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: userToBan.id, 
          isBanned: userToBan.isBanned 
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar estado de bloqueo')
      }
      
      // Actualizar la lista de usuarios
      setUsers(users.map(user => 
        user.id === userToBan.id ? { ...user, is_banned: !userToBan.isBanned } : user
      ))
      
      toast.success(`Usuario ${userToBan.isBanned ? 'desbloqueado' : 'bloqueado'} correctamente`)
    } catch (error) {
      console.error('Error al cambiar estado de bloqueo del usuario:', error)
      toast.error('No se pudo cambiar el estado de bloqueo del usuario')
    } finally {
      setIsBanDialogOpen(false)
      setUserToBan(null)
    }
  }
  
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // Solo para la tabla profiles que tiene campo is_active
      if (activeTable === 'profiles') {
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: !isActive })
          .eq('id', userId)
        
        if (error) throw error
        
        // Actualizar la lista de usuarios
        setUsers(users.map(user => 
          user.id === userId ? { ...user, is_active: !isActive } : user
        ))
        
        toast.success(`Usuario ${!isActive ? 'activado' : 'desactivado'} correctamente`)
      } else {
        toast.error('Esta acción no está disponible para usuarios de la tabla usuarios')
      }
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error)
      toast.error('No se pudo cambiar el estado del usuario')
    }
  }
  
  const filteredUsers = users.filter(user => 
    (user.nombre && user.nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Función para determinar si un usuario está activo
  const isUserActive = (user: any) => {
    if (activeTable === 'profiles') {
      return user.is_active !== false;
    }
    // Para la tabla usuarios, consideramos que todos están activos
    return true;
  }
  
  // Función para determinar si un usuario está baneado
  const isUserBanned = (user: any) => {
    if (activeTable === 'profiles') {
      return user.is_banned === true;
    }
    // Para la tabla usuarios, consideramos que ninguno está baneado
    return false;
  }

  return (
    <div>
      <h1 className="text-3xl font-andika text-primary mb-8">Gestión de Usuarios</h1>
      
      {/* Buscador */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text/40" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="pl-10 pr-4 py-2 w-full rounded-md border border-primary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 font-montserrat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Indicador de tabla activa */}
      <div className="mb-4 flex items-center">
        <Shield className="h-5 w-5 text-primary mr-2" />
        <span className="text-sm font-montserrat text-text/80">
          Mostrando datos de la tabla: <span className="font-semibold text-primary">{activeTable}</span>
        </span>
      </div>
      
      {/* Lista de usuarios */}
      <div className="elegant-card p-6 rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse text-primary text-xl font-andika">
              Cargando usuarios...
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text/60 font-montserrat">
              No se encontraron usuarios que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary/10">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Fecha de registro
                  </th>
                  {activeTable === 'profiles' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                      Privacidad
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                          {user.nombre ? user.nombre.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-text/80 font-montserrat">{user.nombre || 'Sin nombre'}</p>
                          <p className="text-xs text-text/60 font-montserrat">ID: {user.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/80 font-montserrat">
                      {user.email || 'No disponible'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60 font-montserrat">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Desconocida'}
                    </td>
                    {activeTable === 'profiles' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text/80 font-montserrat">
                        <span className={`px-2 py-1 text-xs rounded-full font-montserrat ${
                          user.privacidad === 'private' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.privacidad === 'private' ? 'Privado' : 'Público'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-montserrat">
                      <div className="space-y-1">
                        <div className="text-text/80">
                          {isUserActive(user) ? 
                            <span className="text-green-600 font-medium">Activo</span> : 
                            <span className="text-red-600 font-medium">Inactivo</span>
                          }
                        </div>
                        
                        {activeTable === 'profiles' && isUserBanned(user) && (
                          <div className="text-red-600 font-medium">
                            Bloqueado
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {activeTable === 'profiles' && (
                          <button 
                            onClick={() => toggleUserStatus(user.id, isUserActive(user))}
                            className="elegant-action-button"
                            title={isUserActive(user) ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {isUserActive(user) ? 
                              <X className="w-4 h-4 text-red-600" /> : 
                              <Check className="w-4 h-4 text-green-600" />
                            }
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleBanUser(user.id, isUserBanned(user))}
                          className="elegant-action-button"
                          title={isUserBanned(user) ? 'Desbloquear usuario' : 'Bloquear usuario'}
                        >
                          {isUserBanned(user) ? 
                            <UserCheck className="w-4 h-4 text-green-600" /> : 
                            <Ban className="w-4 h-4 text-red-600" />
                          }
                        </button>

                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="elegant-action-button"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
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
      
      {/* Diálogo de confirmación para eliminar usuario */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Eliminar usuario"
        message="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer y se eliminarán todos los datos asociados, incluyendo su cuenta, perfil, homenajes, comentarios y velas."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
      
      {/* Diálogo de confirmación para bloquear/desbloquear usuario */}
      <ConfirmDialog
        isOpen={isBanDialogOpen}
        onClose={() => setIsBanDialogOpen(false)}
        onConfirm={confirmBanUser}
        title={userToBan?.isBanned ? "Desbloquear usuario" : "Bloquear usuario"}
        message={userToBan?.isBanned 
          ? "¿Estás seguro de que quieres desbloquear a este usuario? Podrá volver a acceder a la plataforma."
          : "¿Estás seguro de que quieres bloquear a este usuario? No podrá acceder a la plataforma mientras esté bloqueado."
        }
        confirmText={userToBan?.isBanned ? "Desbloquear" : "Bloquear"}
        cancelText="Cancelar"
      />
      
      <style jsx global>{`
        .elegant-action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: rgba(var(--color-surface-rgb), 0.8);
          border: 1px solid rgba(var(--color-primary-rgb), 0.2);
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .elegant-action-button:hover {
          background-color: rgba(var(--color-surface-rgb), 1);
          border-color: rgba(var(--color-primary-rgb), 0.4);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }
        
        .elegant-action-button:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
} 