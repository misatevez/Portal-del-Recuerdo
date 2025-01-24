import React, { useState } from 'react';
import { Phone, Mail, MapPin, Calendar, Clock, Flower } from 'lucide-react';

interface FuneralService {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  servicios: string[];
  horarios: string;
}

export function FuneralServices() {
  const [selectedService, setSelectedService] = useState<FuneralService | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const serviciosDisponibles: FuneralService[] = [
    {
      id: '1',
      nombre: 'Servicios Funerarios San José',
      direccion: 'Calle Principal 123',
      telefono: '+34 912 345 678',
      email: 'contacto@sanjose.com',
      servicios: [
        'Velatorio 24h',
        'Capilla',
        'Traslados',
        'Flores',
        'Música en vivo'
      ],
      horarios: '24 horas, todos los días',
    },
    // Más servicios...
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Servicios Funerarios Asociados
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviciosDisponibles.map((servicio) => (
          <div
            key={servicio.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors cursor-pointer"
            onClick={() => setSelectedService(servicio)}
          >
            <h3 className="font-medium text-gray-900 mb-2">{servicio.nombre}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {servicio.direccion}
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {servicio.telefono}
              </p>
              <p className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {servicio.horarios}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalles del Servicio */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {selectedService.nombre}
                </h2>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedService.direccion}
                </p>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Servicios Disponibles</h3>
                <ul className="space-y-2">
                  {selectedService.servicios.map((servicio, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <Flower className="w-4 h-4 mr-2 text-indigo-600" />
                      {servicio}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Información de Contacto</h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {selectedService.telefono}
                  </p>
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {selectedService.email}
                  </p>
                  <p className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {selectedService.horarios}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cerrar
              </button>
              <button
                onClick={() => setShowContactForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Solicitar Información
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
