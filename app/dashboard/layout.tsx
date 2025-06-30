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
  X,
  ChevronLeft
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      }
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      
      try {
        const { data } = await supabase.from("moderators").select("role").eq("id", user.id).maybeSingle()
        
        if (data?.role === "admin") {
          setIsAdmin(true)
        } else {
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

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
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

  const menuItems = [
    { 
      href: "/dashboard", 
      icon: LayoutDashboard, 
      label: "Dashboard",
      isActive: pathname === "/dashboard"
    },
    { 
      href: "/dashboard/usuarios", 
      icon: Users, 
      label: "Usuarios",
      isActive: pathname === "/dashboard/usuarios"
    },
    { 
      href: "/dashboard/homenajes", 
      icon: Heart, 
      label: "Homenajes",
      isActive: pathname === "/dashboard/homenajes"
    },
    { 
      href: "/dashboard/moderacion", 
      icon: MessageSquare, 
      label: "Comentarios",
      isActive: pathname === "/dashboard/moderacion"
    }
  ]

  return (
    <div className="min-h-screen bg-surface flex relative">
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeSidebar}
        />
      )}

      <div className={`
        ${isMobile ? 'fixed' : 'relative'}
        ${sidebarOpen ? (isMobile ? 'w-64' : 'w-64') : (isMobile ? '-translate-x-full' : 'w-20')}
        ${isMobile ? 'z-50' : 'z-30'}
        bg-background border-r border-primary/20 
        transition-all duration-300 ease-in-out
        h-screen flex flex-col
      `}>
        <div className="p-4 border-b border-primary/20">
          <div className="flex items-center justify-between">
            {(sidebarOpen || isMobile) && (
              <h1 className="text-xl font-andika text-primary">Portal Admin</h1>
            )}
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-primary/10 text-primary transition-colors"
              title={sidebarOpen ? "Contraer menú" : "Expandir menú"}
            >
              {sidebarOpen ? (
                isMobile ? <X className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        <nav className="flex-1 mt-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  onClick={isMobile ? closeSidebar : undefined}
                  className={`
                    flex items-center p-3 rounded-md transition-colors
                    ${item.isActive 
                      ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                      : 'text-text/80 hover:text-primary hover:bg-primary/5'
                    }
                  `}
                  title={!sidebarOpen && !isMobile ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {(sidebarOpen || isMobile) && (
                    <span className="font-montserrat ml-3">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 px-4">
            <button 
              onClick={handleLogout}
              className={`
                flex items-center w-full p-3 rounded-md 
                text-text/80 hover:text-red-500 hover:bg-red-500/10 
                transition-colors
              `}
              title={!sidebarOpen && !isMobile ? "Cerrar Sesión" : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || isMobile) && (
                <span className="font-montserrat ml-3">Cerrar Sesión</span>
              )}
            </button>
          </div>
        </nav>
      </div>
      
      {isMobile && !sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-3 rounded-lg bg-background shadow-lg border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
          title="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
      
      <div className={`
        flex-1 overflow-auto
        ${!isMobile && !sidebarOpen ? 'ml-0' : ''}
      `}>
        {!isMobile && !sidebarOpen && (
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-primary/20 p-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-primary/10 text-primary transition-colors"
              title="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        )}
        
        <div className="p-8 md:p-10">
          {children}
        </div>
      </div>
    </div>
  )
} 