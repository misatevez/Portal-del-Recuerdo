import React, { useState } from 'react';
import { X, Search, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AddFamilyMemberModalProps {
  onClose: () => void;
  onAdd: (memberId: string, tipo: string) => Promise<void>;
}

export function AddFamilyMemberModal({ onClose, onAdd }: AddFamilyMemberModalProps) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [tipo, setTipo] = useState('');
  const [adding, setAdding] = useState(false);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tributes')
        .select('id, nombre, fecha_nacimiento, fecha_fallecimiento, imagen_principal')
        .ilike('nombre', `%${query}%`)
        .limit(5);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Error al buscar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !tipo) return;

    setAdding(true);
    try {
      await onAdd(selectedMember, tipo);
      onClose();
    } catch (err) {
      console.error('Error al añadir familiar:', err);
    } finally {
      setAdding(false);
    }
  };

  const tiposRelacion = [
    'padre', 'madre', 'hijo', 'hija',
    'hermano', 'hermana', 'abuelo', 'abuela',
    'nieto', 'nieta', 'tio', 'tia',
    'sobrino', 'sobrina', 'primo', 'prima',
    'conyuge'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Añadir Familiar</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Homenaje
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Buscar por nombre..."
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Resultados de búsqueda */}
            {loading ? (
              <div className="mt-2 p-4 flex justify-center">
                <Loader className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
            ) : results.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-md divide-y">
                {results.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => setSelectedMember(result.id)}
                    className={`w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 ${
                      selectedMember === result.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div
                      className="w-10 h-10 bg-cover bg-center rounded-full"
                      style={{
                        backgroundImage: result.imagen_principal
                          ? `url(${result.imagen_principal})`
                          : 'url(https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80)',
                      }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{result.nombre}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(result.fecha_nacimiento).getFullYear()} -{' '}
                        {new Date(result.fecha_fallecimiento).getFullYear()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tipo de relación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relación
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Seleccionar...</option>
              {tiposRelacion.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedMember || !tipo || adding}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {adding ? 'Añadiendo...' : 'Añadir Familiar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
