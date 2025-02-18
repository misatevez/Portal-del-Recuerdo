"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, AlertCircle, Heart } from "lucide-react"
import { supabase } from "../lib/supabase"

export function RegisterForm() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
          },
        },
      })

      if (error) throw error

      // Redirect to profile page on success
      router.push("/perfil")
    } catch (err: any) {
      setError(
        err.message === "User already registered"
          ? "El usuario ya está registrado"
          : err.message === "Invalid email or password"
            ? "Correo electrónico o contraseña inválidos"
            : "Error al registrar usuario. Por favor, inténtalo de nuevo.",
      )
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
        <p className="mt-2 text-text/80 font-montserrat">Crea tu cuenta</p>
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
            <label className="block text-sm font-medium text-text/80 mb-2 font-montserrat" htmlFor="nombre">
              Nombre Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-primary/60" />
              </div>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="elegant-input block w-full pl-10 pr-3 py-2 rounded-md font-montserrat"
                placeholder="Juan Pérez"
                required
              />
            </div>
          </div>

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
                minLength={6}
              />
            </div>
            <p className="mt-2 text-sm text-text/60 font-montserrat">La contraseña debe tener al menos 6 caracteres</p>
          </div>

          <div className="flex items-center">
            <input
              id="terminos"
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              className="h-4 w-4 rounded border-primary/30 bg-surface text-primary focus:ring-primary/50"
              required
            />
            <label htmlFor="terminos" className="ml-2 block text-sm text-text/80 font-montserrat">
              Acepto los{" "}
              <Link href="/terminos" className="text-primary hover:text-primary/80">
                términos y condiciones
              </Link>
            </label>
          </div>
          {!aceptaTerminos && (
            <p className="mt-2 text-sm text-red-500 font-montserrat">
              Debes aceptar los términos y condiciones para continuar.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !aceptaTerminos}
            className="elegant-button w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium disabled:opacity-50 font-andika"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-text/60 font-montserrat">O continúa con</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-primary/30 rounded-md shadow-sm bg-surface text-sm font-medium text-text/80 hover:bg-surface/80 transition-colors duration-200 font-montserrat"
            >
              Google
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-primary/30 rounded-md shadow-sm bg-surface text-sm font-medium text-text/80 hover:bg-surface/80 transition-colors duration-200 font-montserrat"
            >
              Facebook
            </button>
          </div>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-text/60 font-montserrat">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  )
}

