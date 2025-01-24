import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSubscription } from '../../hooks/useSubscription';
import { AddFamilyMemberModal } from './AddFamilyMemberModal';

// ... (resto del código sin cambios hasta el return)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Árbol Genealógico
        </h2>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Familiar
          </button>
        )}
      </div>

      {/* ... (resto del código sin cambios) */}

      {showAddModal && (
        <AddFamilyMemberModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (memberId, tipo) => {
            try {
              const { error } = await supabase
                .from('family_relationships')
                .insert({
                  tribute_id_from: tributeId,
                  tribute_id_to: memberId,
                  tipo,
                });

              if (error) throw error;
              await loadFamilyMembers();
            } catch (err) {
              console.error('Error al añadir familiar:', err);
              throw err;
            }
          }}
        />
      )}
    </div>
  );
}
