import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader, Calendar, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchResult {
  id: string;
  nombre: string;
  fecha_nacimiento: string;
  fecha_fallecimiento: string;
  ubicacion: string | null;
  imagen_principal: string | null;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    async function searchTributes() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tributes')
          .select('id, nombre, fecha_nacimiento, fecha_fallecimiento, ubicacion, imagen_principal')
          .or(`nombre.ilike.%${debouncedQuery}%, ubicacion.ilike.%${debouncedQuery}%`)
          .limit(5);

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error('Error al buscar:', err);
      } finally {
        setLoading(false);
      }
    }

    searchTributes();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/homenaje/${result.id}`);
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Botón de búsqueda (visible en móvil) */}
      <button
        onClick={handleOpen}
        className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Campo de búsqueda (visible en desktop) */}
      <div className={`
        absolute right-0 top-0 z-50 w-full md:w-[400px]
        ${isOpen ? 'block' : 'hidden md:block'}
      `}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar homenajes..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Resultados de búsqueda */}
        {isOpen && query && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No se encontraron resultados
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left p-4 hover:bg-gray-50 flex items-start gap-4"
                  >
                    {result.imagen_principal ? (
                      <img
                        src={result.imagen_principal}
                        alt={result.nombre}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{result.nombre}</h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(result.fecha_nacimiento).getFullYear()} -{' '}
                          {new Date(result.fecha_fallecimiento).getFullYear()}
                        </span>
                        {result.ubicacion && (
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {result.ubicacion}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
