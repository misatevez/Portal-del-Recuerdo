import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { TributeContent } from "./TributeContent"

export default async function TributeData({ params }: { params: { slug: string } }) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: tribute, error } = await supabase
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

  if (error) {
    console.error("Error fetching tribute:", error)
    notFound()
  }

  if (!tribute) {
    notFound()
  }

  return <TributeContent tribute={tribute} user={session?.user || null} />
}

