import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export function ErrorPage() {
  const error = useRouteError() as any;
  const is404 = error?.status === 404;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-4xl font-serif text-gray-900 mb-4">
          {is404 ? 'Página no encontrada' : 'Ha ocurrido un error'}
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          {is404 
            ? 'Lo sentimos, la página que buscas no existe o ha sido movida.'
            : 'Lo sentimos, ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.'}
        </p>

        <Link 
          to="/"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
        >
          <Home className="w-5 h-5 mr-2" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
