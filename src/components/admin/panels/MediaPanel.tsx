import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader, Search, Filter, ChevronLeft, ChevronRight, Image, Trash2 } from 'lucide-react';

export function MediaPanel() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadMedia();
  }, [page, search, filter]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('photos')
        .select(`
          *,
          tribute:tributes(nombre)
        `, { count: 'exact' });

      if (search) {
        query = query.or(`
          descripcion.ilike.%${search}%,
          tributes.nombre.ilike.%${search}%
        `);
      }

      const { data, error, count } = await query
        .range(page * 12, (page + 1) * 12 - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMedia(data || []);
      setTotalPages(Math.ceil((count || 0) / 12));
    } catch (err) {
      console.error('Error loading media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadMedia();
    } catch (err) {
      console.error('Error deleting media:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-primary">Multimedia</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
            <input
              type="text"
              placeholder="Buscar multimedia..."
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
            <option value="all">Todo</option>
            <option value="images">Imágenes</option>
            <option value="videos">Videos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {media.map((item) => (
              <div key={item.id} className="elegant-card rounded-lg overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={item.url}
                    alt={item.descripcion || 'Imagen del homenaje'}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-text truncate">
                    {item.tribute?.nombre}
                  </h3>
                  {item.descripcion && (
                    <p className="text-sm text-text/60 mt-1 line-clamp-2">
                      {item.descripcion}
                    </p>
                  )}
                  <p className="text-xs text-text/40 mt-2">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-text/60">
              Mostrando {media.length} de {totalPages * 12} elementos
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
