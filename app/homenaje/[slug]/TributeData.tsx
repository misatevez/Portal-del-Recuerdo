"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { TributeContent } from "./TributeContent"
import type { Tribute } from "../../types"

export default function TributeData({ params }: { params: { slug: string } }) {
  const [tribute, setTribute] = useState<Tribute | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Obtener la sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Obtener el homenaje
    async function fetchTribute() {
      try {
        const { data, error } = await supabase
          .from("tributes")
          .select(`
            *,
            profiles:created_by(nombre),
            comments(
              id,
              contenido,
              created_at,
              profiles(nombre)
            ),
            candles(
              id,
              mensaje,
              profiles(nombre)
            ),
            photos(
              id,
              url,
              descripcion
            )
          `)
          .eq("slug", params.slug)
          .single()

        if (error) throw error
        if (!data) throw new Error("Homenaje no encontrado")

        setTribute(data)
      } catch (err) {
        setError(err as Error)
        console.error("Error fetching tribute:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTribute()
  }, [params.slug])

  if (loading) {
    return <div>Cargando...</div>
  }

  if (error || !tribute) {
    router.push("/404")
    return null
  }

  return <TributeContent tribute={tribute} user={session?.user || null} />
}