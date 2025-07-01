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

  // Paso 5: Si el usuario es un administrador autorizado, obtener los datos de forma segura.
  try {
    // 5.1: Obtener todos los usuarios de `auth.users`.
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) {
      console.error('Error al obtener la lista de usuarios de auth:', usersError);
      throw usersError;
    }

    // 5.2: Obtener todos los perfiles de `public.profiles`.
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, nombre, credits, is_banned, privacidad, role');
    if (profilesError) {
      console.error('Error al obtener los perfiles:', profilesError);
      throw profilesError;
    }

    // 5.3: Crear un mapa de perfiles para una búsqueda eficiente.
    const profilesMap = new Map(profiles.map(p => [p.id, p]));

    // 5.4: Combinar los datos de usuarios y perfiles.
    const combinedData = users.map(user => {
      const profile = profilesMap.get(user.id);
      return {
        id: user.id,
        email: user.email || null,
        full_name: profile?.nombre || null,
        credits: profile?.credits ?? 0,
        is_banned: profile?.is_banned ?? false,
        privacidad: profile?.privacidad || 'private',
        role: profile?.role || 'user',
        created_at: user.created_at, // Incluir para ordenar
      };
    });

    // 5.5: Ordenar los datos combinados por fecha de creación.
    const sortedData = combinedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(sortedData);

  } catch (error: any) {
    console.error('Error final en el endpoint de listar usuarios:', error.message);
    return NextResponse.json({ error: 'Ocurrió un error inesperado al listar usuarios.' }, { status: 500 });
  }
}
