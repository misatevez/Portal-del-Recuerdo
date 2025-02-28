"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { AlertTriangle, Check, X, Eye, MessageSquare } from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved' | 'dismissed'>('pending')
  
  useEffect(() => {
    fetchReports()
  }, [activeTab])
  
  const fetchReports = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('reports')
        .select('*, profiles!reports_reporter_id_fkey(nombre), tributes(nombre, slug)')
      
      if (activeTab === 'pending') {
        query = query.eq('status', 'pendiente')
      } else if (activeTab === 'resolved') {
        query = query.eq('status', 'resuelto')
      } else if (activeTab === 'dismissed') {
        query = query.eq('status', 'descartado')
      }
      
      query = query.order('created_at', { ascending: false })
      
      const { data, error } = await query
      
      if (error) throw error
      
      setReports(data || [])
    } catch (error) {
      console.error('Error al cargar reportes:', error)
      toast.error('No se pudieron cargar los reportes')
    } finally {
      setLoading(false)
    }
  }
  
  const resolveReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resuelto' })
        .eq('id', reportId)
      
      if (error) throw error
      
      // Actualizar la lista de reportes
      if (activeTab === 'pending') {
        setReports(reports.filter(report => report.id !== reportId))
      } else {
        fetchReports()
      }
      
      toast.success('Reporte marcado como resuelto')
    } catch (error) {
      console.error('Error al resolver reporte:', error)
      toast.error('No se pudo resolver el reporte')
    }
  }
  
  const dismissReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'descartado' })
        .eq('id', reportId)
      
      if (error) throw error
      
      // Actualizar la lista de reportes
      if (activeTab === 'pending') {
        setReports(reports.filter(report => report.id !== reportId))
      } else {
        fetchReports()
      }
      
      toast.success('Reporte descartado')
    } catch (error) {
      console.error('Error al descartar reporte:', error)
      toast.error('No se pudo descartar el reporte')
    }
  }
  
  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
      
      if (error) throw error
      
      // Actualizar la lista de reportes
      setReports(reports.filter(report => report.id !== reportId))
      
      toast.success('Reporte eliminado correctamente')
    } catch (error) {
      console.error('Error al eliminar reporte:', error)
      toast.error('No se pudo eliminar el reporte')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-andika text-primary mb-8">Gestión de Reportes</h1>
      
      {/* Pestañas */}
      <div className="mb-8 border-b border-primary/20">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-4 font-montserrat relative ${
              activeTab === 'pending'
                ? 'text-primary font-medium'
                : 'text-text/60 hover:text-text/80'
            }`}
          >
            Pendientes
            {activeTab === 'pending' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`pb-4 font-montserrat relative ${
              activeTab === 'resolved'
                ? 'text-primary font-medium'
                : 'text-text/60 hover:text-text/80'
            }`}
          >
            Resueltos
            {activeTab === 'resolved' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('dismissed')}
            className={`pb-4 font-montserrat relative ${
              activeTab === 'dismissed'
                ? 'text-primary font-medium'
                : 'text-text/60 hover:text-text/80'
            }`}
          >
            Descartados
            {activeTab === 'dismissed' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
            )}
          </button>
        </div>
      </div>
      
      {/* Lista de reportes */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-8 text-center elegant-card rounded-lg">
            <div className="animate-pulse text-primary text-xl font-andika">
              Cargando reportes...
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center elegant-card rounded-lg">
            <p className="text-text/60 font-montserrat">
              {activeTab === 'pending'
                ? 'No hay reportes pendientes.'
                : activeTab === 'resolved'
                ? 'No hay reportes resueltos.'
                : 'No hay reportes descartados.'}
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="elegant-card p-6 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium text-text/80 font-montserrat">
                        Reporte de {report.profiles?.nombre || 'Usuario desconocido'}
                      </p>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 font-montserrat">
                        {report.tipo}
                      </span>
                    </div>
                    <p className="text-sm text-text/60 font-montserrat">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                    <div className="mt-4 text-text/80 font-montserrat">
                      <p className="font-medium mb-1">Motivo:</p>
                      {report.motivo}
                    </div>
                    <div className="mt-2">
                      {report.tributes && (
                        <Link
                          href={`/homenaje/${report.tributes?.slug}`}
                          className="text-sm text-primary hover:underline font-montserrat flex items-center"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Homenaje: {report.tributes?.nombre || 'Homenaje desconocido'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {activeTab === 'pending' && (
                    <>
                      <button
                        onClick={() => resolveReport(report.id)}
                        className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                        title="Marcar como resuelto"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => dismissReport(report.id)}
                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                        title="Descartar reporte"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    title="Eliminar reporte"
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                  {report.tributes && (
                    <Link
                      href={`/homenaje/${report.tributes?.slug}`}
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                      title="Ver en contexto"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
              
              {activeTab !== 'pending' && (
                <div className="mt-4 pt-4 border-t border-primary/10">
                  <span className={`px-2 py-1 text-xs rounded-full font-montserrat ${
                    activeTab === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activeTab === 'resolved' ? 'Resuelto' : 'Descartado'}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 