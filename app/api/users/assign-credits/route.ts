import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin' // Ruta relativa corregida

export async function POST(request: Request) {
  const { userId, amount } = await request.json();
  console.log(`[API/ASSIGN-CREDITS] Solicitud recibida para asignar ${amount} créditos al usuario ${userId}.`);

    if (!userId || typeof amount !== 'number' || amount <= 0) {
    console.error('[API/ASSIGN-CREDITS] Error: Datos de entrada inválidos.', { userId, amount });
    return NextResponse.json({ error: 'Datos de entrada inválidos.' }, { status: 400 })
  }

  // 1. Verificación de permisos con el cliente normal
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
    console.error('[API/ASSIGN-CREDITS] Error: Intento de asignación de créditos sin sesión de usuario.');
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

    if (adminError || adminProfile?.role !== 'admin') {
    console.error(`[API/ASSIGN-CREDITS] Error: Usuario ${session?.user?.id} sin permisos de administrador intentó asignar créditos.`);
    return NextResponse.json({ error: 'Acción no permitida. Se requiere rol de administrador.' }, { status: 403 })
  }

  // 2. Operación con privilegios usando el cliente de administración
  try {
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

        if (userError || !userData) {
      console.error(`[API/ASSIGN-CREDITS] Error: No se encontró el perfil del usuario ${userId} para asignarle créditos.`, userError);
      return NextResponse.json({ error: 'No se encontró al usuario para asignarle créditos.' }, { status: 404 })
    }

    const newCredits = (userData.credits || 0) + amount

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId)

        if (updateError) {
      console.error(`[API/ASSIGN-CREDITS] Error al actualizar los créditos para el usuario ${userId}:`, updateError);
      console.error('Error al actualizar créditos con cliente admin:', updateError)
      return NextResponse.json({ error: 'Error al actualizar los créditos en la base de datos.' }, { status: 500 })
    }

        console.log(`[API/ASSIGN-CREDITS] Éxito: Se asignaron ${amount} créditos al usuario ${userId}. Nuevo total: ${newCredits}.`);
    return NextResponse.json({ message: 'Créditos asignados correctamente.' });

  } catch (error: any) {
    console.error('Error inesperado en el endpoint de asignar créditos:', error)
    return NextResponse.json({ error: 'Ocurrió un error inesperado.' }, { status: 500 })
  }
}
