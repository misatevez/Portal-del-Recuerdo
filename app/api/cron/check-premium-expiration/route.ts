import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Marcar esta ruta como dinámica para evitar la pre-renderización estática
export const dynamic = 'force-dynamic'

// Esta ruta debe estar protegida con algún tipo de autenticación para cron jobs
export async function GET(request: Request) {
  try {
    // Verificar clave secreta para el cron job
    const url = new URL(request.url)
    const apiKey = url.searchParams.get('api_key')
    
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    // Crear cliente Supabase con service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    
    // Obtener la fecha actual
    const now = new Date().toISOString()
    
    // Actualizar todos los homenajes cuyo período premium ha expirado
    const { data, error } = await supabaseAdmin
      .from('tributes')
      .update({ is_premium: false })
      .lt('premium_until', now)
      .eq('is_premium', true)
      .select('id, nombre')
    
    if (error) {
      console.error('Error al actualizar homenajes expirados:', error)
      return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      updated: data.length,
      tributes: data
    })
  } catch (error) {
    console.error('Error al procesar la solicitud:', error)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
} 