"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, AlertCircle, Heart, Chrome, Facebook } from "lucide-react"
import { supabase } from "../lib/supabase"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<React.ReactNode | string>("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Verificar si el error es porque el email no está verificado
        if (error.message.includes("Email not confirmed")) {
          setError(
            <span>
              Tu correo electrónico aún no ha sido verificado. Por favor, revisa tu bandeja de entrada y confirma tu cuenta. 
              Si no lo encuentras, puedes reenviar el correo de verificación{" "}
              <Link href="/registro/reenviar" className="text-primary underline">
                aquí
              </Link>
            </span>
          )
          return
        }
        throw error
      }

      // Redirect to profile page on success
      router.push("/perfil")
      router.refresh() // Refresh the page to update the session state
    } catch (err: any) {
      setError(
        err.message === "Invalid login credentials"
          ? "Credenciales de inicio de sesión inválidas"
          : "Error al iniciar sesión. Por favor, inténtalo de nuevo.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError("")
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(`Error al iniciar sesión con ${provider}: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo y Título */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-andika text-primary">Portal del Recuerdo</h2>
        <p className="mt-2 text-text/80 font-montserrat">Bienvenido de nuevo</p>
      </div>

      <form onSubmit={handleSubmit} className="elegant-card p-8 rounded-lg backdrop-blur-md">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md flex items-center text-red-200">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="font-montserrat">{error}</span>
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

          <div>
            <label className="block text-sm font-medium text-text/80 mb-2 font-montserrat" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-primary/60" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="elegant-input block w-full pl-10 pr-3 py-2 rounded-md font-montserrat"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-primary/30 bg-surface text-primary focus:ring-primary/50"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-text/80 font-montserrat">
                Recordarme
              </label>
            </div>
            <Link href="/recuperar-password" className="text-sm text-primary hover:text-primary/80 font-montserrat">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="elegant-button w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium disabled:opacity-50 font-andika"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-center">
            <div className="flex-grow border-t border-primary/20"></div>
            <span className="mx-4 text-text/60 font-montserrat text-sm">O continúa con</span>
            <div className="flex-grow border-t border-primary/20"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-primary/30 rounded-md shadow-sm bg-surface text-sm font-medium text-text/80 hover:bg-surface/80 font-montserrat"
            >
              <Chrome className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="w-full inline-flex justify-center py-2 px-4 border border-primary/30 rounded-md shadow-sm bg-surface text-sm font-medium text-text/80 hover:bg-surface/80 font-montserrat"
            >
              <Facebook className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-text/60 font-montserrat">
        ¿No tienes una cuenta?{" "}
        <Link href="/registro" className="font-medium text-primary hover:text-primary/80">
          Regístrate aquí
        </Link>
      </p>
    </div>
  )
}