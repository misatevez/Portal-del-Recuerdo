"use client"
import { useState, useEffect } from "react"
import TributeData from "./TributeData"
import { CreditManager } from "../../components/credits/CreditManager"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../auth/AuthProvider"
import type { Tribute } from "../../types"

export default function TributeDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [tribute, setTribute] = useState<Tribute | null>(null)
  const { user, setUserCredits } = useAuth()
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: tributeData, error } = await supabase
          .from('tributes')
          .select('*')
          .eq('slug', params.slug)
          .single()

        if (error) throw error
        setTribute(tributeData)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.slug])

  useEffect(() => {
    if (user && tribute) {
      setIsOwner(user.id === tribute.created_by)
    }
  }, [user, tribute])

  if (loading) {
    return <div className="min-h-screen bg-surface pt-20 flex items-center justify-center">
      <p className="text-text/60 font-montserrat">Cargando...</p>
    </div>
  }

  return (
    <div className="min-h-screen bg-surface pt-20">
      <TributeData params={params} setUserCredits={setUserCredits} />
      
      {isOwner && tribute && !tribute.es_premium && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-andika text-primary mb-4">Mejorar a Premium</h2>
          <CreditManager 
            userId={user?.id || ''} 
            tribute={tribute} 
            onCreditApplied={() => {
              // Recargar la página para ver los cambios
              router.refresh()
            }} 
          />
        </div>
      )}
    </div>
  )
}

