import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader, Search, Filter, ChevronLeft, ChevronRight, Music, Play, Pause, Trash2 } from 'lucide-react';

export function MusicPanel() {
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadMusic();
  }, [page, search]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  const loadMusic = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('background_music')
        .select(`
          *,
          tribute:tributes(nombre)
        `, { count: 'exact' });

      if (search) {
        query = query.or(`
          nombre.ilike.%${search}%,
          artista.ilike.%${search}%,
          tributes.nombre.ilike.%${search}%
        `);
      }

      const { data, error, count } = await query
        .range(page * 10, (page + 1) * 10 - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMusic(data || []);
      setTotalPages(Math.ceil((count || 0) / 10));
    } catch (err) {
      console.error('Error loading music:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta música?')) return;

    try {
      const { error } = await supabase
        .from('background_music')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadMusic();
    } catch (err) {
      console.error('Error deleting music:', err);
    }
  };

  const togglePlay = (url: string) => {
    if (playing === url) {
      audio?.pause();
      setPlaying(null);
    } else {
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(url);
      newAudio.play();
      setAudio(newAudio);
      setPlaying(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-primary">Música</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
          <input
            type="text"
            placeholder="Buscar música..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="elegant-input pl-10 pr-4 py-2 rounded-lg"
          />
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
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Artista
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Homenaje
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
                {music.map((track) => (
                  <tr key={track.id} className="hover:bg-primary/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => togglePlay(track.url)}
                          className="p-2 bg-primary/10 rounded-full mr-3 hover:bg-primary/20"
                        >
                          {playing === track.url ? (
                            <Pause className="w-4 h-4 text-primary" />
                          ) : (
                            <Play className="w-4 h-4 text-primary" />
                          )}
                        </button>
                        <div className="text-sm text-text">{track.nombre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text/60">
                        {track.artista || 'Desconocido'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">
                        {track.tribute?.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        track.activa
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {track.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(track.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
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
              Mostrando {music.length} de {totalPages * 10} pistas
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
