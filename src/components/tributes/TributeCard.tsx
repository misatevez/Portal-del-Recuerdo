import React from 'react';
import { Link } from 'react-router-dom';
import { Candy as Candle } from 'lucide-react';

interface TributeCardProps {
  id: string;
  nombre: string;
  fechaNacimiento: string;
  fechaFallecimiento: string;
  imagen: string;
  velasEncendidas: number;
}

export function TributeCard({
  id,
  nombre,
  fechaNacimiento,
  fechaFallecimiento,
  imagen,
  velasEncendidas,
}: TributeCardProps) {
  const añoNacimiento = new Date(fechaNacimiento).getFullYear();
  const añoFallecimiento = new Date(fechaFallecimiento).getFullYear();

  return (
    <Link to={`/homenaje/${id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div
          className="h-48 bg-cover bg-center"
          style={{
            backgroundImage: `url(${imagen})`,
          }}
        />
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{nombre}</h3>
          <p className="text-gray-600 mb-4">{añoNacimiento} - {añoFallecimiento}</p>
          <div className="flex items-center text-gray-500 text-sm">
            <Candle className="w-4 h-4 mr-2" />
            <span>{velasEncendidas} velas encendidas</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
