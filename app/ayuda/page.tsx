"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ChevronDown, Book, LifeBuoy, Mail } from "lucide-react"

export default function AyudaPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const faqs = [
    {
      question: "¿Cómo puedo crear un homenaje?",
      answer:
        "Para crear un homenaje, inicia sesión en tu cuenta y haz clic en el botón 'Crear Homenaje' en la página principal. Sigue las instrucciones para añadir información, fotos y recuerdos de tu ser querido.",
    },
    {
      question: "¿Puedo editar un homenaje después de crearlo?",
      answer:
        "Sí, puedes editar un homenaje en cualquier momento. Ve a tu perfil, encuentra el homenaje que deseas modificar y haz clic en 'Editar'.",
    },
    {
      question: "¿Cómo puedo invitar a otros a contribuir a un homenaje?",
      answer:
        "En la página del homenaje, encontrarás un botón para compartir. Puedes copiar el enlace o usar las opciones de compartir en redes sociales para invitar a otros a ver y contribuir al homenaje.",
    },
    {
      question: "¿Qué tipos de contenido puedo añadir a un homenaje?",
      answer:
        "Puedes añadir texto, fotos, videos (en planes premium), y encender velas virtuales. También puedes permitir que otros dejen mensajes y recuerdos.",
    },
    {
      question: "¿Cómo funciona la privacidad de los homenajes?",
      answer:
        "Por defecto, los homenajes son públicos. Sin embargo, puedes ajustar la configuración de privacidad para hacerlos visibles solo a personas invitadas.",
    },
  ]

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-andika text-primary mb-8 text-center">Centro de Ayuda</h1>

        {/* Barra de búsqueda */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="elegant-input w-full pl-10 pr-4 py-2 rounded-md font-montserrat"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60" />
          </div>
        </div>

        {/* Secciones de ayuda */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Link href="/faq" className="elegant-card p-6 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Book className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-andika text-primary">Preguntas Frecuentes</h2>
            </div>
            <p className="text-text/80 font-montserrat">
              Encuentra respuestas a las preguntas más comunes sobre nuestro servicio.
            </p>
          </Link>
          <Link href="/contacto" className="elegant-card p-6 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <LifeBuoy className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-andika text-primary">Soporte Técnico</h2>
            </div>
            <p className="text-text/80 font-montserrat">
              ¿Necesitas ayuda técnica? Contáctanos para resolver tus problemas.
            </p>
          </Link>
          <Link href="/contacto" className="elegant-card p-6 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-andika text-primary">Contáctanos</h2>
            </div>
            <p className="text-text/80 font-montserrat">Envíanos un mensaje y te responderemos lo antes posible.</p>
          </Link>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-andika text-primary mb-6">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <details key={index} className="elegant-card p-4 rounded-lg">
                <summary className="font-andika text-primary text-lg cursor-pointer flex justify-between items-center">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 text-primary" />
                </summary>
                <p className="mt-2 text-text/80 font-montserrat">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Sección de contacto */}
        <div className="text-center">
          <h2 className="text-2xl font-andika text-primary mb-4">¿No encuentras lo que buscas?</h2>
          <p className="text-text/80 font-montserrat mb-4">Estamos aquí para ayudarte. Contáctanos directamente.</p>
          <Link href="/contacto" className="elegant-button px-6 py-2 rounded-md font-andika inline-block">
            Contactar Soporte
          </Link>
        </div>
      </div>
    </div>
  )
}

