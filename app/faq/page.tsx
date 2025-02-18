import Link from "next/link"
import { ChevronDown } from "lucide-react"

export default function FAQPage() {
  const faqs = [
    {
      question: "¿Qué es Portal del Recuerdo?",
      answer:
        "Portal del Recuerdo es una plataforma digital que permite crear y compartir homenajes en línea para honrar la memoria de seres queridos que han fallecido.",
    },
    {
      question: "¿Cómo puedo crear un homenaje?",
      answer:
        "Para crear un homenaje, primero debes registrarte en nuestra plataforma. Una vez que hayas iniciado sesión, puedes hacer clic en el botón 'Crear Homenaje' y seguir las instrucciones para añadir información, fotos y recuerdos de tu ser querido.",
    },
    {
      question: "¿Es gratis crear un homenaje?",
      answer:
        "Ofrecemos un plan básico gratuito que te permite crear un homenaje con funcionalidades esenciales. También tenemos planes premium con características adicionales para quienes deseen una experiencia más personalizada.",
    },
    {
      question: "¿Quién puede ver los homenajes que creo?",
      answer:
        "Por defecto, los homenajes son públicos y pueden ser vistos por cualquier persona. Sin embargo, puedes ajustar la configuración de privacidad para controlar quién puede ver y comentar en el homenaje.",
    },
    {
      question: "¿Puedo añadir fotos y videos a un homenaje?",
      answer:
        "Sí, puedes subir fotos y, dependiendo de tu plan, también videos para enriquecer el homenaje de tu ser querido.",
    },
    {
      question: "¿Cómo puedo invitar a otros a contribuir al homenaje?",
      answer:
        "Puedes compartir el enlace del homenaje con familiares y amigos. Ellos podrán dejar mensajes, encender velas virtuales y, si lo permites, añadir sus propias fotos y recuerdos.",
    },
    {
      question: "¿Qué hago si encuentro contenido inapropiado en un homenaje?",
      answer:
        "Tenemos una política estricta contra el contenido inapropiado. Si encuentras algo que viola nuestras normas, por favor repórtalo usando el botón 'Reportar' en la página del homenaje. Nuestro equipo lo revisará lo antes posible.",
    },
    {
      question: "¿Puedo eliminar un homenaje que he creado?",
      answer:
        "Sí, puedes eliminar un homenaje que hayas creado en cualquier momento desde la configuración del homenaje. Ten en cuenta que esta acción es irreversible.",
    },
  ]

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-andika text-primary mb-8 text-center">Preguntas Frecuentes</h1>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="elegant-card p-6 rounded-lg">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="text-lg font-andika text-primary">{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-primary transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-text/80 font-montserrat">{faq.answer}</p>
              </details>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-text/80 font-montserrat mb-4">
            ¿No encuentras la respuesta que buscas? Contáctanos directamente.
          </p>
          <Link href="/contacto" className="elegant-button px-6 py-2 rounded-md font-andika inline-block">
            Contactar Soporte
          </Link>
        </div>
      </div>
    </div>
  )
}

