"use client"

import React from "react"

export function AnimatedCandle() {
  return (
    <>
      <style jsx>{`
        .flame {
          animation: flicker 1.5s infinite linear;
          transform-origin: 50% 100%;
        }

        @keyframes flicker {
          0% { transform: scaleY(1) skewX(0); opacity: 1; }
          25% { transform: scaleY(0.9) skewX(-2deg); opacity: 0.9; }
          50% { transform: scaleY(1.1) skewX(2deg); opacity: 1; }
          75% { transform: scaleY(0.95) skewX(3deg); opacity: 0.95; }
          100% { transform: scaleY(1) skewX(0); opacity: 1; }
        }
      `}</style>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
      >
        <ellipse
          className="flame"
          cx="12"
          cy="6"
          rx="2"
          ry="4"
          fill="#FBBF24"
        />
        <line x1="12" y1="10" x2="12" y2="8" stroke="black" strokeWidth="0.5" />
        <rect
          x="9"
          y="10"
          width="6"
          height="12"
          rx="1"
          fill="#FEF3C7"
          stroke="#FDE68A"
          strokeWidth="0.5"
        />
      </svg>
    </>
  )
}
