import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Marcar como dinámica
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Obtener la sesión de Supabase
    const cookieStore = cookies()
    
    // Crear cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        auth: {
          persistSession: false
        }
      }
    )
    
    // Establecer la cookie manualmente
    const supabaseToken = cookieStore.get('sb-access-token')?.value
    const supabaseRefreshToken = cookieStore.get('sb-refresh-token')?.value
    
    if (supabaseToken && supabaseRefreshToken) {
      await supabase.auth.setSession({
        access_token: supabaseToken,
        refresh_token: supabaseRefreshToken
      })
    }
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const userId = session.user.id

    // Aquí iría la integración con el sistema de pagos (Stripe, PayPal, etc.)
    // Por ahora, simplemente añadiremos un crédito al usuario

    // Crear cliente Supabase con service role key (seguro en el servidor)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    
    // Insertar un nuevo crédito para el usuario
    const { data, error } = await supabaseAdmin
      .from('user_credits')
      .insert({
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()
    
    if (error) {
      console.error('Error al crear crédito:', error)
      return NextResponse.json({ error: 'Error al procesar la compra' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      credit: data[0]
    })
  } catch (error) {
    console.error('Error al procesar la solicitud:', error)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
} 