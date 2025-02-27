import Link from "next/link"
import { Heart, Mail } from "lucide-react"

export default function ConfirmacionPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-andika text-primary">¡Casi listo!</h2>
        
        <div className="elegant-card p-8 rounded-lg backdrop-blur-md mt-6">
          <div className="flex justify-center mb-6">
            <Mail className="h-16 w-16 text-primary/80" />
          </div>
          
          <h3 className="text-xl font-andika text-text mb-4">Verifica tu correo electrónico</h3>
          
          <p className="text-text/80 font-montserrat mb-6">
            Hemos enviado un correo de verificación a tu dirección de email. 
            Por favor, haz clic en el enlace del correo para activar tu cuenta.
          </p>
          
          <div className="bg-primary/10 p-4 rounded-md mb-6">
            <p className="text-sm text-text/80 font-montserrat">
              Si no encuentras el correo en tu bandeja de entrada, revisa la carpeta de spam o correo no deseado.
            </p>
          </div>
          
          <Link 
            href="/login" 
            className="elegant-button w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium font-andika inline-block text-center"
          >
            Volver al inicio de sesión
          </Link>
        </div>
        
        <p className="mt-8 text-sm text-text/60 font-montserrat">
          ¿No recibiste el correo?{" "}
          <Link href="/registro/reenviar" className="font-medium text-primary hover:text-primary/80">
            Reenviar correo de verificación
          </Link>
        </p>
      </div>
    </div>
  )
} 