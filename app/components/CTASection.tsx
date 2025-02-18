"use client"

import { useRouter } from "next/navigation"

export default function CTASection() {
  const router = useRouter()

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-andika text-primary mb-6">Crea un Homenaje</h2>
        <p className="text-text/80 mb-8 max-w-2xl mx-auto font-montserrat">
          Un tributo virtual gratuito para recordar y celebrar la vida de quienes siempre estarán en nuestro corazón.
        </p>
        <button
          onClick={() => router.push("/crear-homenaje")}
          className="elegant-button px-8 py-3 rounded-full inline-flex items-center font-andika"
        >
          Comenzar Ahora
        </button>
      </div>
    </section>
  )
}

