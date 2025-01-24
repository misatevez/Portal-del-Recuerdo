import React, { useState, useEffect } from 'react';
import { Users, Plus, MessageSquare, Heart, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

interface Memory {
  id: string;
  tribute_id: string;
  user_id: string;
  contenido: string;
  tipo: 'texto' | 'audio' | 'video';
  multimedia_url?: string;
  likes: number;
  created_at: string;
  profile: {
    nombre: string;
  };
}

interface CollaborativeMemoriesProps {
  tributeId: string;
  canEdit: boolean;
}

export function CollaborativeMemories({ tributeId, canEdit }: CollaborativeMemoriesProps) {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemory, setNewMemory] = useState({
    contenido: '',
    tipo: 'texto' as const,
  });

  useEffect(() => {
    loadMemories();
  }, [tributeId]);

  const loadMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          profile:profiles(nombre)
        `)
        .eq('tribute_id', tributeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (err) {
      console.error('Error al cargar memorias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = async () => {
    if (!newMemory.contenido.trim()) return;

    try {
      const { error } = await supabase
        .from('memories')
        .insert({
          tribute_id: tributeId,
          contenido: newMemory.contenido,
          tipo: newMemory.tipo,
        });

      if (error) throw error;
      
      setShowAddModal(false);
      setNewMemory({ contenido: '', tipo: 'texto' });
      await loadMemories();
    } catch (err) {
      console.error('Error al añadir memoria:', err);
    }
  };

  const handleLike = async (memoryId: string) => {
    try {
      const { error } = await supabase.rpc('increment_memory_likes', {
        memory_id: memoryId,
      });

      if (error) throw error;
      
      setMemories(prev =>
        prev.map(m =>
          m.id === memoryId ? { ...m, likes: m.likes + 1 } : m
        )
      );
    } catch (err) {
      console.error('Error al dar like:', err);
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
          Memorias Compartidas
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Compartir Memoria
        </button>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            Sé el primero en compartir una memoria
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {memory.profile.nombre}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(memory.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleLike(memory.id)}
                  className="flex items-center text-gray-500 hover:text-indigo-600"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  {memory.likes}
                </button>
              </div>

              <p className="text-gray-600 mb-4">{memory.contenido}</p>

              {memory.multimedia_url && (
                <div className="mt-4">
                  {memory.tipo === 'video' ? (
                    <video
                      src={memory.multimedia_url}
                      controls
                      className="w-full rounded-lg"
                    />
                  ) : memory.tipo === 'audio' ? (
                    <audio
                      src={memory.multimedia_url}
                      controls
                      className="w-full"
                    />
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para añadir memoria */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Compartir una Memoria
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
                  Tu Memoria
                </label>
                <textarea
                  value={newMemory.contenido}
                  onChange={(e) => setNewMemory({
                    ...newMemory,
                    contenido: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Comparte un recuerdo especial..."
                />
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
                  onClick={handleAddMemory}
                  disabled={!newMemory.contenido.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
