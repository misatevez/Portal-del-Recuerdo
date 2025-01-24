import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSubscription } from './useSubscription';

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  styles: {
    borderRadius: string;
    shadowSize: string;
  };
}

interface Theme {
  id: string;
  nombre: string;
  descripcion: string;
  es_premium: boolean;
  configuracion: ThemeConfig;
}

export function useTheme(tributeId: string) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const { isPremium } = useSubscription();

  useEffect(() => {
    loadThemes();
  }, [tributeId]);

  const loadThemes = async () => {
    try {
      // Cargar el tema actual del tributo
      const { data: tributeData, error: tributeError } = await supabase
        .from('tributes')
        .select('theme_id')
        .eq('id', tributeId)
        .single();

      if (tributeError && tributeError.code !== 'PGRST116') throw tributeError;

      // Cargar todos los temas disponibles
      const { data: themesData, error: themesError } = await supabase
        .from('themes')
        .select('*')
        .order('nombre');

      if (themesError) throw themesError;

      setAvailableThemes(themesData || []);

      if (tributeData?.theme_id) {
        const currentTheme = themesData?.find(t => t.id === tributeData.theme_id);
        setTheme(currentTheme || null);
      } else {
        // Usar el tema predeterminado (Clásico)
        const defaultTheme = themesData?.find(t => t.nombre === 'Clásico');
        setTheme(defaultTheme || null);
      }
    } catch (err) {
      console.error('Error al cargar temas:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (themeId: string) => {
    try {
      const selectedTheme = availableThemes.find(t => t.id === themeId);
      if (!selectedTheme) throw new Error('Tema no encontrado');

      if (selectedTheme.es_premium && !isPremium()) {
        throw new Error('Este tema requiere una suscripción premium');
      }

      const { error } = await supabase
        .from('tributes')
        .update({ theme_id: themeId })
        .eq('id', tributeId);

      if (error) throw error;
      setTheme(selectedTheme);
    } catch (err) {
      console.error('Error al actualizar tema:', err);
      throw err;
    }
  };

  const getThemeStyles = () => {
    if (!theme) return {};

    const { colors, fonts, styles } = theme.configuracion;
    return {
      '--color-primary': colors.primary,
      '--color-secondary': colors.secondary,
      '--color-background': colors.background,
      '--color-text': colors.text,
      '--color-accent': colors.accent,
      '--font-heading': fonts.heading,
      '--font-body': fonts.body,
      '--border-radius': styles.borderRadius,
      '--shadow-size': styles.shadowSize,
    } as React.CSSProperties;
  };

  return {
    theme,
    availableThemes,
    loading,
    updateTheme,
    getThemeStyles,
  };
}
