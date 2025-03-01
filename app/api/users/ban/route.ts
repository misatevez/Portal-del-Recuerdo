import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Marcar como dinámica
export const dynamic = 'force-dynamic'

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
    
    // Obtener usuario actual para acceder a sus metadatos
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError) {
      console.error('Error al obtener usuario:', userError)
      return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 })
    }
    
    // Actualizar metadatos del usuario
    const currentMetadata = userData.user.user_metadata || {}
    
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: { 
          ...currentMetadata,
          banned: !isBanned 
        }
      }
    )
    
    if (authError) {
      console.error('Error al actualizar metadatos:', authError)
      return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
    }
    
    // También actualizar el campo is_banned en la tabla profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ is_banned: !isBanned })
      .eq('id', userId)
    
    if (profileError) {
      console.error('Error al actualizar perfil:', profileError)
      return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: isBanned ? 'Usuario desbaneado' : 'Usuario baneado'
    })
  } catch (error) {
    console.error('Error al procesar la solicitud:', error)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
} 