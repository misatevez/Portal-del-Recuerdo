"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Settings, Grid, Clock, Loader, Heart, Mail, Calendar } from "lucide-react"
import { useAuth } from "../auth/AuthProvider"
import { supabase, updateTributePremiumStatus } from "../lib/supabase"
import { TributeCard } from "../components/TributeCard"
import type React from "react"
import toast from "react-hot-toast"

export function ProfileContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"homenajes" | "actividad" | "ajustes">("homenajes")
  const [profile, setProfile] = useState({
    nombre: "",
    email: user?.email || "",
    notificaciones: true,
    privacidad: "public" as "public" | "private",
  })

  const [tributes, setTributes] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    async function loadProfileData() {
      setLoading(true)
      try {
        // Cargar perfil
        if (!user) {
          console.error("User is not authenticated")
          setLoading(false)
          return
        }
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          if (profileError.code === "PGRST116") {
            console.log("No profile found, creating a new one")
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({ id: user.id, nombre: user.user_metadata.nombre || "Usuario" })
              .select()
              .single()

            if (createError) {
              console.error("Error creating profile:", createError)
              return
            }

            setProfile((prev) => ({
              ...prev,
              nombre: newProfile.nombre,
            }))
          } else {
            console.error("Error al cargar el perfil:", profileError)
            return
          }
        } else if (profileData) {
          setProfile((prev) => ({
            ...prev,
            nombre: profileData.nombre,
          }))
        }

        // Cargar homenajes
        const { data: tributesData, error: tributesError } = await supabase
          .from("tributes")
          .select(`
            *,
            candles(count)
          `)
          .eq("created_by", user?.id)
          .order("created_at", { ascending: false })

        if (tributesError) {
          console.error("Error al cargar los homenajes:", tributesError)
        } else {
          setTributes(tributesData || [])
        }

        // Cargar actividad reciente
        const { data: activityData, error: activityError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(20)

        if (activityError) {
          console.error("Error al cargar la actividad reciente:", activityError)
        } else {
          setActivity(activityData || [])
        }
      } catch (error) {
        console.error("Error al cargar datos del perfil:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [user, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nombre: profile.nombre,
        })
        .eq("id", user?.id)

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

  const handleEdit = (slug: string) => {
    router.push(`/editar-homenaje/${slug}`)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este homenaje?")) {
      try {
        const { error } = await supabase.from("tributes").delete().eq("id", id)
        if (error) throw error
        setTributes(tributes.filter((tribute) => tribute.id !== id))
        toast.success("Homenaje eliminado con éxito")
      } catch (error) {
        console.error("Error al eliminar el homenaje:", error)
        toast.error("Error al eliminar el homenaje")
      }
    }
  }

  const handleTogglePremium = async (id: string) => {
    const tribute = tributes.find((t) => t.id === id)
    if (!tribute) return

    try {
      const newPremiumStatus = !tribute.es_premium
      await updateTributePremiumStatus(id, newPremiumStatus)
      setTributes(tributes.map((t) => (t.id === id ? { ...t, es_premium: newPremiumStatus } : t)))
      toast.success(newPremiumStatus ? "Homenaje actualizado a premium" : "Homenaje cambiado a estándar")
    } catch (error) {
      console.error("Error al actualizar el estado premium:", error)
      toast.error("Error al actualizar el estado del homenaje")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="elegant-card p-8 rounded-lg text-center">
          <h2 className="text-2xl font-andika text-primary mb-4">Acceso no autorizado</h2>
          <p className="text-text/80 font-montserrat mb-6">Por favor, inicia sesión para ver tu perfil.</p>
          <button onClick={() => router.push("/login")} className="elegant-button px-6 py-2 rounded-md font-andika">
            Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
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
                {profile.email}
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
                    <TributeCard
                      key={tribute.id}
                      id={tribute.id}
                      slug={tribute.slug}
                      nombre={tribute.nombre}
                      fechaNacimiento={tribute.fecha_nacimiento}
                      fechaFallecimiento={tribute.fecha_fallecimiento}
                      imagen={tribute.imagen_principal || "/placeholder.svg"}
                      isOwner={true}
                      onEdit={() => handleEdit(tribute.slug)}
                      onDelete={() => handleDelete(tribute.id)}
                      onTogglePremium={() => handleTogglePremium(tribute.id)}
                    />
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
                        value={profile.email}
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
                      <label className="block text-sm font-medium text-text/80 mb-2 font-montserrat">Privacidad</label>
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
    </>
  )
}

