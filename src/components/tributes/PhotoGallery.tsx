import React, { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Photo } from '../../types/tribute';

interface PhotoGalleryProps {
  photos: Photo[];
  canEdit: boolean;
  onUpload?: (file: File) => Promise<void>;
  onDelete?: (photoId: string) => Promise<void>;
  onUpdateDescription?: (photoId: string, descripcion: string) => Promise<void>;
}

export function PhotoGallery({
  photos,
  canEdit,
  onUpload,
  onDelete,
  onUpdateDescription,
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      console.error('Error al subir la imagen:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!selectedPhoto || !onUpdateDescription) return;
    try {
      await onUpdateDescription(selectedPhoto.id, editingDescription);
      setSelectedPhoto({ ...selectedPhoto, descripcion: editingDescription });
    } catch (err) {
      console.error('Error al actualizar la descripción:', err);
    }
  };

  const handleNext = () => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
      setEditingDescription(photos[currentIndex + 1].descripcion || '');
    }
  };

  const handlePrevious = () => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
      setEditingDescription(photos[currentIndex - 1].descripcion || '');
    }
  };

  return (
    <div>
      {/* Grid de Miniaturas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => {
              setSelectedPhoto(photo);
              setEditingDescription(photo.descripcion || '');
            }}
          >
            <img
              src={photo.url}
              alt={photo.descripcion || 'Foto del homenaje'}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {photo.descripcion && (
              <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2">
                <p className="text-white text-sm truncate">{photo.descripcion}</p>
              </div>
            )}
          </div>
        ))}

        {/* Botón de Subida */}
        {canEdit && (
          <label className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <div className="text-center">
              <Camera className="w-8 h-8 mx-auto text-gray-400" />
              <span className="mt-2 block text-sm text-gray-500">
                {uploading ? 'Subiendo...' : 'Añadir Foto'}
              </span>
            </div>
          </label>
        )}
      </div>

      {/* Modal de Vista Completa */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center">
            {/* Botón Cerrar */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navegación */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 text-white hover:text-gray-300 disabled:opacity-50"
              disabled={photos.findIndex(p => p.id === selectedPhoto.id) === 0}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 text-white hover:text-gray-300 disabled:opacity-50"
              disabled={photos.findIndex(p => p.id === selectedPhoto.id) === photos.length - 1}
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Imagen */}
            <div className="max-w-4xl mx-auto px-4 w-full">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.descripcion || 'Foto del homenaje'}
                className="max-h-[80vh] mx-auto object-contain"
              />

              {/* Descripción */}
              <div className="mt-4 px-4">
                {canEdit ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Añade una descripción..."
                    />
                    <button
                      onClick={handleSaveDescription}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Guardar
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(selectedPhoto.id);
                          setSelectedPhoto(null);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ) : (
                  selectedPhoto.descripcion && (
                    <p className="text-white text-center">{selectedPhoto.descripcion}</p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
