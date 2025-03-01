"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader, Heart } from "lucide-react"
import { useAuth } from "../auth/AuthProvider"
import { PaymentDialog } from "../components/payments/PaymentDialog"
import { useToast } from "@/components/ui/use-toast"

interface Plan {
  id: string
  nombre: string
  precio: number
  etiqueta?: string
  caracteristicas: Array<{
    nombre: string
    incluido: boolean
  }>
}

export function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [facturacionAnual, setFacturacionAnual] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const planes: Plan[] = [
    {
      id: "estandar",
      nombre: "Estandar",
      precio: 0,
      etiqueta: "GRATIS",
      caracteristicas: [
        { nombre: "Nombre, Localidad, País", incluido: true },
        { nombre: "Resumen biográfico", incluido: true },
        { nombre: "Fotografía principal", incluido: true },
        { nombre: "Fecha de nacimiento", incluido: true },
        { nombre: "Fecha de fallecimiento", incluido: true },
        { nombre: "Fondo estandar", incluido: true },
        { nombre: "Comentarios moderados", incluido: true },
        { nombre: "Aviso de comentario nuevo", incluido: false },
        { nombre: "Galería de hasta 30 fotos", incluido: false },
        { nombre: "Fondo musical personalizado", incluido: false },
        { nombre: "Biografía detallada (4 páginas A4)", incluido: false },
        { nombre: "Velas personalizadas", incluido: false },
      ],
    },
    {
      id: "premium",
      nombre: "Premium",
      precio: 12000,
      etiqueta: "UN AÑO",
      caracteristicas: [
        { nombre: "Nombre, Localidad, País", incluido: true },
        { nombre: "Resumen biográfico", incluido: true },
        { nombre: "Fotografía principal", incluido: true },
        { nombre: "Fecha de nacimiento", incluido: true },
        { nombre: "Fecha de fallecimiento", incluido: true },
        { nombre: "Fondo con plantillas a elección", incluido: true },
        { nombre: "Comentarios moderados", incluido: true },
        { nombre: "Aviso de comentario nuevo", incluido: true },
        { nombre: "Galería de hasta 30 fotos", incluido: true },
        { nombre: "Fondo musical personalizado", incluido: true },
        { nombre: "Biografía detallada (4 páginas A4)", incluido: true },
        { nombre: "Velas personalizadas", incluido: true },
      ],
    },
  ]

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      toast({
        description: "Por favor, inicia sesión para seleccionar un plan.",
        variant: "default",
      })
      router.push("/login")
      return
    }

    if (plan.precio === 0) {
      toast({
        description: "Has seleccionado el plan Estándar. Serás redirigido a tu perfil.",
        variant: "default",
      })
      router.push("/perfil")
    } else {
      setSelectedPlan(plan)
      toast({
        description: `Has seleccionado el plan ${plan.nombre}. Procede con el pago.`,
        variant: "default",
      })
    }
  }

  const handlePaymentError = (error?: string) => {
    toast({
      description: error || "Hubo un error al procesar el pago",
      variant: "destructive",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface pt-20">
      {selectedPlan && (
        <PaymentDialog
          planId={selectedPlan.id}
          planName={selectedPlan.nombre}
          price={selectedPlan.precio}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => {
            toast({
              description: "¡Pago procesado exitosamente!",
              variant: "default",
            })
            setSelectedPlan(null)
          }}
          onError={handlePaymentError}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-andika text-primary mb-4">Planes y Precios</h1>
          <p className="text-xl text-text/80 mb-8">
            Elige el plan que mejor se adapte a tus necesidades para honrar la memoria de tus seres queridos
          </p>
        </div>

        {/* Grid de Planes */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {planes.map((plan) => (
            <div key={plan.id} className="relative elegant-card rounded-lg overflow-hidden">
              {/* Etiqueta */}
              {plan.etiqueta && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-background text-xs font-bold px-3 py-1 transform rotate-0 origin-top-right">
                    {plan.etiqueta}
                  </div>
                </div>
              )}

              {/* Encabezado del Plan */}
              <div className="p-6 text-center border-b border-primary/20">
                <h3 className="text-2xl font-andika text-primary mb-4">{plan.nombre}</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-primary">$</span>
                  <span className="text-5xl font-bold text-primary">{plan.precio.toLocaleString()}</span>
                  <span className="text-primary ml-2">{plan.precio > 0 ? "/año" : ""}</span>
                </div>
                {plan.precio === 0 ? (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className="elegant-button w-full py-2 px-4 rounded-md text-background"
                  >
                    Seleccionar Plan
                  </button>
                ) : (
                  <PaymentDialog
                    planId={plan.id}
                    planName={plan.nombre}
                    price={plan.precio}
                    onClose={() => setSelectedPlan(null)}
                    onSuccess={() => {
                      toast({
                        description: "¡Pago procesado exitosamente!",
                        variant: "default",
                      })
                      setSelectedPlan(null)
                    }}
                  />
                )}
              </div>

              {/* Lista de Características */}
              <div className="p-6">
                <ul className="space-y-4">
                  {plan.caracteristicas.map((caracteristica, index) => (
                    <li key={index} className="flex items-start">
                      <Check
                        className={`w-5 h-5 mr-2 flex-shrink-0 ${
                          caracteristica.incluido ? "text-primary" : "text-text/40"
                        }`}
                      />
                      <span
                        className={`text-sm ${caracteristica.incluido ? "text-text/80" : "text-text/40 line-through"}`}
                      >
                        {caracteristica.nombre}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-andika text-primary mb-8 text-center">Preguntas Frecuentes</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-primary mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-text/80">
                Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se aplicarán inmediatamente y
                se ajustará el cobro de manera proporcional.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-text/80">
                Aceptamos todas las tarjetas de crédito y débito principales a través de MercadoPago, garantizando
                transacciones seguras y protegidas.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-2">¿Hay un período de prueba?</h3>
              <p className="text-text/80">
                Ofrecemos un plan gratuito con características básicas que puedes usar por tiempo ilimitado. Para planes
                premium, tienes 30 días de garantía de devolución.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-2">¿Cómo funciona la facturación anual?</h3>
              <p className="text-text/80">
                Con la facturación anual, pagas por 12 meses por adelantado. El plan se renovará automáticamente cada
                año.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

