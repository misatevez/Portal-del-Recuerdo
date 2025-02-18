import Link from "next/link"
import { TributeCard } from "../TributeCard"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

async function getRecentTributes() {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase
    .from("tributes")
    .select("*, candles!left(count)")
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    console.error("Error al cargar homenajes:", error)
    return []
  }

  return data || []
}

export default async function RecentTributes() {
  const recentTributes = await getRecentTributes()

  return (
    <section className="py-20 px-4 bg-surface">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-andika text-primary text-center mb-4">Últimos Homenajes</h2>
        <p className="text-text/80 font-montserrat text-center mb-16 max-w-2xl mx-auto">
          Descubre los homenajes más recientes creados por nuestra comunidad.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 justify-items-center mb-16">
          {recentTributes.map((tribute) => (
            <TributeCard
              key={tribute.id}
              id={tribute.id}
              slug={tribute.slug}
              nombre={tribute.nombre}
              fechaNacimiento={tribute.fecha_nacimiento}
              fechaFallecimiento={tribute.fecha_fallecimiento}
              imagen={
                tribute.imagen_principal ||
                "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80"
              }
              isOwner={false}
              onEdit={() => {}}
              onDelete={() => {}}
              onTogglePremium={() => {}}
            />
          ))}
        </div>

        <div className="text-center">
          <Link href="/explorar" className="elegant-button px-8 py-3 rounded-full inline-flex items-center font-andika">
            Ver Todos los Homenajes
          </Link>
        </div>
      </div>
    </section>
  )
}

