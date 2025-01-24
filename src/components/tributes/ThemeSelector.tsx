import React from 'react';
import { Palette, Lock, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useSubscription } from '../../hooks/useSubscription';

interface ThemeSelectorProps {
  tributeId: string;
  onClose?: () => void;
}

export function ThemeSelector({ tributeId, onClose }: ThemeSelectorProps) {
  const { theme, availableThemes, updateTheme } = useTheme(tributeId);
  const { isPremium } = useSubscription();
  const [selectedId, setSelectedId] = React.useState(theme?.id);
  const [error, setError] = React.useState<string | null>(null);

  const handleSelect = async (themeId: string) => {
    try {
      setError(null);
      await updateTheme(themeId);
      setSelectedId(themeId);
      onClose?.();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Palette className="w-5 h-5 text-gray-400 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Tema del Homenaje
            </h3>
            <p className="text-sm text-gray-500">
              Personaliza la apariencia del homenaje
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableThemes.map((t) => {
          const isSelected = selectedId === t.id;
          const isPremiumLocked = t.es_premium && !isPremium();

          return (
            <button
              key={t.id}
              onClick={() => !isPremiumLocked && handleSelect(t.id)}
              disabled={isPremiumLocked}
              className={`
                relative p-4 rounded-lg text-left transition-colors
                ${isSelected
                  ? 'ring-2 ring-indigo-600 bg-indigo-50'
                  : 'hover:bg-gray-50'
                }
                ${isPremiumLocked ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{
                backgroundColor: t.configuracion.colors.background,
                color: t.configuracion.colors.text,
              }}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 text-indigo-600">
                  <Check className="w-5 h-5" />
                </span>
              )}

              {isPremiumLocked && (
                <span className="absolute top-2 right-2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
              )}

              <h4 className="font-medium mb-1" style={{ fontFamily: t.configuracion.fonts.heading }}>
                {t.nombre}
              </h4>
              <p className="text-sm opacity-75" style={{ fontFamily: t.configuracion.fonts.body }}>
                {t.descripcion}
              </p>

              <div className="mt-4 flex gap-2">
                {Object.values(t.configuracion.colors).map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {!isPremium() && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-900 mb-1">
            Desbloquea todos los temas
          </h4>
          <p className="text-sm text-indigo-700 mb-3">
            Actualiza a Premium para acceder a todos los temas personalizados.
          </p>
          <a
            href="/precios"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Actualizar a Premium
          </a>
        </div>
      )}
    </div>
  );
}
