import React, { useEffect, useState } from 'react';
import { X, Loader } from 'lucide-react';
import { createPaymentPreference } from '../../services/mercadopago';

interface PaymentDialogProps {
  planId: string;
  planName: string;
  price: number;
  onClose: () => void;
}

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

export function PaymentDialog({ planId, planName, price, onClose }: PaymentDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initPayment() {
      try {
        // Cargar el SDK de MercadoPago
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        document.body.appendChild(script);

        script.onload = async () => {
          try {
            const preference = await createPaymentPreference(planId);
            
            // Inicializar el botón de pago
            const mp = new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, {
              locale: 'es-AR'
            });

            mp.checkout({
              preference: {
                id: preference.id
              },
              render: {
                container: '#payment-button',
                label: 'Pagar',
              }
            });

            setLoading(false);
          } catch (err: any) {
            setError(err.message);
            setLoading(false);
          }
        };

        script.onerror = () => {
          setError('Error al cargar MercadoPago');
          setLoading(false);
        };
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    initPayment();
  }, [planId]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Procesar Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Resumen de la compra</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Plan</span>
              <span className="font-medium">{planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Precio</span>
              <span className="font-medium">${price.toFixed(2)}/mes</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div id="payment-button" className="w-full" />
        )}
      </div>
    </div>
  );
}
