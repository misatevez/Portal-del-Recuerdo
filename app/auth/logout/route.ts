import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Sign out the user.
  await supabase.auth.signOut()

  // Redirect to the home page after signing out.
  return NextResponse.redirect(new URL('/', req.url), {
    status: 302,
  })
}
