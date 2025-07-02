"use client"

import { useSearchParams } from 'next/navigation'
import LoginForm from './login-form'
import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false)
  
  useEffect(() => {
    if (verified === 'true') {
      setShowVerifiedMessage(true)
      
      // Ocultar el mensaje después de 5 segundos
      const timer = setTimeout(() => {
        setShowVerifiedMessage(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [verified])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {showVerifiedMessage && (
        <div className="fixed top-4 right-4 p-4 bg-green-900/20 border border-green-500/50 rounded-md flex items-center text-green-200 shadow-lg max-w-md">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="font-montserrat">¡Tu correo ha sido verificado correctamente! Ya puedes iniciar sesión.</span>
        </div>
      )}
      
      <LoginForm />
    </div>
  )
}

