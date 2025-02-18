"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Music, Pause, Play } from "lucide-react"
import type { BackgroundMusicProps } from "../../types"

export function BackgroundMusic({ tributeId, canEdit }: BackgroundMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioSrc, setAudioSrc] = useState("")
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // TODO: Fetch audio source from the server based on tributeId
    setAudioSrc("/path/to/default/music.mp3")
  }, [])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Implement file upload and update audio source
      console.log("File selected:", file)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-surface p-2 rounded-full shadow-lg">
      <audio ref={audioRef} src={audioSrc} loop />
      <div className="flex items-center space-x-2">
        <button onClick={togglePlay} className="p-2 bg-primary text-background rounded-full">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        {canEdit && (
          <label htmlFor="music-upload" className="p-2 bg-primary text-background rounded-full cursor-pointer">
            <Music className="w-5 h-5" />
            <input id="music-upload" type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  )
}

