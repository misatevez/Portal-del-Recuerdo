import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CandleAnimation } from './CandleAnimation';

interface CandleDialogProps {
  onClose: () => void;
  onLight: (mensaje: string | null) => Promise<void>;
}

export function CandleDialog({ onClose, onLight }: CandleDialogProps) {
  const [mensaje, setMensaje] = useState('');
  const [encendiendo, setEncendiendo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEncendiendo(true);
    try {
      await onLight(mensaje || null);
      onClose();
    } catch (err) {
      console.error('Error al encender la vela:', err);
    } finally {
      setEncendiendo(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Encender una Vela</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <CandleAnimation />
        </div>

        <p className="text-gray-600 text-center mb-6">
          Enciende una vela en memoria de esta persona especial. Puedes añadir un mensaje personal si lo deseas.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe un mensaje (opcional)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            rows={3}
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={encendiendo}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {encendiendo ? 'Encendiendo...' : 'Encender Vela'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
