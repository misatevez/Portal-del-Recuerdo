import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, AlertCircle, Heart } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-serif text-primary">Portal del Recuerdo</h2>
          <p className="mt-2 text-text/80">Bienvenido de nuevo</p>
        </div>

        <form onSubmit={handleSubmit} className="elegant-card p-8 rounded-lg backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md flex items-center text-red-200">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text/80 mb-2" htmlFor="email">
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
                  className="elegant-input block w-full pl-10 pr-3 py-2 rounded-md"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-2" htmlFor="password">
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
                  className="elegant-input block w-full pl-10 pr-3 py-2 rounded-md"
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
                  className="h-4 w-4 rounded border-primary/30 bg-surface text-primary focus:ring-primary/50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text/80">
                  Recordarme
                </label>
              </div>
              <Link to="/recuperar-password" className="text-sm text-primary hover:text-primary/80">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="elegant-button w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-text/60">O continúa con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-primary/30 rounded-md shadow-sm bg-surface text-sm font-medium text-text/80 hover:bg-surface/80"
              >
                Google
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-primary/30 rounded-md shadow-sm bg-surface text-sm font-medium text-text/80 hover:bg-surface/80"
              >
                Facebook
              </button>
            </div>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-text/60">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="font-medium text-primary hover:text-primary/80">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
