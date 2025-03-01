"use client"
import { useState, useEffect } from "react"
import TributeData from "./TributeData"
import { CreditManager } from "../../components/credits/CreditManager"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import type { Tribute, User } from "../../types"

export default function TributeDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [tribute, setTribute] = useState<Tribute | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el usuario actual
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)
        
        // Obtener el homenaje
        const { data: tributeData, error } = await supabase
          .from('tributes')
          .select('*')
          .eq('slug', params.slug)
          .single()
        
        if (error) throw error
        
        setTribute(tributeData)
        setIsOwner(currentUser?.id === tributeData.user_id)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [params.slug])

  if (loading) {
    return <div className="min-h-screen bg-surface pt-20 flex items-center justify-center">
      <p className="text-text/60 font-montserrat">Cargando...</p>
    </div>
  }

  return (
    <div className="min-h-screen bg-surface pt-20">
      <TributeData params={params} />
      
      {isOwner && tribute && !tribute.is_premium && (
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

