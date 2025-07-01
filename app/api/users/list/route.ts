import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin' // Ruta relativa corregida

export async function GET(request: Request) {
  // 1. Verificación de permisos con el cliente normal
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (adminError || adminProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Acción no permitida. Se requiere rol de administrador.' }, { status: 403 })
  }

  // 2. Operación con privilegios usando el cliente de administración
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        credits,
        is_banned,
        privacidad,
        role,
        users ( email )
      `)
    
    if (error) {
      console.error('Error al obtener la lista de usuarios con cliente admin:', error)
      throw error
    }

    // Aplanamos la estructura para que sea más fácil de usar en el frontend
    const formattedData = data.map(p => {
      // La relación 'users' puede ser un objeto o un array según la consulta.
      // Nos aseguramos de manejar ambos casos.
      const email = Array.isArray(p.users) ? p.users[0]?.email : p.users?.email;
      return {
        ...p,
        email: email || null,
        users: undefined, // eliminamos el objeto anidado
      }
    })

    return NextResponse.json(formattedData)

  } catch (error: any) {
    console.error('Error inesperado en el endpoint de listar usuarios:', error)
    return NextResponse.json({ error: 'Ocurrió un error inesperado al listar usuarios.' }, { status: 500 })
  }
}
