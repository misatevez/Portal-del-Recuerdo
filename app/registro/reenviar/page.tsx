"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Mail, AlertCircle } from "lucide-react"
import { supabase } from "../../lib/supabase"

export default function ReenviarPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (error) throw error

      setMessage("Hemos enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada.")
    } catch (err: any) {
      setError("No pudimos reenviar el correo. Por favor, verifica que la dirección sea correcta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-andika text-primary">Portal del Recuerdo</h2>
          <p className="mt-2 text-text/80 font-montserrat">Reenviar correo de verificación</p>
        </div>

        <form onSubmit={handleSubmit} className="elegant-card p-8 rounded-lg backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md flex items-center text-red-200">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-montserrat">{error}</span>
            </div>
          )}
          
          {message && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-md flex items-center text-green-200">
              <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-montserrat">{message}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text/80 mb-2 font-montserrat" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-primary/60" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="elegant-input block w-full pl-10 pr-3 py-2 rounded-md font-montserrat"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="elegant-button w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium disabled:opacity-50 font-andika"
            >
              {loading ? "Enviando..." : "Reenviar correo de verificación"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-text/60 font-montserrat">
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
} 