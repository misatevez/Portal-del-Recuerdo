"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Settings, Grid, Clock, Loader, Heart, Mail, Calendar } from "lucide-react"
import { TributeCard } from "../components/TributeCard";
import { CreditManager } from "../components/credits/CreditManager";
import { supabase, updateTributePremiumStatus } from "../lib/supabase"
import type { ProfileContentProps, Tribute } from "../types"
import { toast } from "react-hot-toast"
import { ConfirmDialog } from "../components/ui/ConfirmDialog"

export function ProfileContent({
  user,
  profile: initialProfile,
  tributes: initialTributes,
  activity: initialActivity,
  userCredits,
}: ProfileContentProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"homenajes" | "actividad" | "ajustes">("homenajes")
  const [profile, setProfile] = useState(initialProfile)
  const [tributes, setTributes] = useState<Tribute[]>(initialTributes)
  const [activity, setActivity] = useState(initialActivity)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tributeToDelete, setTributeToDelete] = useState<string | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nombre: profile.nombre,
          notificaciones: profile.notificaciones,
          privacidad: profile.privacidad,
        })
        .eq("id", user.id)

      if (error) throw error
      alert("Perfil actualizado correctamente")
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      alert("Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const handleEdit = (tributeSlug: string) => {
    router.push(`/editar-homenaje/${tributeSlug}`)
  }

  const handleDelete = (tributeId: string) => {
    setTributeToDelete(tributeId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteTribute = async () => {
    if (!tributeToDelete) return
    
    try {
      const { error } = await supabase.from("tributes").delete().eq("id", tributeToDelete)
      if (error) throw error
      
      setTributes(tributes.filter((tribute) => tribute.id !== tributeToDelete))
      toast.success("Homenaje eliminado con éxito")
    } catch (error) {
      console.error("Error al eliminar el homenaje:", error)
      toast.error("Error al eliminar el homenaje")
    } finally {
      setTributeToDelete(null)
    }
  }



  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Cabecera del Perfil */}
        <div className="elegant-card p-8 rounded-lg mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-andika text-primary">{profile.nombre}</h1>
              <div className="flex items-center gap-4 mt-2 text-text/60 font-montserrat">
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {user.email}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Miembro desde {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por Pestañas */}
        <div className="border-b border-primary/20 mb-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("homenajes")}
              className={`pb-4 relative font-andika ${
                activeTab === "homenajes" ? "text-primary border-b-2 border-primary" : "text-text/60 hover:text-text"
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5" />
                <span>Mis Homenajes</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("actividad")}
              className={`pb-4 relative font-andika ${
                activeTab === "actividad" ? "text-primary border-b-2 border-primary" : "text-text/60 hover:text-text"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Actividad Reciente</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("ajustes")}
              className={`pb-4 relative font-andika ${
                activeTab === "ajustes" ? "text-primary border-b-2 border-primary" : "text-text/60 hover:text-text"
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <span>Ajustes</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Contenido de las Pestañas */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Mis Homenajes */}
            {activeTab === "homenajes" && (
              <div>
                {tributes.length === 0 ? (
                  <div className="elegant-card p-12 text-center">
                    <Heart className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                    <p className="text-text/80 mb-6 font-montserrat">Aún no has creado ningún homenaje.</p>
                    <button
                      onClick={() => router.push("/crear-homenaje")}
                      className="elegant-button px-6 py-2 rounded-md font-andika"
                    >
                      Crear Homenaje
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tributes.map((tribute) => (
                      <div key={tribute.id} className="flex flex-col gap-4">
                        <TributeCard
                          id={tribute.id}
                          slug={tribute.slug}
                          nombre={tribute.nombre}
                          fechaNacimiento={tribute.fecha_nacimiento}
                          fechaFallecimiento={tribute.fecha_fallecimiento}
                          imagen={tribute.imagen_principal || "/placeholder.svg"}
                          isOwner={true}
                          isPremium={tribute.is_premium}
                          onEdit={() => handleEdit(tribute.slug)}
                          onDelete={() => handleDelete(tribute.id)}
                          actionSlot={
                            !tribute.is_premium && userCredits > 0 ? (
                              <CreditManager
                                userId={user.id}
                                tribute={tribute}
                                renderAs="button"
                                onCreditApplied={() => {
                                  const updatedTributes = tributes.map((t) =>
                                    t.id === tribute.id ? { ...t, is_premium: true } : t
                                  )
                                  setTributes(updatedTributes)
                                }}
                              />
                            ) : null
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actividad Reciente */}
            {activeTab === "actividad" && (
              <div className="space-y-4">
                {activity.length === 0 ? (
                  <div className="elegant-card p-12 text-center">
                    <Clock className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                    <p className="text-text/80 font-montserrat">No hay actividad reciente.</p>
                  </div>
                ) : (
                  activity.map((item) => (
                    <div key={item.id} className="elegant-card p-4 rounded-lg flex items-start gap-4">
                      <div className="text-2xl">
                        {item.tipo === "vela" ? "🕯️" : item.tipo === "comentario" ? "💬" : "📢"}
                      </div>
                      <div>
                        <p className="text-text font-montserrat">{item.mensaje}</p>
                        <p className="text-sm text-text/60 mt-1 font-montserrat">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Ajustes */}
            {activeTab === "ajustes" && (
              <div className="max-w-2xl">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="elegant-card p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-primary mb-6 font-andika">Información Personal</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text/80 mb-2 font-montserrat">Nombre</label>
                        <input
                          type="text"
                          value={profile.nombre}
                          onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                          className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text/80 mb-2 font-montserrat">Email</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-3 py-2 border border-primary/20 rounded-md bg-surface/50 text-text/60 font-montserrat"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="elegant-card p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-primary mb-6 font-andika">Preferencias</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.notificaciones}
                            onChange={(e) => setProfile({ ...profile, notificaciones: e.target.checked })}
                            className="h-4 w-4 rounded border-primary/30 bg-surface text-primary focus:ring-primary/50"
                          />
                          <span className="ml-2 text-text/80 font-montserrat">Recibir notificaciones por email</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text/80 mb-2 font-montserrat">
                          Privacidad
                        </label>
                        <select
                          value={profile.privacidad}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              privacidad: e.target.value as "public" | "private",
                            })
                          }
                          className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                        >
                          <option value="public">Público</option>
                          <option value="private">Privado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Sección de Créditos */}
                  {user && <CreditManager userId={user.id} />}

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-4 py-2 border border-primary/30 rounded-md text-text hover:bg-primary/10 font-andika"
                    >
                      Cerrar Sesión
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="elegant-button px-6 py-2 rounded-md disabled:opacity-50 font-andika"
                    >
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

        {/* Diálogo de confirmación para eliminar homenajes */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteTribute}
          title="Eliminar homenaje"
          message="¿Estás seguro de que quieres eliminar este homenaje? Esta acción no se puede deshacer y se perderán todos los datos asociados."
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      </div>
    </div>
  )
}

