import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface TimelineEvent {
  id: string;
  fecha: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  ubicacion: string | null;
  imagenes: string[];
  orden: number;
}

export function useTimeline(tributeId: string) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [tributeId]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('tribute_id', tributeId)
        .order('fecha', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (event: Omit<TimelineEvent, 'id'>) => {
    try {
      const { error } = await supabase
        .from('timeline_events')
        .insert({
          ...event,
          tribute_id: tributeId,
        });

      if (error) throw error;
      await loadEvents();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<TimelineEvent>) => {
    try {
      const { error } = await supabase
        .from('timeline_events')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;
      setEvents(prev =>
        prev.map(e => e.id === eventId ? { ...e, ...updates } : e)
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('timeline_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const reorderEvents = async (eventIds: string[]) => {
    try {
      const updates = eventIds.map((id, index) => ({
        id,
        orden: index,
      }));

      const { error } = await supabase
        .from('timeline_events')
        .upsert(updates);

      if (error) throw error;
      await loadEvents();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    reorderEvents,
  };
}
