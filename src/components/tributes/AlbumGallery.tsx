import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { PhotoGallery } from './PhotoGallery';
import { supabase } from '../../lib/supabase';
import { useSubscription } from '../../hooks/useSubscription';

interface Album {
  id: string;
  nombre: string;
  descripcion: string | null;
  portada: string | null;
  orden: number;
}

interface Photo {
  id: string;
  url: string;
  descripcion: string | null;
  album_id: string | null;
}

interface AlbumGalleryProps {
  tributeId: string;
  photos: Photo[];
  canEdit: boolean;
  onUpload: (file: File, albumId?: string) => Promise<void>;
  onDelete: (photoId: string) => Promise<void>;
  onUpdateDescription: (photoId: string, descripcion: string) => Promise<void>;
}

export function AlbumGallery({
  tributeId,
  photos,
  canEdit,
  onUpload,
  onDelete,
  onUpdateDescription,
}: AlbumGalleryProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ nombre: '', descripcion: '' });
  const { isPremium } = useSubscription();

  React.useEffect(() => {
    loadAlbums();
  }, [tributeId]);

  const loadAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('tribute_id', tributeId)
        .order('orden');

      if (error) throw error;
      setAlbums(data || []);
    } catch (err) {
      console.error('Error al cargar álbumes:', err);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbum.nombre.trim()) return;

    try {
      const { error } = await supabase
        .from('albums')
        .insert({
          tribute_id: tributeId,
          nombre: newAlbum.nombre,
          descripcion: newAlbum.descripcion || null,
          orden: albums.length,
        });

      if (error) throw error;

      setIsCreating(false);
      setNewAlbum({ nombre: '', descripcion: '' });
      loadAlbums();
    } catch (err) {
      console.error('Error al crear álbum:', err);
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('¿Estás seguro de eliminar este álbum?')) return;

    try {
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId);

      if (error) throw error;

      if (selectedAlbum?.id === albumId) {
        setSelectedAlbum(null);
      }

      loadAlbums();
    } catch (err) {
      console.error('Error al eliminar álbum:', err);
    }
  };

  const filteredPhotos = selectedAlbum
    ? photos.filter(p => p.album_id === selectedAlbum.id)
    : photos.filter(p => !p.album_id);

  if (!isPremium() && canEdit) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Álbumes Premium
        </h3>
        <p className="text-gray-600 mb-4">
          Organiza tus fotos en álbumes y crea colecciones especiales de recuerdos.
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

  return (
    <div>
      {/* Navegación de Álbumes */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Álbumes</h3>
          {canEdit && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nuevo Álbum
            </button>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedAlbum(null)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium
              ${!selectedAlbum ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            Todas las Fotos
          </button>
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbum(album)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium
                ${selectedAlbum?.id === album.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              {album.nombre}
              {canEdit && selectedAlbum?.id === album.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAlbum(album.id);
                  }}
                  className="ml-2 text-white hover:text-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Modal de Crear Álbum */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Nuevo Álbum</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newAlbum.nombre}
                  onChange={(e) => setNewAlbum({ ...newAlbum, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nombre del álbum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newAlbum.descripcion}
                  onChange={(e) => setNewAlbum({ ...newAlbum, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Descripción opcional"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAlbum}
                  disabled={!newAlbum.nombre.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Crear Álbum
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Galería de Fotos */}
      <PhotoGallery
        photos={filteredPhotos}
        canEdit={canEdit}
        onUpload={(file) => onUpload(file, selectedAlbum?.id)}
        onDelete={onDelete}
        onUpdateDescription={onUpdateDescription}
      />
    </div>
  );
}
