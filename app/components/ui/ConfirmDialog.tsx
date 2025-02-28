"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}: ConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen && !isVisible) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md p-6 transform transition-transform duration-200 scale-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text/60 hover:text-text"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-andika text-primary mb-2">{title}</h3>
        <p className="text-text/80 font-montserrat mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-primary/30 text-text rounded-md hover:bg-primary/10"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
} 