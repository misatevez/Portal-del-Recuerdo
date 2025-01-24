import React from 'react';

export function CandleAnimation() {
  return (
    <div className="relative w-6 h-12">
      {/* Vela */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-8 bg-gradient-to-b from-gray-100 to-gray-200 rounded-sm" />
      
      {/* Mecha */}
      <div className="absolute bottom-[32px] left-1/2 -translate-x-1/2 w-[2px] h-2 bg-gray-700" />
      
      {/* Llama */}
      <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2">
        <div className="relative w-2 h-4">
          {/* Núcleo de la llama */}
          <div className="absolute inset-0 bg-blue-50 rounded-full animate-flame-flicker" />
          
          {/* Llama exterior */}
          <div className="absolute inset-0 bg-orange-400 rounded-full mix-blend-screen animate-flame-sway opacity-90" />
          
          {/* Brillo */}
          <div className="absolute inset-0 bg-yellow-200 rounded-full mix-blend-screen animate-flame-glow opacity-70" />
        </div>
      </div>
    </div>
  );
}
