"use client"

import { useState } from "react"
import { Share2, X } from "lucide-react"
import type { ShareButtonProps } from "../../types"

export function ShareButton({ tributeSlug, tributeName, className }: ShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)

  const shareUrl = `${window.location.origin}/homenaje/${tributeSlug}`

  const shareOptions = [
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Twitter",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Homenaje a ${tributeName}`)}`,
    },
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodeURIComponent(`Homenaje a ${tributeName}: ${shareUrl}`)}`,
    },
  ]

  return (
    <>
      <button onClick={() => setShowShareDialog(true)} className={className}>
        <Share2 className="w-5 h-5" />
      </button>

      {showShareDialog && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-andika text-primary">Compartir Homenaje</h3>
              <button onClick={() => setShowShareDialog(false)} className="text-text/60 hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center elegant-button px-4 py-2 rounded-md font-andika"
                >
                  Compartir en {option.name}
                </a>
              ))}
              <div>
                <label htmlFor="share-url" className="block text-sm font-medium text-text/80 mb-1 font-montserrat">
                  Enlace directo
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="share-url"
                    value={shareUrl}
                    readOnly
                    className="elegant-input w-full px-3 py-2 rounded-l-md font-montserrat"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl)
                      alert("Enlace copiado al portapapeles")
                    }}
                    className="elegant-button px-4 py-2 rounded-r-md font-andika"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

