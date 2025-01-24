import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Save, Loader, Shield, Mail, Globe, Bell } from 'lucide-react';

export function SettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site: {
      name: 'Portal del Recuerdo',
      description: 'Honrando la memoria de nuestros seres queridos',
      language: 'es',
      maintenance_mode: false,
    },
    email: {
      notifications_enabled: true,
      from_name: 'Portal del Recuerdo',
      from_email: 'noreply@portaldelrecuerdo.com',
    },
    security: {
      max_login_attempts: 5,
      session_timeout: 24,
      require_email_verification: true,
    },
    notifications: {
      velas_enabled: true,
      comentarios_enabled: true,
      sistema_enabled: true,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data.config);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('settings')
        .update({ config: settings })
        .eq('id', 1);

      if (error) throw error;
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-primary">Configuración</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="elegant-button px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {saving ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Configuración del Sitio */}
        <div className="elegant-card p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium text-primary">Configuración del Sitio</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Nombre del Sitio
              </label>
              <input
                type="text"
                value={settings.site.name}
                onChange={(e) => setSettings({
                  ...settings,
                  site: { ...settings.site, name: e.target.value }
                })}
                className="elegant-input w-full px-3 py-2 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Descripción
              </label>
              <textarea
                value={settings.site.description}
                onChange={(e) => setSettings({
                  ...settings,
                  site: { ...settings.site, description: e.target.value }
                })}
                className="elegant-input w-full px-3 py-2 rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Idioma
              </label>
              <select
                value={settings.site.language}
                onChange={(e) => setSettings({
                  ...settings,
                  site: { ...settings.site, language: e.target.value }
                })}
                className="elegant-input w-full px-3 py-2 rounded-md"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenance_mode"
                checked={settings.site.maintenance_mode}
                onChange={(e) => setSettings({
                  ...settings,
                  site: { ...settings.site, maintenance_mode: e.target.checked }
                })}
                className="h-4 w-4 rounded border-primary/30 bg-surface text-primary focus:ring-primary/50"
              />
              <label htmlFor="maintenance_mode" className="ml-2 block text-sm text-text/80">
                Modo Mantenimiento
              </label>
            </div>
          </div>
        </div>

        {/* Configuración de Email */}
        <div className="elegant-card p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium text-primary">Configuración de Email</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications_enabled"
                checked={settings.email.notifications_enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, notifications_enabled: e.target.checked }
                })}
                className="h-4 w-4 rounded border-primary/30 bg-surface text-primary focus:ring-primary/50"
              />
              <label htmlFor="notifications_enabled" className="ml-2 block text-sm text-text/80">
                Habilitar Notificaciones por Email
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Nombre del Remitente
              </label>
              <input
                type="text"
                value={settings.email.from_name}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, from_name: e.target.value }
                })}
                className="elegant-input w-full px-3 py-2 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Email del Remitente
              </label>
              <input
                type="email"
                value={settings.email.from_email}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, from_email: e.target.value }
                })}
                className="elegant-input w-full px-3 py-2 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Seguridad */}
        <div className="elegant-card p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium text-primary">Configuración de Seguridad</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Máximo de Intentos de Login
              </label>
              <input
                type="number"
                value={settings.security.max_login_attempts}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, max_login_attempts: parseInt(e.target.value) }
                })}
                className="elegant-input w-full px-3 py-2 rounded-md"
                min="1"
                max="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Tiempo de Sesión (horas)
              </label>
              <input
                type="number"
                value={settings.security.session_timeout}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, session_timeout: parseInt(e.target.value) }
                })}
                className="elegant-input w-full px-3 py-2 rounded-md"
                min="1"
                max="72"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="require_email_verification"
                checked={settings.security.require_email_verification}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, require_email_verification: e.target.checked }
                })}
                className="h-4 w-4 rounded border-primary/30 bg-surface text-primary focus:ring-primary/50"
              />
              <label htmlFor="require_email_verification" className="ml-2 block text-sm text-text/80">
                Requerir Verificación de Email
              </label>
            </div>
          </div>
        </div>

        {/* Configuración de Notificaciones */}
        <div className="elegant-card p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium text-primary">Configuración de Notificaciones</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="velas_enabled"
                checked={settings.notifications.velas_enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, velas_enabled: e.target.checked }
                })}
                className="h-4 w-4 rounded border-primary/30 bg-surface text-primary focus:ring-primary/50"
              />
              <label htmlFor="velas_enabled" className="ml-2 block text-sm text-text/80">
                Notificaciones de Velas
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="comentarios_enabled"
                checked={settings.notifications.comentarios_enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, comentarios_enabled: e.target.checked }
                })}
                className="h-4 w-4 rounded border-primary/30 bg-surface text-primary focus:ring-primary/50"
              />
              <label htmlFor="comentarios_enabled" className="ml-2 block text-sm text-text/80">
                Notificaciones de Comentarios
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sistema_enabled"
                checked={settings.notifications.sistema_enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, sistema_enabled: e.target.checked }
                })}
                className="h-4 w-4 rounded border-primary/30 bg-surface text-primary focus:ring-primary/50"
              />
              <label htmlFor="sistema_enabled" className="ml-2 block text-sm text-text/80">
                Notificaciones del Sistema
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
