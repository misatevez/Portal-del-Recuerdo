"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { toast } from "react-hot-toast"

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const updateCredits = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No user found")

        // Primero, obtener los créditos actuales del perfil del usuario
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const currentCredits = profile?.credits || 0;
        const newCredits = currentCredits + 1; // Asumiendo que cada compra es de 1 crédito

        // Luego, actualizar el perfil con el nuevo total de créditos
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', user.id);

        if (updateError) throw updateError;

        toast.success("¡Compra exitosa! Se ha añadido el crédito a tu cuenta")
        router.push("/perfil")
      } catch (error) {
        console.error("Error updating credits:", error)
        toast.error("Error al actualizar los créditos")
      }
    }

    updateCredits()
  }, [])

  return (
    <div className="min-h-screen bg-surface pt-20 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-andika text-primary mb-4">Procesando tu pago...</h1>
        <p className="text-text/80">Por favor, espera mientras actualizamos tu cuenta.</p>
      </div>
    </div>
  )
} 