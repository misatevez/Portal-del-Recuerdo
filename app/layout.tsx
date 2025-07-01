import './globals.css'
import { Toaster } from 'react-hot-toast'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import AuthProvider from './auth/AuthProvider'
import Navbar from './components/Navbar' // Importación por defecto
import { Footer } from './components/Footer' // Importación nombrada



// Esta línea es importante para evitar que Next.js cachee esta ruta de forma estática,
// asegurando que la sesión siempre se verifique en cada petición.
export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: { 
  children: React.ReactNode 
}) {
  // Creamos un cliente de Supabase en el servidor.
    // Usamos <any> temporalmente porque el archivo de tipos de la DB no se encuentra.
  // La solución ideal es generar el archivo de tipos con la CLI de Supabase.
  const supabase = createServerComponentClient<any>({ cookies })
  
  // Obtenemos la sesión del usuario directamente desde el servidor.
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="es">
      <body>
        <Toaster />
        {/* 
          Envolvemos toda la aplicación en el AuthProvider y le pasamos 
          la sesión que obtuvimos en el servidor. Esto es crucial.
        */}
        <AuthProvider session={session}>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
