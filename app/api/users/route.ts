import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../lib/supabaseAdmin' // Usamos la ruta relativa correcta

export async function GET(request: Request) {
  // Paso 1: Extraer el token del header de autorización.
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No autorizado. Token no proporcionado o mal formateado.' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  // Paso 2: Crear un cliente de Supabase y verificar el token.
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  // Si hay un error al obtener el usuario o el usuario es nulo, el token es inválido.
  if (userError || !user) {
    return NextResponse.json({ error: 'No autorizado. Token inválido o expirado.' }, { status: 401 });
  }

  // Paso 3: Verificar si el usuario autenticado tiene el rol de 'admin'.
  const { data: adminProfile, error: adminError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Paso 4: Si hubo un error o el usuario no es admin, denegar acceso.
  if (adminError || adminProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Acción no permitida. Se requiere rol de administrador.' }, { status: 403 })
  }

  // Paso 5: Si el usuario es un administrador autorizado, obtener los datos y devolverlos en crudo.
  try {
    // 5.1: Obtener la lista de usuarios de `auth.users`.
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError || !usersData) {
      console.error('Error al obtener la lista de usuarios:', usersError);
      return NextResponse.json({ error: 'Error al obtener la lista de usuarios.' }, { status: 500 });
    }

    // 5.2: Obtener la lista de perfiles de `public.profiles`.
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, nombre, credits, privacidad, role');
    if (profilesError) {
      console.error('Error al obtener los perfiles:', profilesError);
      return NextResponse.json({ error: 'Error al obtener los perfiles.' }, { status: 500 });
    }

    // 5.3: Devolver ambas listas al cliente para que las procese.
    return NextResponse.json({
      users: usersData.users,
      profiles: profiles || [],
    });

  } catch (error: any) {
    console.error('Error detallado en el endpoint de listar usuarios:', error);
    return NextResponse.json({ error: 'Ocurrió un error inesperado al listar usuarios.' }, { status: 500 });
  }
}
