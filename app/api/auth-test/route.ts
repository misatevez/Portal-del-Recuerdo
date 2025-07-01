import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No hay sesión activa.' }, { status: 401 })
    }

    return NextResponse.json({ email: session.user.email })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
