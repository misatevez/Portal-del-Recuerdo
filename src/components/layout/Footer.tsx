import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-primary/20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Heart className="w-6 h-6 text-primary" />
              <span className="ml-2 text-xl font-serif text-primary">Portal del Recuerdo</span>
            </div>
            <p className="text-text/80">
              Dedicados a preservar y honrar la memoria de nuestros seres queridos a través de homenajes digitales significativos.
            </p>
          </div>
          
          <div>
            <h3 className="text-primary font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-text/80 hover:text-primary">Inicio</Link></li>
              <li><Link to="/explorar" className="text-text/80 hover:text-primary">Explorar</Link></li>
              <li><Link to="/crear-homenaje" className="text-text/80 hover:text-primary">Crear Homenaje</Link></li>
              <li><Link to="/precios" className="text-text/80 hover:text-primary">Precios</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-primary font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2">
              <li><Link to="/ayuda" className="text-text/80 hover:text-primary">Centro de Ayuda</Link></li>
              <li><Link to="/contacto" className="text-text/80 hover:text-primary">Contacto</Link></li>
              <li><Link to="/faq" className="text-text/80 hover:text-primary">Preguntas Frecuentes</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-primary font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-text/80">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                info@portaldelrecuerdo.com
              </li>
              <li className="flex items-center text-text/80">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                +34 900 123 456
              </li>
              <li className="flex items-center text-text/80">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                Madrid, España
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary/20 mt-8 pt-8 text-center text-text/60">
          © {new Date().getFullYear()} Portal del Recuerdo. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
