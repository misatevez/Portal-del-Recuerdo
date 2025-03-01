import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Marcar como dinámica
export const dynamic = 'force-dynamic'

export async function GET() {
  // Crear cliente Supabase con service role key (seguro en el servidor)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
  
  try {
    // Obtener usuarios de auth.users usando la API de autenticación
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) throw authError
    
    // Obtener perfiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (profilesError) throw profilesError
    
    // Combinar datos
    const emailMap = new Map()
    authUsers?.users?.forEach(user => {
      emailMap.set(user.id, user.email)
    })
    
    const usersWithEmail = profiles?.map(profile => ({
      ...profile,
      email: emailMap.get(profile.id) || 'No disponible'
    }))
    
    return NextResponse.json({ users: usersWithEmail })
  } catch (error) {
    console.error('Error en API de usuarios:', error)
    return NextResponse.json({ error: 'Error al cargar usuarios' }, { status: 500 })
  }
} 