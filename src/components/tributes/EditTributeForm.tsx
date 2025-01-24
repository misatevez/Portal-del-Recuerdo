import React, { useState } from 'react';
import { Camera, Calendar, MapPin, Music, Palette, Loader } from 'lucide-react';
import type { Tribute } from '../../types/tribute';

interface EditTributeFormProps {
  tribute: Tribute;
  onSave: (data: Partial<Tribute>) => Promise<void>;
  onCancel: () => void;
}

export function EditTributeForm({ tribute, onSave, onCancel }: EditTributeFormProps) {
  const [formData, setFormData] = useState({
    nombre: tribute.nombre,
    fecha_nacimiento: tribute.fecha_nacimiento,
    fecha_fallecimiento: tribute.fecha_fallecimiento,
    ubicacion: tribute.ubicacion || '',
    biografia: tribute.biografia || '',
    imagen_principal: tribute.imagen_principal || '',
    tema: tribute.tema,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Información Principal */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Información Principal</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline-block mr-1" />
              Ubicación
            </label>
            <input
              type="text"
              id="ubicacion"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ciudad, País"
            />
          </div>

          <div>
            <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              id="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="fecha_fallecimiento" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Fecha de Fallecimiento
            </label>
            <input
              type="date"
              id="fecha_fallecimiento"
              value={formData.fecha_fallecimiento}
              onChange={(e) => setFormData({ ...formData, fecha_fallecimiento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Biografía */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Biografía</h2>
        <textarea
          value={formData.biografia}
          onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={6}
          placeholder="Escribe una breve biografía..."
        />
      </div>

      {/* Imagen Principal */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          <Camera className="w-5 h-5 inline-block mr-2" />
          Imagen Principal
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la Imagen
            </label>
            <input
              type="url"
              value={formData.imagen_principal}
              onChange={(e) => setFormData({ ...formData, imagen_principal: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {formData.imagen_principal && (
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <img
                src={formData.imagen_principal}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Personalización */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          <Palette className="w-5 h-5 inline-block mr-2" />
          Personalización
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema
            </label>
            <select
              value={formData.tema}
              onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="claro">Tema Claro</option>
              <option value="oscuro">Tema Oscuro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Music className="w-4 h-4 inline-block mr-1" />
              Música de Fondo
            </label>
            <select
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            >
              <option value="">Disponible en versión Premium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
        >
          {saving && <Loader className="w-4 h-4 mr-2 animate-spin" />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
