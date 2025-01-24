import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader, Search, Filter, ChevronLeft, ChevronRight, Heart, Calendar, MapPin } from 'lucide-react';

export function TributesPanel() {
  const [tributes, setTributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTributes();
  }, [page, search, filter]);

  const loadTributes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tributes')
        .select(`
          *,
          profiles:created_by(nombre),
          candles(count)
        `, { count: 'exact' });

      if (search) {
        query = query.ilike('nombre', `%${search}%`);
      }

      if (filter === 'featured') {
        query = query.eq('es_premium', true);
      }

      const { data, error, count } = await query
        .range(page * 10, (page + 1) * 10 - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTributes(data || []);
      setTotalPages(Math.ceil((count || 0) / 10));
    } catch (err) {
      console.error('Error loading tributes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = async (tributeId: string, isPremium: boolean) => {
    try {
      const { error } = await supabase
        .from('tributes')
        .update({ es_premium: !isPremium })
        .eq('id', tributeId);

      if (error) throw error;
      loadTributes();
    } catch (err) {
      console.error('Error updating tribute:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-primary">Homenajes</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
            <input
              type="text"
              placeholder="Buscar homenajes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="elegant-input pl-10 pr-4 py-2 rounded-lg"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="elegant-input px-4 py-2 rounded-lg"
          >
            <option value="all">Todos</option>
            <option value="featured">Destacados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="elegant-card rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Homenaje
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Creado por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Velas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {tributes.map((tribute) => (
                  <tr key={tribute.id} className="hover:bg-primary/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div 
                          className="flex-shrink-0 h-10 w-10 bg-cover bg-center rounded-lg"
                          style={{
                            backgroundImage: tribute.imagen_principal
                              ? `url(${tribute.imagen_principal})`
                              : 'url(https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80)'
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-text">
                            {tribute.nombre}
                          </div>
                          <div className="text-xs text-text/60 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(tribute.fecha_nacimiento).getFullYear()} -{' '}
                            {new Date(tribute.fecha_fallecimiento).getFullYear()}
                          </div>
                          {tribute.ubicacion && (
                            <div className="text-xs text-text/60 flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {tribute.ubicacion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60">
                      {tribute.profiles?.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60">
                      {tribute.candles?.[0]?.count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tribute.es_premium
                          ? 'bg-primary/20 text-primary'
                          : 'bg-text/20 text-text'
                      }`}>
                        {tribute.es_premium ? 'Destacado' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleFeatureToggle(tribute.id, tribute.es_premium)}
                        className="text-primary hover:text-primary/80"
                      >
                        {tribute.es_premium ? 'Quitar destacado' : 'Destacar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-text/60">
              Mostrando {tributes.length} de {totalPages * 10} homenajes
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 elegant-button rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-2 elegant-button rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
