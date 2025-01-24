import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';

interface EmailPreferences {
  velas: boolean;
  comentarios: boolean;
  sistema: boolean;
}

export function useEmailPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences>({
    velas: true,
    comentarios: true,
    sistema: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadPreferences() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email_preferences')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data?.email_preferences) {
          setPreferences(data.email_preferences);
        }
      } catch (err) {
        console.error('Error al cargar preferencias:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user]);

  const updatePreferences = async (newPreferences: Partial<EmailPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_preferences: { ...preferences, ...newPreferences },
        })
        .eq('id', user.id);

      if (error) throw error;
      setPreferences(prev => ({ ...prev, ...newPreferences }));
    } catch (err) {
      console.error('Error al actualizar preferencias:', err);
      throw err;
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
  };
}
