import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Heart, MessageCircle, Loader, Image, Edit } from 'lucide-react';
import { useTribute } from '../hooks/useTribute';
import { useAuth } from '../components/auth/AuthProvider';
import { CandleDialog } from '../components/tributes/CandleDialog';
import { CandleAnimation } from '../components/tributes/CandleAnimation';
import { PhotoGallery } from '../components/tributes/PhotoGallery';
import { EditTributeForm } from '../components/tributes/EditTributeForm';
import { ShareButton } from '../components/sharing/ShareButton';
import { BackgroundMusic } from '../components/tributes/BackgroundMusic';

export function TributeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const {
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
  } = useTribute(id!);

  const [showCandleDialog, setShowCandleDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newComment, setNewComment] = useState('');

  const isOwner = user?.id === tribute?.created_by;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !tribute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No se encontró el homenaje
          </h2>
          <p className="text-gray-600">
            El homenaje que buscas no existe o no tienes permiso para verlo.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(newComment);
      setNewComment('');
    } catch (err) {
      console.error('Error al añadir comentario:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Imagen de Portada */}
      <div className="relative h-[40vh] bg-gray-900">
        {tribute.imagen_principal ? (
          <img
            src={tribute.imagen_principal}
            alt={tribute.nombre}
            className="w-full h-full object-cover opacity-75"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900" />
        )}
      </div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-serif text-gray-900 mb-2">
                {tribute.nombre}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(tribute.fecha_nacimiento).getFullYear()} -{' '}
                  {new Date(tribute.fecha_fallecimiento).getFullYear()}
                </span>
                {tribute.ubicacion && (
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {tribute.ubicacion}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ShareButton
                tributeId={tribute.id}
                tributeName={tribute.nombre}
                className="text-gray-600 hover:text-indigo-600"
              />
              {isOwner && (
                <button
                  onClick={() => setShowEditForm(true)}
                  className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
                >
                  <Edit className="w-5 h-5" />
                  Editar
                </button>
              )}
            </div>
          </div>

          {/* Biografía */}
          {tribute.biografia && (
            <div className="prose max-w-none mb-8">
              <p className="text-gray-600">{tribute.biografia}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button
              onClick={() => setShowCandleDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Heart className="w-5 h-5" />
              Encender Vela
            </button>
            <button
              onClick={() => document.getElementById('comentarios')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <MessageCircle className="w-5 h-5" />
              Dejar Mensaje
            </button>
          </div>

          {/* Galería de Fotos */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Galería de Fotos
            </h2>
            <PhotoGallery
              photos={photos}
              canEdit={isOwner}
              onUpload={uploadPhoto}
              onDelete={deletePhoto}
              onUpdateDescription={updatePhotoDescription}
            />
          </section>

          {/* Velas Encendidas */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Velas Encendidas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {candles.map((candle) => (
                <div
                  key={candle.id}
                  className="bg-gray-50 p-4 rounded-lg text-center"
                >
                  <CandleAnimation />
                  {candle.mensaje && (
                    <p className="mt-2 text-sm text-gray-600">{candle.mensaje}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {candle.profile?.nombre}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Comentarios */}
          <section id="comentarios" className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Mensajes y Recuerdos
            </h2>

            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Comparte un recuerdo o mensaje..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Publicar Mensaje
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">
                  Inicia sesión para dejar un mensaje
                </p>
              </div>
            )}

            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 p-6 rounded-lg"
                >
                  <p className="text-gray-600 mb-2">{comment.contenido}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{comment.profile?.nombre}</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Música de Fondo */}
      <BackgroundMusic tributeId={tribute.id} canEdit={isOwner} />

      {/* Modales */}
      {showCandleDialog && (
        <CandleDialog
          onClose={() => setShowCandleDialog(false)}
          onLight={lightCandle}
        />
      )}

      {showEditForm && (
        <EditTributeForm
          tribute={tribute}
          onSave={async (data) => {
            await updateTribute(data);
            setShowEditForm(false);
          }}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}
