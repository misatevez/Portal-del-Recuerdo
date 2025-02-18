"use client"

import { useRouter } from "next/navigation"

export default function HeroSection() {
  const router = useRouter()

  return (
    <header className="relative h-[70vh] flex items-center justify-center overflow-hidden pt-20">
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-30"
        style={{
          backgroundImage:
            'url("https://ofydbwoelrfsczadkicf.supabase.co/storage/v1/object/public/storage//fondo-sin-filtro.jpg")',
        }}
      />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-andika text-primary mb-6">
          Un espacio para honrar, recordar y mantener vivo el legado de quienes amamos
        </h1>
        <p className="text-xl text-text/80 font-montserrat mb-8">
          Un rincón virtual para preservar la memoria y compartir amor
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/crear-homenaje")}
            className="elegant-button px-8 py-3 rounded-full font-andika"
          >
            Crear Homenaje
          </button>
          <button
            onClick={() => router.push("/explorar")}
            className="px-8 py-3 rounded-full font-andika border border-[#c9ab81]/30 text-primary hover:bg-primary/10 transition-colors"
          >
            Explorar Homenajes
          </button>
        </div>
      </div>
    </header>
  )
}

