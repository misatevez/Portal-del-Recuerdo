import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Candy as Candle, Book, Camera, Music2, Search, Users, Calendar, MapPin } from 'lucide-react';
import { supabase } from './lib/supabase';
import { TributeCard } from './components/tributes/TributeCard';

function App() {
  const [recentTributes, setRecentTributes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentTributes() {
      try {
        const { data, error } = await supabase
          .from('tributes')
          .select('*, candles!left(count)')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentTributes(data || []);
      } catch (err) {
        console.error('Error al cargar homenajes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRecentTributes();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-30" 
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?auto=format&fit=crop&q=80")',
          }}
        />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif text-primary mb-6">
            Honrar la Memoria de Nuestros Seres Queridos
          </h1>
          <p className="text-xl text-text/80 mb-8">
            Un espacio digital para mantener vivo el recuerdo de quienes amamos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/crear-homenaje"
              className="elegant-button px-8 py-3 rounded-full font-medium"
            >
              Crear Homenaje
            </Link>
            <Link
              to="/explorar"
              className="px-8 py-3 rounded-full font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
            >
              Explorar Homenajes
            </Link>
          </div>
        </div>
      </header>

      {/* Barra de Búsqueda */}
      <div className="relative -mt-8 z-10 max-w-2xl mx-auto px-4">
        <div className="elegant-card p-4 rounded-lg backdrop-blur-md">
          <div className="flex items-center">
            <Search className="w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder="Buscar homenajes por nombre..."
              className="elegant-input ml-3 flex-1 bg-transparent outline-none"
            />
            <Link 
              to="/explorar"
              className="elegant-button ml-4 px-4 py-2 rounded-md"
            >
              Buscar
            </Link>
          </div>
        </div>
      </div>

      {/* Características */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif text-primary text-center mb-16">
            Un Espacio para Recordar
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="elegant-card p-8 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif text-primary mb-4">Homenajes Personalizados</h3>
              <p className="text-text/80">
                Crea un espacio único y significativo para honrar la memoria de tus seres queridos.
              </p>
            </div>

            <div className="elegant-card p-8 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif text-primary mb-4">Memorias Compartidas</h3>
              <p className="text-text/80">
                Comparte recuerdos, fotos y mensajes con familiares y amigos en un espacio privado.
              </p>
            </div>

            <div className="elegant-card p-8 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Candle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif text-primary mb-4">Velas Virtuales</h3>
              <p className="text-text/80">
                Enciende una vela virtual como símbolo de recuerdo y respeto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Últimos Homenajes */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif text-primary text-center mb-4">
            Últimos Homenajes
          </h2>
          <p className="text-text/80 text-center mb-16 max-w-2xl mx-auto">
            Descubre los homenajes más recientes creados por nuestra comunidad para honrar la memoria de sus seres queridos.
          </p>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-primary/10 h-64 rounded-lg mb-4" />
                  <div className="h-4 bg-primary/10 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-primary/10 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {recentTributes.map((tribute) => (
                <TributeCard
                  key={tribute.id}
                  id={tribute.id}
                  nombre={tribute.nombre}
                  fechaNacimiento={tribute.fecha_nacimiento}
                  fechaFallecimiento={tribute.fecha_fallecimiento}
                  imagen={tribute.imagen_principal || 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80'}
                  velasEncendidas={tribute.candles?.[0]?.count || 0}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/explorar"
              className="elegant-button px-8 py-3 rounded-full inline-flex items-center"
            >
              Ver Todos los Homenajes
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-primary mb-6">
            Crea un Homenaje Hoy
          </h2>
          <p className="text-text/80 mb-8 max-w-2xl mx-auto">
            Honra la memoria de tus seres queridos creando un espacio digital único donde familiares y amigos puedan compartir recuerdos, fotos y mensajes.
          </p>
          <Link
            to="/crear-homenaje"
            className="elegant-button px-8 py-3 rounded-full inline-flex items-center"
          >
            Comenzar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
}

export default App;
