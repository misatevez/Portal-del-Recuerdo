import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('[Callback] OAuth callback route hit. [SERVER]');
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    console.log('[Callback] Authorization code found. [SERVER]');
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    try {
      console.log('[Callback] Exchanging code for session... [SERVER]');
      await supabase.auth.exchangeCodeForSession(code);
      console.log('[Callback] Code exchanged successfully. [SERVER]');
    } catch (error) {
      console.error('[Callback] Error exchanging code for session:', error);
      // Redirect to an error page or login page with an error message
      const errorUrl = new URL('/login', request.url);
      errorUrl.searchParams.set('error', 'auth_callback_failed');
      errorUrl.searchParams.set('error_description', 'Could not exchange code for session.');
      return NextResponse.redirect(errorUrl);
    }
  } else {
    console.warn('[Callback] No authorization code found in URL. [SERVER]');
  }

  console.log('[Callback] Redirecting to /perfil... [SERVER]');
  return NextResponse.redirect(new URL('/perfil', request.url));
} 