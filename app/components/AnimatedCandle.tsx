"use client"

import React from 'react';

// Define a keyframes animation for the flame flicker
const keyframes = `
  @keyframes flicker {
    0%, 100% {
      transform: scaleY(1) rotate(0deg);
      opacity: 1;
    }
    50% {
      transform: scaleY(0.95) rotate(1deg);
      opacity: 0.8;
    }
  }
`;

interface AnimatedCandleProps {
  authorName?: string;
}

export const AnimatedCandle: React.FC<AnimatedCandleProps> = ({ authorName }) => {
  return (
    <>
      <style>{keyframes}</style>
      <div className="flex flex-col items-center p-2">
        <div 
          className="relative w-2 h-4 bg-yellow-300 rounded-full"
          style={{ 
            animation: 'flicker 1.5s infinite ease-in-out',
            boxShadow: '0 0 5px #fef08a, 0 0 10px #fef08a, 0 0 15px #fde047, 0 0 20px #facc15',
            transformOrigin: 'bottom',
          }}
        >
          {/* Flame core */}
          <div 
            className="absolute bottom-0 w-full h-1/2 bg-orange-400 rounded-full"
            style={{ filter: 'blur(2px)' }}
          />
        </div>
        {/* Wick */}
        <div className="w-0.5 h-1 bg-gray-700" />
        {/* Candle Body */}
        <div className="w-5 h-12 bg-stone-100 rounded-t-sm shadow-inner" 
             style={{boxShadow: 'inset 2px -2px 2px rgba(0,0,0,0.1)'}}/>
        {authorName && (
          <p className="mt-2 text-xs text-center text-text/70 font-montserrat truncate w-20">
            {authorName}
          </p>
        )}
      </div>
    </>
  );
};
