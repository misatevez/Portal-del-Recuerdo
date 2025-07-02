'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginWithEmail(formData: FormData) {
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Redirect back to the login page with an error message
    return redirect(`/login?message=Error: ${error.message}`)
  }

  // Redirect to the profile page on success
  return redirect('/perfil')
}
