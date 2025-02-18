export function CandleAnimation() {
  return (
    <div className="w-8 h-12 mx-auto mb-2 relative">
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-yellow-300 rounded-full animate-flame-flicker"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full animate-flame-sway"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-10 bg-yellow-100 opacity-50 rounded-full animate-flame-glow"></div>
    </div>
  )
}

