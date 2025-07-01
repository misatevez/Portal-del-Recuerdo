import { createClient } from '@supabase/supabase-js'

// Estas variables de entorno DEBEN estar definidas en tu archivo .env.local
// y NUNCA deben exponerse al lado del cliente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  // En un entorno de producción, es mejor loguear este error que lanzarlo,
  // para no detener el servidor por una variable de entorno faltante.
  console.error('CRITICAL: Missing Supabase URL or Service Role Key for admin client.')
  throw new Error('Missing Supabase URL or Service Role Key for admin client.')
}

// Este es el cliente de administración. Usa la Service Role Key para saltarse
// todas las políticas de RLS. DEBE usarse únicamente en el lado del servidor
// (API routes, server components con cuidado) y NUNCA en el lado del cliente.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
