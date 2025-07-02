import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Intercambia el código de autorización por una sesión
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirige al usuario a la página de perfil después de un inicio de sesión exitoso
  return NextResponse.redirect(new URL('/perfil', request.url))
} 