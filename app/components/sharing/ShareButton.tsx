"use client"

import { useState } from "react"
import { Share2, X } from "lucide-react"
import type { ShareButtonProps } from "../../types"

export function ShareButton({ tributeSlug, tributeName, className }: ShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  // Move URL generation to a useEffect to ensure it only runs client-side
  const handleShare = () => {
    setShareUrl(`${window.location.origin}/homenaje/${tributeSlug}`)
    setShowShareDialog(true)
  }

  const shareOptions = [
    {
      name: "Facebook",
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Twitter",
      getUrl: () =>
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Homenaje a ${tributeName}`)}`,
    },
    {
      name: "WhatsApp",
      getUrl: () => `https://wa.me/?text=${encodeURIComponent(`Homenaje a ${tributeName}: ${shareUrl}`)}`,
    },
  ]

  return (
    <div className={`share-button ${className}`}>
      <button onClick={() => setShowShareDialog(true)}>
        <Share2 className="w-5 h-5" />
      </button>
      {showShareDialog && (
        <div className="share-dialog">
          <button onClick={handleShare}>Compartir</button>
          <button onClick={() => setShowShareDialog(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

