import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../lib/supabaseAdmin' // Usamos la ruta relativa correcta

export async function GET(request: Request) {
  // Paso 1: Crear un cliente estándar para verificar la sesión del usuario que hace la petición.
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  // Paso 2: Si no hay sesión, el usuario no está autenticado. Denegar acceso.
  if (!session) {
    return NextResponse.json({ error: 'No autorizado. Se requiere iniciar sesión.' }, { status: 401 })
  }

  // Paso 3: Verificar si el usuario autenticado tiene el rol de 'admin'.
  const { data: adminProfile, error: adminError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  // Paso 4: Si hubo un error o el usuario no es admin, denegar acceso.
  if (adminError || adminProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Acción no permitida. Se requiere rol de administrador.' }, { status: 403 })
  }

  // Paso 5: Si el usuario es un administrador autorizado, usar el cliente privilegiado `supabaseAdmin` para obtener los datos.
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
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error al obtener la lista de usuarios con cliente admin:', error)
      throw error
    }

    // Aplanar la estructura para que sea más fácil de usar en el frontend.
    const formattedData = data.map(p => {
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
