import React, { useState } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { User, Settings, Grid, Clock, Loader, Heart, Mail, Calendar } from 'lucide-react';
import { TributeCard } from '../components/tributes/TributeCard';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'homenajes' | 'actividad' | 'ajustes'>('homenajes');
  const [profile, setProfile] = useState({
    nombre: '',
    email: user?.email || '',
    notificaciones: true,
    privacidad: 'public' as 'public' | 'private',
  });

  const [tributes, setTributes] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function loadProfileData() {
      setLoading(true);
      try {
        // Cargar perfil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(prev => ({
            ...prev,
            nombre: profileData.nombre,
          }));
        }

        // Cargar homenajes
        const { data: tributesData } = await supabase
          .from('tributes')
          .select(`
            *,
            candles(count)
          `)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        setTributes(tributesData || []);

        // Cargar actividad reciente
        const { data: activityData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        setActivity(activityData || []);
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nombre: profile.nombre,
        })
        .eq('id', user?.id);

      if (error) throw error;
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Cabecera del Perfil */}
        <div className="elegant-card p-8 rounded-lg mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-primary">{profile.nombre}</h1>
              <div className="flex items-center gap-4 mt-2 text-text/60">
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {profile.email}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Miembro desde {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por Pestañas */}
        <div className="border-b border-primary/20 mb-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('homenajes')}
              className={`pb-4 relative ${
                activeTab === 'homenajes'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text'
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5" />
                <span>Mis Homenajes</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('actividad')}
              className={`pb-4 relative ${
                activeTab === 'actividad'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Actividad Reciente</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('ajustes')}
              className={`pb-4 relative ${
                activeTab === 'ajustes'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text/60 hover:text-text'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <span>Ajustes</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Contenido de las Pestañas */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Mis Homenajes */}
            {activeTab === 'homenajes' && (
              <div>
                {tributes.length === 0 ? (
                  <div className="elegant-card p-12 text-center">
                    <Heart className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                    <p className="text-text/80 mb-6">
                      Aún no has creado ningún homenaje.
                    </p>
                    <button
                      onClick={() => navigate('/crear-homenaje')}
                      className="elegant-button px-6 py-2 rounded-md"
                    >
                      Crear Homenaje
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tributes.map((tribute) => (
                      <TributeCard
                        key={tribute.id}
                        id={tribute.id}
                        nombre={tribute.nombre}
                        fechaNacimiento={tribute.fecha_nacimiento}
                        fechaFallecimiento={tribute.fecha_fallecimiento}
                        imagen={tribute.imagen_principal || 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80'}
                        velasEncendidas={tribute.candles[0]?.count || 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actividad Reciente */}
            {activeTab === 'actividad' && (
              <div className="space-y-4">
                {activity.length === 0 ? (
                  <div className="elegant-card p-12 text-center">
                    <Clock className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                    <p className="text-text/80">
                      No hay actividad reciente.
                    </p>
                  </div>
                ) : (
                  activity.map((item) => (
                    <div
                      key={item.id}
                      className="elegant-card p-4 rounded-lg flex items-start gap-4"
                    >
                      <div className="text-2xl">
                        {item.tipo === 'vela' ? '🕯️' : 
                         item.tipo === 'comentario' ? '💬' : '📢'}
                      </div>
                      <div>
                        <p className="text-text">{item.mensaje}</p>
                        <p className="text-sm text-text/60 mt-1">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Ajustes */}
            {activeTab === 'ajustes' && (
              <div className="max-w-2xl">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="elegant-card p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-primary mb-6">Información Personal</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text/80 mb-2">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={profile.nombre}
                          onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                          className="elegant-input w-full px-3 py-2 rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text/80 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full px-3 py-2 border border-primary/20 rounded-md bg-surface/50 text-text/60"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="elegant-card p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-primary mb-6">Preferencias</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.notificaciones}
                            onChange={(e) => setProfile({ ...profile, notificaciones: e.target.checked })}
                            className="h-4 w-4 rounded border-primary/30 bg-surface text-primary focus:ring-primary/50"
                          />
                          <span className="ml-2 text-text/80">
                            Recibir notificaciones por email
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text/80 mb-2">
                          Privacidad
                        </label>
                        <select
                          value={profile.privacidad}
                          onChange={(e) => setProfile({
                            ...profile,
                            privacidad: e.target.value as 'public' | 'private'
                          })}
                          className="elegant-input w-full px-3 py-2 rounded-md"
                        >
                          <option value="public">Público</option>
                          <option value="private">Privado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-4 py-2 border border-primary/30 rounded-md text-text hover:bg-primary/10"
                    >
                      Cerrar Sesión
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="elegant-button px-6 py-2 rounded-md disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
