"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"
import { 
  LayoutDashboard, 
  Users, 
  Heart, 
  MessageSquare, 
  LogOut,
  Menu,
  X
} from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      
      // Verificar si el usuario es admin usando exactamente la misma lógica que en Navbar.tsx
      try {
        const { data } = await supabase.from("moderators").select("role").eq("id", user.id).maybeSingle()
        
        if (data?.role === "admin") {
          setIsAdmin(true)
        } else {
          // Si no es admin, redirigir a la página principal
          router.push('/')
          return
        }
      } catch (err) {
        console.error("Error checking admin status:", err)
        router.push('/')
        return
      }
      
      setLoading(false)
    }
    
    checkUser()
  }, [router])
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse text-primary text-2xl font-andika">
          Cargando...
        </div>
      </div>
    )
  }
  
  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar para pantallas medianas y grandes */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-background border-r border-primary/20 hidden md:block transition-all duration-300 ease-in-out`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-andika text-primary">Portal Admin</h1>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-primary/10 text-primary"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            <li>
              <Link 
                href="/dashboard" 
                className="flex items-center p-3 rounded-md hover:bg-primary/10 text-text/80 hover:text-primary transition-colors"
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                {sidebarOpen && <span className="font-montserrat">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/usuarios" 
                className="flex items-center p-3 rounded-md hover:bg-primary/10 text-text/80 hover:text-primary transition-colors"
              >
                <Users className="w-5 h-5 mr-3" />
                {sidebarOpen && <span className="font-montserrat">Usuarios</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/homenajes" 
                className="flex items-center p-3 rounded-md hover:bg-primary/10 text-text/80 hover:text-primary transition-colors"
              >
                <Heart className="w-5 h-5 mr-3" />
                {sidebarOpen && <span className="font-montserrat">Homenajes</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/moderacion" 
                className="flex items-center p-3 rounded-md hover:bg-primary/10 text-text/80 hover:text-primary transition-colors"
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                {sidebarOpen && <span className="font-montserrat">Comentarios</span>}
              </Link>
            </li>
            <li className="mt-8">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full p-3 rounded-md hover:bg-red-500/10 text-text/80 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {sidebarOpen && <span className="font-montserrat">Cerrar Sesión</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Sidebar móvil */}
      <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" style={{ display: sidebarOpen ? 'block' : 'none' }}>
        <div className="w-64 h-full bg-background">
          <div className="p-6 flex justify-between items-center">
            <h1 className="text-xl font-andika text-primary">Portal Admin</h1>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-primary/10 text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="mt-6">
            <ul className="space-y-2 px-4">
              <li>
                <Link 
                  href="/dashboard" 
                  className="flex items-center p-3 rounded-md hover:bg-primary/10 text-text/80 hover:text-primary transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  <span className="font-montserrat">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/usuarios" 
                  className="flex items-center p-3 rounded-md hover:bg-primary/10 text-text/80 hover:text-primary transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Users className="w-5 h-5 mr-3" />
                  <span className="font-montserrat">Usuarios</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/homenajes" 
                  className="flex items-center p-3 rounded-md hover:bg-primary/10 text-text/80 hover:text-primary transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Heart className="w-5 h-5 mr-3" />
                  <span className="font-montserrat">Homenajes</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/moderacion" 
                  className="flex items-center p-3 rounded-md hover:bg-primary/10 text-text/80 hover:text-primary transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <MessageSquare className="w-5 h-5 mr-3" />
                  <span className="font-montserrat">Comentarios</span>
                </Link>
              </li>
              <li className="mt-8">
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full p-3 rounded-md hover:bg-red-500/10 text-text/80 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span className="font-montserrat">Cerrar Sesión</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      
      {/* Botón de menú móvil */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md bg-background shadow-md text-primary"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 p-8 md:p-10 overflow-auto">
        {children}
      </div>
    </div>
  )
} 