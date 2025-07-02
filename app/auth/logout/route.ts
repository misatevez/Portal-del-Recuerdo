import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  console.log('Logout endpoint hit. [SERVER]');
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    console.log('Attempting to sign out user... [SERVER]');
    await supabase.auth.signOut();
    console.log('User signed out successfully. Redirecting... [SERVER]');

    // Redirect to the home page after signing out.
    return NextResponse.redirect(new URL('/', req.url), {
      status: 302,
    });
  } catch (error) {
    console.error('Error during server-side logout:', error);
    // In case of an error, redirect to login with an error message
    return NextResponse.redirect(new URL('/login?error=logout_failed', req.url), {
      status: 500,
    });
  }
}
