"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { supabaseAdmin } from "../../lib/supabaseAdmin"
import { Search, UserPlus, Edit, Trash2, Check, X, Mail } from "lucide-react"
import { toast } from "react-hot-toast"
import { ConfirmDialog } from "../../components/ui/ConfirmDialog"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
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
      // Eliminar de la tabla activa
      const { error } = await supabase
        .from(activeTable)
        .delete()
        .eq('id', userToDelete)
      
      if (error) throw error
      
      // Actualizar la lista de usuarios
      setUsers(users.filter(user => user.id !== userToDelete))
      
      toast.success('Usuario eliminado correctamente')
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      toast.error('No se pudo eliminar el usuario')
    } finally {
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
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
        toast.info('Esta acción no está disponible para usuarios de la tabla usuarios')
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

  return (
    <div>
      <h1 className="text-3xl font-andika text-primary mb-8">Gestión de Usuarios</h1>
      
      {/* Buscador y botón de añadir */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text/40" />
          </div>
          <input
            type="text"
            placeholder="Buscar usuarios por nombre o email..."
            className="elegant-input pl-10 pr-4 py-2 w-full rounded-md font-montserrat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button className="elegant-button px-4 py-2 rounded-md font-andika flex items-center">
          <UserPlus className="h-5 w-5 mr-2" />
          Añadir Usuario
        </button>
      </div>
      
      {/* Indicador de tabla activa */}
      <div className="mb-4">
        <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-montserrat text-primary">
          Mostrando datos de la tabla: {activeTable}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-montserrat ${
                        isUserActive(user)
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isUserActive(user) ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {activeTable === 'profiles' && (
                          <button 
                            onClick={() => toggleUserStatus(user.id, isUserActive(user))}
                            className={`p-1.5 rounded-full ${
                              isUserActive(user)
                                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={isUserActive(user) ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {isUserActive(user) ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                        )}
                        <button 
                          className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                          title="Enviar correo"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
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
        message="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer y se eliminarán todos los datos asociados."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
} 