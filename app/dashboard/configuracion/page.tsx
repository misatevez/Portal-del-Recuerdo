"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Save, RefreshCw } from "lucide-react"
import { toast } from "react-hot-toast"

interface SiteConfig {
  site_name: string
  site_description: string
  contact_email: string
  maintenance_mode: boolean
  auto_approve_comments: boolean
  max_candles_per_day: number
  premium_price: number
  terms_and_conditions: string
  privacy_policy: string
}

export default function ConfigurationPage() {
  const [config, setConfig] = useState<SiteConfig>({
    site_name: "Portal del Recuerdo",
    site_description: "Un espacio para honrar la memoria de tus seres queridos",
    contact_email: "contacto@elportaldelrecuerdo.com",
    maintenance_mode: false,
    auto_approve_comments: false,
    max_candles_per_day: 5,
    premium_price: 9.99,
    terms_and_conditions: "",
    privacy_policy: ""
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    fetchConfig()
  }, [])
  
  const fetchConfig = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .single()
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 es el código para "no se encontraron resultados"
        throw error
      }
      
      if (data) {
        setConfig(data)
      }
    } catch (error) {
      console.error('Error al cargar la configuración:', error)
      toast.error('No se pudo cargar la configuración del sitio')
    } finally {
      setLoading(false)
    }
  }
  
  const saveConfig = async () => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('site_config')
        .upsert(config)
        .select()
        .single()
      
      if (error) throw error
      
      setConfig(data)
      toast.success('Configuración guardada correctamente')
    } catch (error) {
      console.error('Error al guardar la configuración:', error)
      toast.error('No se pudo guardar la configuración del sitio')
    } finally {
      setSaving(false)
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setConfig({ ...config, [name]: checked })
    } else if (type === 'number') {
      setConfig({ ...config, [name]: parseFloat(value) })
    } else {
      setConfig({ ...config, [name]: value })
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-andika text-primary mb-8">Configuración del Sitio</h1>
      
      {loading ? (
        <div className="p-8 text-center elegant-card rounded-lg">
          <div className="animate-pulse text-primary text-xl font-andika">
            Cargando configuración...
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Configuración general */}
          <div className="elegant-card p-6 rounded-lg">
            <h2 className="text-xl font-andika text-primary mb-4">Configuración General</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                  Nombre del Sitio
                </label>
                <input
                  type="text"
                  name="site_name"
                  value={config.site_name}
                  onChange={handleChange}
                  className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={config.contact_email}
                  onChange={handleChange}
                  className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                  Descripción del Sitio
                </label>
                <textarea
                  name="site_description"
                  value={config.site_description}
                  onChange={handleChange}
                  rows={3}
                  className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                />
              </div>
            </div>
          </div>
          
          {/* Configuración de funcionalidades */}
          <div className="elegant-card p-6 rounded-lg">
            <h2 className="text-xl font-andika text-primary mb-4">Funcionalidades</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenance_mode"
                  name="maintenance_mode"
                  checked={config.maintenance_mode}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-primary/30 rounded"
                />
                <label htmlFor="maintenance_mode" className="ml-2 block text-sm text-text/80 font-montserrat">
                  Modo de Mantenimiento
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto_approve_comments"
                  name="auto_approve_comments"
                  checked={config.auto_approve_comments}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-primary/30 rounded"
                />
                <label htmlFor="auto_approve_comments" className="ml-2 block text-sm text-text/80 font-montserrat">
                  Aprobar Comentarios Automáticamente
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                  Máximo de Velas por Día
                </label>
                <input
                  type="number"
                  name="max_candles_per_day"
                  value={config.max_candles_per_day}
                  onChange={handleChange}
                  min={1}
                  max={100}
                  className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                  Precio Premium (USD)
                </label>
                <input
                  type="number"
                  name="premium_price"
                  value={config.premium_price}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                />
              </div>
            </div>
          </div>
          
          {/* Términos y políticas */}
          <div className="elegant-card p-6 rounded-lg">
            <h2 className="text-xl font-andika text-primary mb-4">Términos y Políticas</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                  Términos y Condiciones
                </label>
                <textarea
                  name="terms_and_conditions"
                  value={config.terms_and_conditions}
                  onChange={handleChange}
                  rows={6}
                  className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                  placeholder="Ingresa los términos y condiciones del sitio..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                  Política de Privacidad
                </label>
                <textarea
                  name="privacy_policy"
                  value={config.privacy_policy}
                  onChange={handleChange}
                  rows={6}
                  className="elegant-input w-full px-3 py-2 rounded-md font-montserrat"
                  placeholder="Ingresa la política de privacidad del sitio..."
                />
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={fetchConfig}
              className="px-4 py-2 border border-primary/30 rounded-md text-text/80 hover:bg-primary/10 font-montserrat flex items-center"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar
            </button>
            <button
              onClick={saveConfig}
              className="elegant-button px-4 py-2 rounded-md font-andika flex items-center"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 