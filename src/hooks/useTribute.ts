import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Tribute, Comment, Candle, Photo } from '../types/tribute';

export function useTribute(tributeId: string) {
  const [tribute, setTribute] = useState<Tribute | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTribute() {
      try {
        // Cargar el homenaje
        const { data: tributeData, error: tributeError } = await supabase
          .from('tributes')
          .select('*')
          .eq('id', tributeId)
          .single();

        if (tributeError) throw tributeError;
        setTribute(tributeData);

        // Cargar comentarios
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            profile:profiles(nombre)
          `)
          .eq('tribute_id', tributeId)
          .order('created_at', { ascending: false });

        if (commentsError) throw commentsError;
        setComments(commentsData);

        // Cargar velas
        const { data: candlesData, error: candlesError } = await supabase
          .from('candles')
          .select(`
            *,
            profile:profiles(nombre)
          `)
          .eq('tribute_id', tributeId)
          .order('created_at', { ascending: false });

        if (candlesError) throw candlesError;
        setCandles(candlesData);

        // Cargar fotos
        const { data: photosData, error: photosError } = await supabase
          .from('photos')
          .select('*')
          .eq('tribute_id', tributeId)
          .order('orden', { ascending: true });

        if (photosError) throw photosError;
        setPhotos(photosData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTribute();

    // Suscribirse a cambios
    const commentsSubscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `tribute_id=eq.${tributeId}`,
        },
        () => {
          loadTribute();
        }
      )
      .subscribe();

    const candlesSubscription = supabase
      .channel('candles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candles',
          filter: `tribute_id=eq.${tributeId}`,
        },
        () => {
          loadTribute();
        }
      )
      .subscribe();

    const photosSubscription = supabase
      .channel('photos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'photos',
          filter: `tribute_id=eq.${tributeId}`,
        },
        () => {
          loadTribute();
        }
      )
      .subscribe();

    return () => {
      commentsSubscription.unsubscribe();
      candlesSubscription.unsubscribe();
      photosSubscription.unsubscribe();
    };
  }, [tributeId]);

  const addComment = async (contenido: string) => {
    try {
      const { error } = await supabase.from('comments').insert({
        tribute_id: tributeId,
        contenido,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const lightCandle = async (mensaje: string | null = null) => {
    try {
      const { error } = await supabase.from('candles').insert({
        tribute_id: tributeId,
        mensaje,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTribute = async (data: Partial<Tribute>) => {
    try {
      const { error } = await supabase
        .from('tributes')
        .update(data)
        .eq('id', tributeId);

      if (error) throw error;
      
      // Actualizar el estado local
      setTribute(prev => prev ? { ...prev, ...data } : null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const uploadPhoto = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `tributes/${tributeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('photos').insert({
        tribute_id: tributeId,
        url: publicUrl,
        orden: photos.length,
      });

      if (dbError) throw dbError;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updatePhotoDescription = async (photoId: string, descripcion: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ descripcion })
        .eq('id', photoId);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    tribute,
    comments,
    candles,
    photos,
    loading,
    error,
    addComment,
    lightCandle,
    updateTribute,
    uploadPhoto,
    deletePhoto,
    updatePhotoDescription,
  };
}
