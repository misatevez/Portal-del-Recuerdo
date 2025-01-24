import React, { useState, useEffect, useRef } from 'react';
import { Music2, Pause, Play, Plus, X, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSubscription } from '../../hooks/useSubscription';

interface BackgroundMusicProps {
  tributeId: string;
  canEdit: boolean;
}

interface Music {
  id: string;
  url: string;
  nombre: string;
  artista: string | null;
  activa: boolean;
}

export function BackgroundMusic({ tributeId, canEdit }: BackgroundMusicProps) {
  const [music, setMusic] = useState<Music | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isPremium } = useSubscription();

  useEffect(() => {
    loadMusic();
  }, [tributeId]);

  const loadMusic = async () => {
    try {
      const { data, error } = await supabase
        .from('background_music')
        .select('*')
        .eq('tribute_id', tributeId)
        .eq('activa', true)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

      if (error && error.code !== 'PGRST116') throw error;
      setMusic(data);
    } catch (err) {
      console.error('Error al cargar música:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      // Subir archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `music/${tributeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('music')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('music')
        .getPublicUrl(filePath);

      // Desactivar música anterior si existe
      if (music) {
        await supabase
          .from('background_music')
          .update({ activa: false })
          .eq('id', music.id);
      }

      // Guardar en la base de datos
      const { error: dbError } = await supabase
        .from('background_music')
        .insert({
          tribute_id: tributeId,
          url: publicUrl,
          nombre: file.name.replace(`.${fileExt}`, ''),
          activa: true,
        });

      if (dbError) throw dbError;

      loadMusic();
      setShowUpload(false);
    } catch (err) {
      console.error('Error al subir música:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!music || !confirm('¿Estás seguro de eliminar la música de fondo?')) return;

    try {
      const { error } = await supabase
        .from('background_music')
        .delete()
        .eq('id', music.id);

      if (error) throw error;
      setMusic(null);
      setIsPlaying(false);
    } catch (err) {
      console.error('Error al eliminar música:', err);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(!isMuted);
  };

  if (!isPremium() && canEdit) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Music2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Música de Fondo Premium
        </h3>
        <p className="text-gray-600 mb-4">
          Añade música de fondo a tu homenaje para crear una atmósfera más personal.
        </p>
        <a
          href="/precios"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Actualizar a Premium
        </a>
      </div>
    );
  }

  if (loading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {music && (
        <audio
          ref={audioRef}
          src={music.url}
          loop
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {showUpload ? (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-900">Añadir Música</h3>
            <button
              onClick={() => setShowUpload(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <label className="block">
            <span className="sr-only">Seleccionar archivo de música</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </label>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {music ? (
            <>
              <button
                onClick={togglePlay}
                className="p-2 bg-white rounded-full shadow-lg text-gray-700 hover:text-indigo-600"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 bg-white rounded-full shadow-lg text-gray-700 hover:text-indigo-600"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {canEdit && (
                <button
                  onClick={handleDelete}
                  className="p-2 bg-white rounded-full shadow-lg text-gray-700 hover:text-red-600"
                  title="Eliminar música"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </>
          ) : canEdit && (
            <button
              onClick={() => setShowUpload(true)}
              className="p-2 bg-white rounded-full shadow-lg text-gray-700 hover:text-indigo-600"
              title="Añadir música"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
