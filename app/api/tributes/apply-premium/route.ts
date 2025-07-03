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
    const { tributeId } = await request.json()
    
    if (!tributeId) {
      return NextResponse.json({ error: 'Se requiere ID del homenaje' }, { status: 400 })
    }

    // Crear cliente Supabase con service role key (seguro en el servidor)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    
    // 1. Verificar que el usuario es propietario del homenaje
    const { data: tribute, error: tributeError } = await supabaseAdmin
      .from('tributes')
      .select('*')
      .eq('id', tributeId)
      .eq('user_id', userId)
      .single()
    
    if (tributeError || !tribute) {
      return NextResponse.json({ 
        error: 'No se encontró el homenaje o no tienes permiso para modificarlo' 
      }, { status: 404 })
    }
    
    // 2. Verificar si el homenaje ya es premium
    if (tribute.es_premium) {
      return NextResponse.json({ 
        error: 'Este homenaje ya es premium' 
      }, { status: 400 })
    }
    
    // 3. Buscar un crédito disponible del usuario
    const { data: credits, error: creditsError } = await supabaseAdmin
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .is('used_at', null)
      .is('tribute_id', null)
      .order('created_at', { ascending: true })
      .limit(1)
    
    if (creditsError || !credits || credits.length === 0) {
      return NextResponse.json({ 
        error: 'No tienes créditos disponibles' 
      }, { status: 400 })
    }
    
    const creditToUse = credits[0]
    
    // Calcular la fecha de expiración (1 año desde ahora)
    const now = new Date()
    const premiumUntil = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString()
    
    // Si no existe la función RPC, hacemos las actualizaciones manualmente
    try {
      // Iniciar una transacción para actualizar tanto el crédito como el homenaje
      // Primero intentamos usar la función RPC si existe
      const { error: rpcError } = await supabaseAdmin.rpc('apply_premium_credit', {
        p_credit_id: creditToUse.id,
        p_tribute_id: tributeId,
        p_premium_until: premiumUntil
      })
      
      // Si hay un error con la RPC (probablemente porque no existe), hacemos las actualizaciones manualmente
      if (rpcError) {
        console.log('La función RPC no existe, realizando actualizaciones manualmente')
        
        // Actualizar el crédito como usado
        const { error: creditError } = await supabaseAdmin
          .from('user_credits')
          .update({
            used_at: new Date().toISOString(),
            tribute_id: tributeId
          })
          .eq('id', creditToUse.id)
        
        if (creditError) throw creditError
        
        // Actualizar el homenaje como premium
        const { error: tributeError } = await supabaseAdmin
          .from('tributes')
          .update({
            es_premium: true,
            premium_until: premiumUntil
          })
          .eq('id', tributeId)
        
        if (tributeError) throw tributeError
      }
      
      return NextResponse.json({ 
        success: true, 
        premiumUntil: premiumUntil
      })
    } catch (error) {
      console.error('Error al aplicar el crédito premium:', error)
      return NextResponse.json({ 
        error: 'Error al aplicar el crédito premium' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
} 