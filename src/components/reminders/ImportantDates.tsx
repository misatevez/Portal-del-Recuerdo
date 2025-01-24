import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Plus, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

interface Reminder {
  id: string;
  tribute_id: string;
  user_id: string;
  fecha: string;
  titulo: string;
  descripcion: string | null;
  notificar: boolean;
  created_at: string;
}

interface ImportantDatesProps {
  tributeId: string;
}

export function ImportantDates({ tributeId }: ImportantDatesProps) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    fecha: '',
    titulo: '',
    descripcion: '',
    notificar: true,
  });

  useEffect(() => {
    loadReminders();
  }, [tributeId]);

  const loadReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('tribute_id', tributeId)
        .eq('user_id', user?.id)
        .order('fecha', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (err) {
      console.error('Error al cargar recordatorios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.fecha || !newReminder.titulo) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .insert({
          tribute_id: tributeId,
          fecha: newReminder.fecha,
          titulo: newReminder.titulo,
          descripcion: newReminder.descripcion || null,
          notificar: newReminder.notificar,
        });

      if (error) throw error;
      
      setShowAddModal(false);
      setNewReminder({
        fecha: '',
        titulo: '',
        descripcion: '',
        notificar: true,
      });
      await loadReminders();
    } catch (err) {
      console.error('Error al añadir recordatorio:', err);
    }
  };

  const handleToggleNotification = async (reminderId: string, notificar: boolean) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ notificar })
        .eq('id', reminderId);

      if (error) throw error;
      
      setReminders(prev =>
        prev.map(r =>
          r.id === reminderId ? { ...r, notificar } : r
        )
      );
    } catch (err) {
      console.error('Error al actualizar notificación:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Fechas Importantes
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir Recordatorio
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            No hay recordatorios configurados
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-indigo-600 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-900">{reminder.titulo}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(reminder.fecha).toLocaleDateString()}
                  </p>
                  {reminder.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">
                      {reminder.descripcion}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleToggleNotification(reminder.id, !reminder.notificar)}
                className={`p-2 rounded-full ${
                  reminder.notificar
                    ? 'text-indigo-600 hover:bg-indigo-50'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
                title={reminder.notificar ? 'Desactivar notificaciones' : 'Activar notificaciones'}
              >
                <Bell className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal para añadir recordatorio */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Añadir Recordatorio
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={newReminder.fecha}
                  onChange={(e) => setNewReminder({
                    ...newReminder,
                    fecha: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newReminder.titulo}
                  onChange={(e) => setNewReminder({
                    ...newReminder,
                    titulo: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newReminder.descripcion}
                  onChange={(e) => setNewReminder({
                    ...newReminder,
                    descripcion: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notificar"
                  checked={newReminder.notificar}
                  onChange={(e) => setNewReminder({
                    ...newReminder,
                    notificar: e.target.checked
                  })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="notificar" className="ml-2 block text-sm text-gray-700">
                  Recibir notificaciones
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddReminder}
                  disabled={!newReminder.fecha || !newReminder.titulo}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
