import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { userId, isBanned } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'Se requiere ID de usuario' }, { status: 400 })
    }
    
    // Crear cliente Supabase con service role key (seguro en el servidor)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    
    // Banear/desbanear en auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { banned: !isBanned }
    )
    
    if (authError) {
      console.error('Error al actualizar estado de ban en auth.users:', authError)
      return NextResponse.json({ error: 'Error al actualizar estado de ban' }, { status: 500 })
    }
    
    // También actualizar en profiles si existe
    try {
      await supabaseAdmin
        .from('profiles')
        .update({ is_banned: !isBanned })
        .eq('id', userId)
    } catch (profileError) {
      console.error('Error al actualizar estado de ban en profiles:', profileError)
      // No fallamos si esto falla, ya que el usuario podría no tener perfil
    }
    
    return NextResponse.json({ 
      success: true, 
      isBanned: !isBanned 
    })
  } catch (error) {
    console.error('Error al procesar la solicitud:', error)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
} 