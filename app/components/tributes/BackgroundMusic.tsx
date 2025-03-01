"use client"

import { useState, useEffect, useRef } from "react"
import { Music, Pause, Play, Upload } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { toast } from "react-hot-toast"
import type { BackgroundMusicProps } from "../../types"

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB en bytes

export function BackgroundMusic({ tributeId, canEdit }: BackgroundMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    loadAudioFile()
  }, [tributeId])

  const loadAudioFile = async () => {
    try {
      // Primero, obtener la información de la música del tributo
      const { data: musicData, error: musicError } = await supabase
        .from('background_music')
        .select('url')
        .eq('tribute_id', tributeId)
        .single()

      if (musicError && musicError.code !== 'PGRST116') { // PGRST116 es el código para "no se encontraron resultados"
        throw musicError
      }

      if (musicData?.url) {
        setAudioUrl(musicData.url)
      }
    } catch (error) {
      console.error("Error loading audio file:", error)
      toast.error("Error al cargar la música de fondo")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error)
        toast.error("Error al reproducir la música")
      })
    }
    setIsPlaying(!isPlaying)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error("El archivo no debe superar los 10MB")
      return
    }

    try {
      setIsLoading(true)

      // Subir el archivo a Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${tributeId}_${Date.now()}.${fileExt}`
      const filePath = `background_music/${tributeId}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("storage")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Sobrescribir si existe
        })

      if (uploadError) throw uploadError

      // Obtener la URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from("storage")
        .getPublicUrl(filePath)

      // Actualizar o insertar en la tabla background_music
      const { error: dbError } = await supabase
        .from('background_music')
        .upsert({
          tribute_id: tributeId,
          url: publicUrl,
          file_path: filePath
        })

      if (dbError) throw dbError

      setAudioUrl(publicUrl)
      toast.success("Música de fondo actualizada")

      // Detener la reproducción actual si está reproduciéndose
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      }

    } catch (error) {
      console.error("Error uploading audio file:", error)
      toast.error("Error al subir el archivo de música")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-surface p-4 rounded-full shadow-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-surface/80 backdrop-blur-sm p-3 rounded-full shadow-lg z-40">
      <audio 
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false)
          toast.error("Error al reproducir la música")
        }}
      />
      <div className="flex items-center space-x-3">
        {audioUrl && (
          <button 
            onClick={togglePlay} 
            className="p-2 bg-primary text-background rounded-full hover:bg-primary/90 transition-colors"
            title={isPlaying ? "Pausar música" : "Reproducir música"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        )}
        {canEdit && (
          <label 
            htmlFor="music-upload" 
            className="p-2 bg-primary text-background rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
            title="Subir música de fondo"
          >
            {audioUrl ? <Music className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            <input
              id="music-upload"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  )
}

