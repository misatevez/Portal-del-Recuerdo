import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, X, Search, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { supabase } from '../../lib/supabase';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('moderators')
          .select('role')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle() instead of single()

        setIsAdmin(data?.role === 'admin');
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // No need to navigate here, AuthProvider will handle it
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-surface/90 backdrop-blur-md border-b border-primary/20 fixed w-full z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <Heart className="w-6 h-6 text-primary" />
            <span className="ml-2 text-xl font-serif text-primary">Portal del Recuerdo</span>
          </Link>

          {/* Navegación Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/explorar" className="text-text hover:text-primary transition-colors">
              Explorar
            </Link>
            <Link to="/precios" className="text-text hover:text-primary transition-colors">
              Precios
            </Link>
            {user ? (
              <>
                <Link to="/crear-homenaje" className="text-text hover:text-primary transition-colors">
                  Crear Homenaje
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-text hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <NotificationCenter />
                <Link to="/perfil" className="text-text hover:text-primary transition-colors">
                  Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-text hover:text-primary transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text hover:text-primary transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="elegant-button px-6 py-2 rounded-full"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="text-text hover:text-primary"
            >
              {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {menuAbierto && (
        <div className="md:hidden bg-surface/95 backdrop-blur-md border-t border-primary/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/explorar"
              className="block px-3 py-2 text-text hover:text-primary rounded-md"
            >
              Explorar
            </Link>
            <Link
              to="/precios"
              className="block px-3 py-2 text-text hover:text-primary rounded-md"
            >
              Precios
            </Link>
            {user ? (
              <>
                <Link
                  to="/crear-homenaje"
                  className="block px-3 py-2 text-text hover:text-primary rounded-md"
                >
                  Crear Homenaje
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-text hover:text-primary rounded-md flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/perfil"
                  className="block px-3 py-2 text-text hover:text-primary rounded-md"
                >
                  Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="block px-3 py-2 text-text hover:text-primary rounded-md flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-text hover:text-primary rounded-md"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="block px-3 py-2 text-text hover:text-primary rounded-md"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
