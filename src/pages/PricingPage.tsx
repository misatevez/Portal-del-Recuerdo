import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Shield, Clock, Image, Users, Loader, Heart } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { PaymentDialog } from '../components/payments/PaymentDialog';

interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  caracteristicas: string[];
}

export function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [planes, setPlanes] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [facturacionAnual, setFacturacionAnual] = useState(false);

  React.useEffect(() => {
    async function loadPlanes() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('activo', true)
          .order('precio');

        if (error) throw error;
        setPlanes(data || []);
      } catch (err) {
        console.error('Error al cargar planes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlanes();
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (plan.precio === 0) {
      try {
        const { error } = await supabase.from('subscriptions').insert({
          plan_id: plan.id,
          estado: 'active',
          fecha_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });

        if (error) throw error;
        navigate('/perfil');
      } catch (err) {
        console.error('Error al activar plan gratuito:', err);
      }
    } else {
      setSelectedPlan(plan);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('foto')) return <Image className="w-5 h-5" />;
    if (feature.includes('soporte')) return <Users className="w-5 h-5" />;
    if (feature.includes('backup')) return <Shield className="w-5 h-5" />;
    return <Check className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-surface pt-20">
      {selectedPlan && (
        <PaymentDialog
          planId={selectedPlan.id}
          planName={selectedPlan.nombre}
          price={selectedPlan.precio}
          onClose={() => setSelectedPlan(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-serif text-primary mb-4">
            Planes y Precios
          </h1>
          <p className="text-xl text-text/80 mb-8">
            Elige el plan que mejor se adapte a tus necesidades para honrar la memoria de tus seres queridos
          </p>

          {/* Toggle de Facturación */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!facturacionAnual ? 'text-primary font-medium' : 'text-text/60'}`}>
              Facturación Mensual
            </span>
            <button
              onClick={() => setFacturacionAnual(!facturacionAnual)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50
                ${facturacionAnual ? 'bg-primary' : 'bg-text/20'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-surface transition-transform
                  ${facturacionAnual ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
            <span className={`text-sm flex items-center gap-2 ${facturacionAnual ? 'text-primary font-medium' : 'text-text/60'}`}>
              Facturación Anual
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                Ahorra 20%
              </span>
            </span>
          </div>
        </div>

        {/* Grid de Planes */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {planes.map((plan) => {
            const precioMensual = plan.precio;
            const precioAnual = plan.precio * 12 * 0.8; // 20% de descuento
            const precioFinal = facturacionAnual ? precioAnual / 12 : precioMensual;

            return (
              <div
                key={plan.id}
                className={`
                  relative elegant-card rounded-2xl
                  ${plan.nombre === 'Premium' ? 'border-2 border-primary md:scale-105' : 'border border-primary/20'}
                `}
              >
                {plan.nombre === 'Premium' && (
                  <div className="absolute -top-5 inset-x-0 flex justify-center">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-primary text-surface">
                      <Star className="w-4 h-4 mr-1" />
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-xl font-serif text-primary mb-2">{plan.nombre}</h3>
                  <p className="text-text/80 mb-6">{plan.descripcion}</p>
                  
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold text-primary">
                      ${precioFinal.toFixed(2)}
                    </span>
                    <span className="text-text/60 ml-2">/mes</span>
                  </div>

                  {facturacionAnual && plan.precio > 0 && (
                    <p className="text-sm text-text/60 mb-6">
                      Facturado anualmente como ${precioAnual.toFixed(2)}
                    </p>
                  )}

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`
                      w-full py-3 px-4 rounded-lg text-sm font-medium
                      ${plan.nombre === 'Premium'
                        ? 'elegant-button'
                        : 'border border-primary/30 text-text hover:bg-primary/10'
                      }
                    `}
                  >
                    {plan.precio === 0 ? 'Comenzar Gratis' : 'Comenzar'}
                  </button>
                </div>

                <div className="border-t border-primary/20 p-8">
                  <h4 className="text-sm font-medium text-primary mb-4">Incluye:</h4>
                  <ul className="space-y-4">
                    {plan.caracteristicas.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 text-primary">
                          {getFeatureIcon(feature)}
                        </span>
                        <span className="ml-3 text-sm text-text/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-serif text-primary mb-8 text-center">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-primary mb-2">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-text/80">
                Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se aplicarán inmediatamente y se ajustará el cobro de manera proporcional.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-2">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-text/80">
                Aceptamos todas las tarjetas de crédito y débito principales a través de MercadoPago, garantizando transacciones seguras y protegidas.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-2">
                ¿Hay un período de prueba?
              </h3>
              <p className="text-text/80">
                Ofrecemos un plan gratuito con características básicas que puedes usar por tiempo ilimitado. Para planes premium, tienes 30 días de garantía de devolución.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-2">
                ¿Cómo funciona la facturación anual?
              </h3>
              <p className="text-text/80">
                Con la facturación anual, pagas por 12 meses por adelantado y obtienes un 20% de descuento sobre el precio mensual. El plan se renovará automáticamente cada año.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
