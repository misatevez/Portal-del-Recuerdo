"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "react-hot-toast"
import { loginWithEmail } from "./actions"
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Mail, Lock, Heart } from 'lucide-react'
import Link from 'next/link'

export default function LoginForm() {
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    console.log(`[LoginForm] Attempting social login with ${provider}.`);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(`[LoginForm] Social login error with ${provider}:`, error);
      toast.error(`Error al iniciar con ${provider}: ${error.message}`);
    }
  };

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

      <form action={loginWithEmail} className="elegant-card p-8 rounded-lg backdrop-blur-md">
        {message && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md flex items-center text-red-200">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
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
                name="email"
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
                name="password"
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
                name="remember-me"
                type="checkbox"
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
            className="elegant-button w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium font-andika"
          >
            Iniciar Sesión
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
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="w-full inline-flex justify-center py-2 px-4 border border-primary/30 rounded-md shadow-sm bg-surface text-sm font-medium text-text/80 hover:bg-surface/80 font-montserrat"
            >
              Facebook
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