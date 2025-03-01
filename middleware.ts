import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  // Verificar si el usuario está autenticado
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        persistSession: false
      }
    }
  )
  
  // Obtener token de la cookie
  const token = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value
  
  if (token && refreshToken) {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: refreshToken
    })
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Verificar si el usuario está baneado en metadatos
      const isBannedInMetadata = user.user_metadata?.banned === true
      
      // Verificar si el usuario está baneado en la tabla profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('id', user.id)
        .single()
      
      if (isBannedInMetadata || profile?.is_banned) {
        // Redirigir a página de baneo
        return NextResponse.redirect(new URL('/banned', request.url))
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/perfil/:path*',
    '/homenaje/:path*/editar',
    '/crear-homenaje',
    '/dashboard/:path*',
  ],
} 