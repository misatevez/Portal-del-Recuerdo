import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'Se requiere ID de usuario' }, { status: 400 })
    }
    
    // Crear cliente Supabase con service role key (seguro en el servidor)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    
    // Resultados de las operaciones
    const results = {
      tributes: false,
      comments: false,
      candles: false,
      usuarios: false,
      profile: false,
      auth: false
    }
    
    // 1. Eliminar homenajes
    try {
      const { error } = await supabaseAdmin
        .from('tributes')
        .delete()
        .eq('created_by', userId)
      
      if (!error) {
        results.tributes = true
      } else {
        console.error('Error al eliminar homenajes:', error)
      }
    } catch (error) {
      console.error('Excepción al eliminar homenajes:', error)
    }
    
    // 2. Eliminar comentarios
    try {
      const { error } = await supabaseAdmin
        .from('comments')
        .delete()
        .eq('user_id', userId)
      
      if (!error) {
        results.comments = true
      } else {
        console.error('Error al eliminar comentarios:', error)
      }
    } catch (error) {
      console.error('Excepción al eliminar comentarios:', error)
    }
    
    // 3. Eliminar velas
    try {
      const { error } = await supabaseAdmin
        .from('candles')
        .delete()
        .eq('user_id', userId)
      
      if (!error) {
        results.candles = true
      } else {
        console.error('Error al eliminar velas:', error)
      }
    } catch (error) {
      console.error('Excepción al eliminar velas:', error)
    }
    
    // 4. Eliminar registro de usuarios
    try {
      const { error } = await supabaseAdmin
        .from('usuarios')
        .delete()
        .eq('id', userId)
      
      if (!error) {
        results.usuarios = true
      } else if (error.code !== 'PGRST116') { // No es error si no hay registros
        console.error('Error al eliminar de tabla usuarios:', error)
      } else {
        results.usuarios = true // No había registros para eliminar
      }
    } catch (error) {
      console.error('Excepción al eliminar de tabla usuarios:', error)
    }
    
    // 5. Eliminar perfil
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId)
      
      if (!error) {
        results.profile = true
      } else {
        console.error('Error al eliminar perfil:', error)
      }
    } catch (error) {
      console.error('Excepción al eliminar perfil:', error)
    }
    
    // 6. Eliminar usuario de auth
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (!error) {
        results.auth = true
      } else {
        console.error('Error al eliminar usuario de auth:', error)
      }
    } catch (error) {
      console.error('Excepción al eliminar usuario de auth:', error)
    }
    
    // Determinar si la operación fue exitosa en general
    const allSuccess = Object.values(results).every(result => result === true)
    const someSuccess = Object.values(results).some(result => result === true)
    
    if (allSuccess) {
      return NextResponse.json({ 
        success: true, 
        message: 'Usuario eliminado completamente' 
      })
    } else if (someSuccess) {
      return NextResponse.json({ 
        success: true, 
        message: 'Usuario eliminado parcialmente', 
        details: results 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'No se pudo eliminar el usuario', 
        details: results 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error general al eliminar usuario:', error)
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
} 