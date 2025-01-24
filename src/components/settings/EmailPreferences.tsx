import React from 'react';
import { Bell, Loader } from 'lucide-react';
import { useEmailPreferences } from '../../hooks/useEmailPreferences';

export function EmailPreferences() {
  const { preferences, loading, updatePreferences } = useEmailPreferences();

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="w-5 h-5 text-gray-400 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Notificaciones por Email
            </h3>
            <p className="text-sm text-gray-500">
              Configura qué notificaciones quieres recibir por email
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="velas"
              type="checkbox"
              checked={preferences.velas}
              onChange={(e) => updatePreferences({ velas: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="velas" className="font-medium text-gray-700">
              Velas Encendidas
            </label>
            <p className="text-sm text-gray-500">
              Recibe una notificación cuando alguien encienda una vela en tus homenajes
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="comentarios"
              type="checkbox"
              checked={preferences.comentarios}
              onChange={(e) => updatePreferences({ comentarios: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="comentarios" className="font-medium text-gray-700">
              Comentarios
            </label>
            <p className="text-sm text-gray-500">
              Recibe una notificación cuando alguien comente en tus homenajes
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="sistema"
              type="checkbox"
              checked={preferences.sistema}
              onChange={(e) => updatePreferences({ sistema: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="sistema" className="font-medium text-gray-700">
              Notificaciones del Sistema
            </label>
            <p className="text-sm text-gray-500">
              Recibe notificaciones importantes sobre tu cuenta y suscripción
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
