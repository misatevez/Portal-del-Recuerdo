import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId, amount } = await request.json()

  if (!userId || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Datos de entrada inválidos.' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Primero, verificar si el usuario que hace la solicitud es un administrador
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Debes iniciar sesión.' }, { status: 401 })
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (adminError || !adminProfile) {
      console.error('Error al verificar el rol del admin:', JSON.stringify(adminError, null, 2))
      return NextResponse.json({ error: 'No se pudo verificar el rol del administrador.' }, { status: 500 })
    }

    if (adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Acción no permitida. Se requiere rol de administrador.' }, { status: 403 })
    }

    // Si es admin, proceder a llamar a la función RPC para asignar créditos
    const { error: rpcError } = await supabase.rpc('admin_assign_credits', {
      p_user_id: userId,
      p_amount: amount,
    })

    if (rpcError) {
      // Este es el log mejorado que nos dirá qué está pasando
      console.error('Error al llamar a RPC admin_assign_credits:', JSON.stringify(rpcError, null, 2))
      return NextResponse.json({ error: 'Error al asignar créditos en la base de datos.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Créditos asignados correctamente.' })

  } catch (error: any) {
    console.error('Error inesperado en el endpoint de asignar créditos:', JSON.stringify(error, null, 2))
    return NextResponse.json({ error: 'Ocurrió un error inesperado.' }, { status: 500 })
  }
}
