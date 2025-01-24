import React, { useState, useEffect } from 'react';
import { Clock, Plus, Loader, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSubscription } from '../../hooks/useSubscription';
import { AddEventModal } from './AddEventModal';

// ... (resto del código sin cambios hasta el return)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Línea de Tiempo
        </h2>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Evento
          </button>
        )}
      </div>

      {/* ... (resto del código sin cambios) */}

      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (eventData) => {
            try {
              const { error } = await supabase
                .from('timeline_events')
                .insert({
                  ...eventData,
                  tribute_id: tributeId,
                  orden: events.length,
                });

              if (error) throw error;
              await loadEvents();
            } catch (err) {
              console.error('Error al añadir evento:', err);
              throw err;
            }
          }}
        />
      )}
    </div>
  );
}
