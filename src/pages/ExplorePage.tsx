import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { TributeCard } from '../components/tributes/TributeCard';
import { useSearchTributes } from '../hooks/useSearchTributes';

const ITEMS_PER_PAGE = 12;

export function ExplorePage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [filtros, setFiltros] = useState({
    year: '',
    location: '',
    sortBy: 'recent' as const,
  });
  const [currentPage, setCurrentPage] = useState(0);

  // Debounce para la búsqueda
  const [debouncedBusqueda, setDebouncedBusqueda] = useState(busqueda);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBusqueda(busqueda), 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // Reset página cuando cambian los filtros o la búsqueda
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedBusqueda, filtros]);

  const { tributes, totalPages, loading } = useSearchTributes(
    debouncedBusqueda,
    filtros,
    { page: currentPage, pageSize: ITEMS_PER_PAGE }
  );

  const años = Array.from(
    { length: new Date().getFullYear() - 2020 + 1 },
    (_, i) => (new Date().getFullYear() - i).toString()
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900 mb-4">Explorar Homenajes</h1>
        <p className="text-gray-600">
          Descubre los homenajes creados por nuestra comunidad para honrar la memoria de sus seres queridos.
        </p>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </button>
        </div>

        {/* Panel de Filtros */}
        {filtrosAbiertos && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año de Fallecimiento
                </label>
                <select
                  value={filtros.year}
                  onChange={(e) => setFiltros({ ...filtros, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todos</option>
                  {años.map((año) => (
                    <option key={año} value={año}>{año}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <select
                  value={filtros.location}
                  onChange={(e) => setFiltros({ ...filtros, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todas</option>
                  <option value="madrid">Madrid</option>
                  <option value="barcelona">Barcelona</option>
                  <option value="valencia">Valencia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordenar por
                </label>
                <select
                  value={filtros.sortBy}
                  onChange={(e) => setFiltros({
                    ...filtros,
                    sortBy: e.target.value as 'recent' | 'candles' | 'name'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="recent">Más reciente</option>
                  <option value="candles">Más velas</option>
                  <option value="name">Nombre</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Homenajes */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : tributes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">No se encontraron homenajes que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tributes.map((tribute) => (
                <TributeCard
                  key={tribute.id}
                  id={tribute.id}
                  nombre={tribute.nombre}
                  fechaNacimiento={tribute.fecha_nacimiento}
                  fechaFallecimiento={tribute.fecha_fallecimiento}
                  imagen={tribute.imagen_principal || 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80'}
                  velasEncendidas={tribute.candles?.[0]?.count || 0}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`
                        w-8 h-8 rounded-md flex items-center justify-center text-sm
                        ${currentPage === i
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
