import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId, amount } = await request.json()

  if (!userId || !amount) {
    return NextResponse.json({ error: 'Se requiere el ID del usuario y la cantidad de créditos.' }, { status: 400 })
  }

  const parsedAmount = parseInt(amount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: 'La cantidad de créditos debe ser un número positivo.' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    // 1. Get the current user from the session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Debes iniciar sesión.' }, { status: 401 });
    }

    // 2. Check if the current user is an admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: 'No se pudo verificar el rol del administrador.' }, { status: 500 });
    }

    if (adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Acción no permitida. Se requiere rol de administrador.' }, { status: 403 });
    }

    
    const { error } = await supabase.rpc('admin_assign_credits', {
      user_id_in: userId,
      amount_in: parsedAmount
    })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ message: 'Créditos asignados correctamente.' })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al asignar créditos.' }, { status: 500 })
  }
}
