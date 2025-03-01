"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Search, Filter, Edit, Trash2, Star, Eye, Calendar } from "lucide-react"
import { toast } from "react-hot-toast"
import { ConfirmDialog } from "../../components/ui/ConfirmDialog"
import Link from "next/link"

export default function TributesPage() {
  const [tributes, setTributes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [filtros, setFiltros] = useState({
    year: "",
    isPremium: "",
    sortBy: "recent" as "recent" | "name" | "views",
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tributeToDelete, setTributeToDelete] = useState<string | null>(null)
  
  useEffect(() => {
    fetchTributes()
  }, [filtros])
  
  const fetchTributes = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('tributes')
        .select('*, profiles(nombre)')
      
      // Aplicar filtros
      if (filtros.year) {
        const startDate = new Date(`${filtros.year}-01-01`).toISOString()
        const endDate = new Date(`${parseInt(filtros.year) + 1}-01-01`).toISOString()
        query = query.gte('fecha_fallecimiento', startDate).lt('fecha_fallecimiento', endDate)
      }
      
      if (filtros.isPremium) {
        query = query.eq('is_premium', filtros.isPremium === 'premium')
      }
      
      // Aplicar ordenamiento
      if (filtros.sortBy === 'recent') {
        query = query.order('created_at', { ascending: false })
      } else if (filtros.sortBy === 'name') {
        query = query.order('nombre', { ascending: true })
      } else if (filtros.sortBy === 'views') {
        query = query.order('views', { ascending: false })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setTributes(data || [])
    } catch (error) {
      console.error('Error al cargar homenajes:', error)
      toast.error('No se pudieron cargar los homenajes')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteTribute = (tributeId: string) => {
    setTributeToDelete(tributeId)
    setIsDeleteDialogOpen(true)
  }
  
  const confirmDeleteTribute = async () => {
    if (!tributeToDelete) return
    
    try {
      const { error } = await supabase
        .from('tributes')
        .delete()
        .eq('id', tributeToDelete)
      
      if (error) throw error
      
      // Actualizar la lista de homenajes
      setTributes(tributes.filter(tribute => tribute.id !== tributeToDelete))
      
      toast.success('Homenaje eliminado correctamente')
    } catch (error) {
      console.error('Error al eliminar homenaje:', error)
      toast.error('No se pudo eliminar el homenaje')
    } finally {
      setIsDeleteDialogOpen(false)
      setTributeToDelete(null)
    }
  }
  
  const togglePremiumStatus = async (tributeId: string, isPremium: boolean) => {
    try {
      const { error } = await supabase
        .from('tributes')
        .update({ is_premium: !isPremium })
        .eq('id', tributeId)
      
      if (error) throw error
      
      // Actualizar la lista de homenajes
      setTributes(tributes.map(tribute => 
        tribute.id === tributeId ? { ...tribute, is_premium: !isPremium } : tribute
      ))
      
      toast.success(`Homenaje ${!isPremium ? 'marcado como premium' : 'desmarcado como premium'} correctamente`)
    } catch (error) {
      console.error('Error al cambiar estado premium:', error)
      toast.error('No se pudo cambiar el estado premium del homenaje')
    }
  }
  
  const filteredTributes = tributes.filter(tribute => 
    tribute.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tribute.profiles?.nombre && tribute.profiles.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div>
      <h1 className="text-3xl font-andika text-primary mb-8">Gestión de Homenajes</h1>
      
      {/* Buscador y filtros */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text/40" />
          </div>
          <input
            type="text"
            placeholder="Buscar homenajes..."
            className="elegant-input pl-10 pr-4 py-2 w-full rounded-md font-montserrat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        

      </div>
      
      {/* Panel de filtros */}
      {filtrosAbiertos && (
        <div className="mb-8 elegant-card p-6 rounded-lg">
          <h2 className="text-lg font-andika text-primary mb-4">Filtros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                Año de fallecimiento
              </label>
              <select
                className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                value={filtros.year}
                onChange={(e) => setFiltros({ ...filtros, year: e.target.value })}
              >
                <option value="">Todos los años</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                Tipo de homenaje
              </label>
              <select
                className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                value={filtros.isPremium}
                onChange={(e) => setFiltros({ ...filtros, isPremium: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="premium">Premium</option>
                <option value="standard">Estándar</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                Ordenar por
              </label>
              <select
                className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                value={filtros.sortBy}
                onChange={(e) => setFiltros({ ...filtros, sortBy: e.target.value as any })}
              >
                <option value="recent">Más recientes</option>
                <option value="name">Nombre</option>
                <option value="views">Más vistos</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Lista de homenajes */}
      <div className="elegant-card p-6 rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse text-primary text-xl font-andika">
              Cargando homenajes...
            </div>
          </div>
        ) : filteredTributes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text/60 font-montserrat">
              No se encontraron homenajes que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary/10">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Homenaje
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Creador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Fecha de creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Visitas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {filteredTributes.map((tribute) => (
                  <tr key={tribute.id} className="hover:bg-surface/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-primary/10">
                          <img 
                            src={tribute.imagen_principal || "https://via.placeholder.com/40"} 
                            alt={tribute.nombre}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-text/80 font-montserrat">{tribute.nombre}</p>
                          <p className="text-xs text-text/60 font-montserrat">
                            {tribute.fecha_nacimiento && tribute.fecha_fallecimiento ? 
                              `${new Date(tribute.fecha_nacimiento).getFullYear()} - ${new Date(tribute.fecha_fallecimiento).getFullYear()}` : 
                              'Sin fechas'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/80 font-montserrat">
                      {tribute.profiles?.nombre || 'Usuario desconocido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60 font-montserrat">
                      {new Date(tribute.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60 font-montserrat">
                      {tribute.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-montserrat ${
                        tribute.is_premium 
                      }`}>
                        {tribute.is_premium ? 'Premium' : 'Estándar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          href={`/homenaje/${tribute.slug}`}
                          className="p-1.5 rounded-full  elegant-action-button hover:text-white "
                          title="Ver homenaje"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button   
                          onClick={() => togglePremiumStatus(tribute.id, tribute.is_premium)}
                          className={`p-1.5 rounded-full elegant-action-button hover:text-white ${
                            tribute.is_premium 
                             
                          }`}
                          title={tribute.is_premium ? 'Quitar premium' : 'Marcar como premium'}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <Link 
                          href={`/editar-homenaje/${tribute.slug}`}
                          className="p-1.5 rounded-full bg-primary/10 text-primary hover:text-white elegant-action-button "
                          title="Editar homenaje"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteTribute(tribute.id)}
                          className="p-1.5 rounded-full text-red-600 hover:bg-red elegant-action-button "

                          title="Eliminar homenaje"
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
      
      {/* Diálogo de confirmación para eliminar homenaje */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteTribute}
        title="Eliminar homenaje"
        message="¿Estás seguro de que quieres eliminar este homenaje? Esta acción no se puede deshacer y se eliminarán todos los datos asociados, incluyendo comentarios y velas."
        confirmText="Eliminar"
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