"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Users, Heart, MessageSquare, Calendar, TrendingUp, Activity, Flame, Star } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTributes: 0,
    totalComments: 0,
    totalCandles: 0,
    premiumTributes: 0,
    recentTributes: 0,
    recentUsers: 0
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchStats()
  }, [])
  
  const fetchStats = async () => {
    setLoading(true)
    try {
      // Obtener estadísticas de usuarios
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      // Obtener estadísticas de homenajes
      const { count: totalTributes } = await supabase
        .from('tributes')
        .select('*', { count: 'exact', head: true })
      
      // Obtener estadísticas de homenajes premium
      const { count: premiumTributes } = await supabase
        .from('tributes')
        .select('*', { count: 'exact', head: true })
        .eq('es_premium', true)
      
      // Obtener estadísticas de comentarios
      const { count: totalComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
      
      // Obtener estadísticas de velas
      const { count: totalCandles } = await supabase
        .from('candles')
        .select('*', { count: 'exact', head: true })
      
      // Obtener homenajes recientes (último mes)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: recentTributes } = await supabase
        .from('tributes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())
      
      // Obtener usuarios recientes (último mes)
      const { count: recentUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())
      
      setStats({
        totalUsers: totalUsers || 0,
        totalTributes: totalTributes || 0,
        totalComments: totalComments || 0,
        totalCandles: totalCandles || 0,
        premiumTributes: premiumTributes || 0,
        recentTributes: recentTributes || 0,
        recentUsers: recentUsers || 0
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Obtener homenajes recientes
  const [recentTributes, setRecentTributes] = useState<any[]>([])
  
  useEffect(() => {
    fetchRecentTributes()
  }, [])
  
  const fetchRecentTributes = async () => {
    try {
      const { data, error } = await supabase
        .from('tributes')
        .select('*, profiles(nombre)')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) throw error
      
      setRecentTributes(data || [])
    } catch (error) {
      console.error('Error al cargar homenajes recientes:', error)
    }
  }
  
  // Obtener usuarios recientes
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  
  useEffect(() => {
    fetchRecentUsers()
  }, [])
  
  const fetchRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) throw error
      
      setRecentUsers(data || [])
    } catch (error) {
      console.error('Error al cargar usuarios recientes:', error)
    }
  }
  
  // Obtener comentarios recientes
  const [recentComments, setRecentComments] = useState<any[]>([])
  
  useEffect(() => {
    fetchRecentComments()
  }, [])
  
  const fetchRecentComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(nombre), tributes(nombre, slug)')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) throw error
      
      setRecentComments(data || [])
    } catch (error) {
      console.error('Error al cargar comentarios recientes:', error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-andika text-primary mb-8">Dashboard</h1>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="elegant-card p-6 rounded-lg flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-montserrat text-text/60">Usuarios Totales</h2>
            <p className="text-2xl font-andika text-primary">{loading ? '...' : stats.totalUsers}</p>
            <p className="text-xs font-montserrat text-text/60">
              {loading ? '...' : `+${stats.recentUsers} este mes`}
            </p>
          </div>
        </div>
        
        <div className="elegant-card p-6 rounded-lg flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-montserrat text-text/60">Homenajes Totales</h2>
            <p className="text-2xl font-andika text-primary">{loading ? '...' : stats.totalTributes}</p>
            <p className="text-xs font-montserrat text-text/60">
              {loading ? '...' : `+${stats.recentTributes} este mes`}
            </p>
          </div>
        </div>
        
        <div className="elegant-card p-6 rounded-lg flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-montserrat text-text/60">Comentarios</h2>
            <p className="text-2xl font-andika text-primary">{loading ? '...' : stats.totalComments}</p>
          </div>
        </div>
        
        <div className="elegant-card p-6 rounded-lg flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-montserrat text-text/60">Velas Encendidas</h2>
            <p className="text-2xl font-andika text-primary">{loading ? '...' : stats.totalCandles}</p>
          </div>
        </div>
      </div>
      
      {/* Tarjeta de homenajes premium */}
      <div className="elegant-card p-6 rounded-lg mb-8">
        <div className="flex items-center mb-4">
          <Star className="w-5 h-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-andika text-primary">Homenajes Premium</h2>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-andika text-primary">{loading ? '...' : stats.premiumTributes}</p>
            <p className="text-sm font-montserrat text-text/60">
              {loading ? '...' : `${Math.round((stats.premiumTributes / stats.totalTributes) * 100) || 0}% del total`}
            </p>
          </div>
          
          <Link 
            href="/dashboard/homenajes?premium=true" 
            className="elegant-button px-4 py-2 rounded-md font-andika text-sm"
          >
            Ver homenajes premium
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Homenajes recientes */}
        <div className="elegant-card p-6 rounded-lg">
          <h2 className="text-xl font-andika text-primary mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Homenajes Recientes
          </h2>
          
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
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {recentTributes.map((tribute) => (
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
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/80 font-montserrat">
                      {tribute.profiles?.nombre || 'Usuario desconocido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60 font-montserrat">
                      {new Date(tribute.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-montserrat ${
                        tribute.es_premium 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tribute.es_premium ? 'Premium' : 'Estándar'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Comentarios recientes */}
        <div className="elegant-card p-6 rounded-lg">
          <h2 className="text-xl font-andika text-primary mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Comentarios Recientes
          </h2>
          
          <div className="space-y-4">
            {recentComments.map((comment) => (
              <div key={comment.id} className="p-4 border border-primary/10 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    {comment.profiles?.nombre ? comment.profiles.nombre.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-text/80 font-montserrat">
                      {comment.profiles?.nombre || 'Usuario desconocido'}
                    </p>
                    <p className="text-xs text-text/60 font-montserrat">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 py-1 text-xs rounded-full font-montserrat ${
                      comment.estado_check === 'aprobado'
                        ? 'bg-green-100 text-green-800'
                        : comment.estado_check === 'rechazado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
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
                <p className="text-sm text-text/80 font-montserrat line-clamp-2">{comment.contenido}</p>
                {comment.tributes && (
                  <p className="text-xs text-text/60 font-montserrat mt-2">
                    En: <Link href={`/homenaje/${comment.tributes.slug}`} className="text-primary hover:underline">
                      {comment.tributes.nombre}
                    </Link>
                  </p>
                )}
              </div>
            ))}
            
            {recentComments.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-text/60 font-montserrat">
                  No hay comentarios recientes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Usuarios recientes */}
      <div className="elegant-card p-6 rounded-lg mt-8">
        <h2 className="text-xl font-andika text-primary mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Usuarios Recientes
        </h2>
        
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
                <th className="px-6 py-3 text-left text-xs font-medium text-text/80 uppercase tracking-wider font-montserrat">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                        {user.nombre ? user.nombre.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-text/80 font-montserrat">{user.nombre || 'Sin nombre'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text/80 font-montserrat">
                    {user.email || 'No disponible'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60 font-montserrat">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-montserrat ${
                      user.is_active !== false
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 