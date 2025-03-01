import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
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
    if (tribute.is_premium) {
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
    
    // Iniciar una transacción para actualizar tanto el crédito como el homenaje
    const { error: transactionError } = await supabaseAdmin.rpc('apply_premium_credit', {
      p_credit_id: creditToUse.id,
      p_tribute_id: tributeId,
      p_premium_until: premiumUntil
    })
    
    if (transactionError) {
      console.error('Error en la transacción:', transactionError)
      return NextResponse.json({ 
        error: 'Error al aplicar el crédito premium' 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      premiumUntil: premiumUntil
    })
  } catch (error) {
    console.error('Error al procesar la solicitud:', error)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
} 