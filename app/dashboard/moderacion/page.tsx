"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Search, Filter, Check, X, Eye, MessageSquare, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { ConfirmDialog } from "../../components/ui/ConfirmDialog"
import Link from "next/link"

export default function CommentModerationPage() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [filtros, setFiltros] = useState({
    estado: "" as "" | "pendiente" | "aprobado" | "rechazado",
    sortBy: "recent" as "recent" | "oldest",
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  
  useEffect(() => {
    fetchComments()
  }, [filtros])
  
  const fetchComments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('comments')
        .select('*, profiles(nombre), tributes(nombre, slug)')
      
      // Aplicar filtros
      if (filtros.estado) {
        query = query.eq('estado_check', filtros.estado)
      }
      
      // Ordenar
      if (filtros.sortBy === "oldest") {
        query = query.order('created_at', { ascending: true })
      } else {
        query = query.order('created_at', { ascending: false })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setComments(data || [])
    } catch (error) {
      console.error('Error al cargar comentarios:', error)
      toast.error('No se pudieron cargar los comentarios')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId)
    setIsDeleteDialogOpen(true)
  }
  
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentToDelete)
      
      if (error) throw error
      
      // Actualizar la lista de comentarios
      setComments(comments.filter(comment => comment.id !== commentToDelete))
      
      toast.success('Comentario eliminado correctamente')
    } catch (error) {
      console.error('Error al eliminar comentario:', error)
      toast.error('No se pudo eliminar el comentario')
    } finally {
      setIsDeleteDialogOpen(false)
      setCommentToDelete(null)
    }
  }
  
  const handleApproveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ estado_check: 'aprobado' })
        .eq('id', commentId)
      
      if (error) throw error
      
      // Actualizar la lista de comentarios
      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, estado_check: 'aprobado' } : comment
      ))
      
      toast.success('Comentario aprobado correctamente')
    } catch (error) {
      console.error('Error al aprobar comentario:', error)
      toast.error('No se pudo aprobar el comentario')
    }
  }
  
  const handleRejectComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ estado_check: 'rechazado' })
        .eq('id', commentId)
      
      if (error) throw error
      
      // Actualizar la lista de comentarios
      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, estado_check: 'rechazado' } : comment
      ))
      
      toast.success('Comentario rechazado correctamente')
    } catch (error) {
      console.error('Error al rechazar comentario:', error)
      toast.error('No se pudo rechazar el comentario')
    }
  }
  
  const filteredComments = comments.filter(comment => 
    (comment.contenido && comment.contenido.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (comment.profiles?.nombre && comment.profiles.nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (comment.tributes?.nombre && comment.tributes.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div>
      <h1 className="text-3xl font-andika text-primary mb-8">Moderación de Comentarios</h1>
      
      {/* Buscador y filtros */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text/40" />
          </div>
          <input
            type="text"
            placeholder="Buscar comentarios..."
            className="elegant-input pl-10 pr-4 py-2 w-full rounded-md font-montserrat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        

      </div>
      
      {/* Panel de filtros */}
      {filtrosAbiertos && (
        <div className="elegant-card p-6 rounded-lg mb-8">
          <h2 className="text-lg font-andika text-primary mb-4">Filtros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text/80 mb-2 font-montserrat">
                Estado
              </label>
              <select
                className="elegant-input w-full rounded-md font-montserrat"
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value as any})}
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobado">Aprobados</option>
                <option value="rechazado">Rechazados</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text/80 mb-2 font-montserrat">
                Ordenar por
              </label>
              <select
                className="elegant-input w-full rounded-md font-montserrat"
                value={filtros.sortBy}
                onChange={(e) => setFiltros({...filtros, sortBy: e.target.value as any})}
              >
                <option value="recent">Más recientes primero</option>
                <option value="oldest">Más antiguos primero</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              className="elegant-button px-4 py-2 rounded-md font-andika"
              onClick={() => {
                setFiltros({
                  estado: "",
                  sortBy: "recent",
                })
              }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
      
      {/* Lista de comentarios */}
      <div className="elegant-card p-6 rounded-lg">
        <div className="flex items-center mb-6">
          <MessageSquare className="w-5 h-5 text-primary mr-2" />
          <h2 className="text-xl font-andika text-primary">Comentarios</h2>
          <span className="ml-auto px-3 py-1 bg-primary/10 rounded-full text-sm font-montserrat text-primary">
            {filteredComments.length} comentarios
          </span>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse text-primary text-xl font-andika">
              Cargando comentarios...
            </div>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text/60 font-montserrat">
              No se encontraron comentarios que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="p-6 border border-primary/10 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    {comment.profiles?.nombre ? comment.profiles.nombre.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-text/80 font-montserrat">
                      {comment.profiles?.nombre || 'Usuario desconocido'}
                    </p>
                    <p className="text-xs text-text/60 font-montserrat">
                      {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 py-1 text-xs rounded-full font-montserrat ${
                      comment.estado_check === 'aprobado'
                        ? 'bg-white text-green-800'
                        : comment.estado_check === 'rechazado'
                          ? 'bg-white text-red-800'
                          : 'bg-white text-yellow-800'
                    }`}>
                      {comment.estado_check === 'aprobado' 
                        ? 'Aprobado' 
                        : comment.estado_check === 'rechazado'
                          ? 'Rechazado'
                          : 'Pendiente'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-text/80 font-montserrat whitespace-pre-wrap">{comment.contenido}</p>
                </div>
                
                {comment.tributes && (
                  <div className="mb-4 p-3 bg-primary/5 rounded-md">
                    <p className="text-sm text-text/60 font-montserrat">
                      Comentario en el homenaje: 
                      <Link 
                        href={`/homenaje/${comment.tributes.slug}`} 
                        className="text-primary hover:underline ml-1"
                      >
                        {comment.tributes.nombre}
                      </Link>
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-end space-x-2">
                  {comment.estado_check !== 'aprobado' && (
                    <button 
                      onClick={() => handleApproveComment(comment.id)}
                      className="p-2 rounded-md bg-green-100 text-green-600 hover:bg-green-200 flex items-center"
                      title="Aprobar comentario"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      <span className="text-sm font-montserrat">Aprobar</span>
                    </button>
                  )}
                  
                  {comment.estado_check !== 'rechazado' && (
                    <button 
                      onClick={() => handleRejectComment(comment.id)}
                      className="p-2 rounded-md  hover:bg-red hover:text-white flex items-center"
                      title="Rechazar comentario"
                    >
                      <X className="w-4 h-4 mr-1" />
                      <span className="text-sm font-montserrat">Rechazar</span>
                    </button>
                  )}
                  
                  <Link 
                    href={`/homenaje/${comment.tributes?.slug || '#'}`}
                    className="p-2 rounded-md bg-primary/10 text-primary hover:text-white flex items-center "
                    title="Ver en contexto"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="text-sm font-montserrat">Ver</span>
                  </Link>
                  
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-2 rounded-md  text-red-600 elegant-action-button"
                    title="Eliminar comentario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Diálogo de confirmación para eliminar comentario */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteComment}
        title="Eliminar comentario"
        message="¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer."
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