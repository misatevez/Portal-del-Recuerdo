"use client"

import { useState } from 'react'

export default function AuthTestPage() {
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTestAuth = async () => {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('/api/auth-test', { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) {
        setResult(`Error ${response.status}: ${data.error || 'Error desconocido'}`)
      } else {
        setResult(`Éxito. Email de la sesión: ${data.email}`)
      }
    } catch (error: any) {
      setResult(`Error de red o de fetch: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Prueba de Autenticación</h1>
      <p>Esta página prueba si el API route puede reconocer tu sesión de usuario.</p>
      <p>Por favor, asegúrate de haber iniciado sesión y luego haz clic en el botón.</p>
      <button onClick={handleTestAuth} disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}>
        {loading ? 'Probando...' : 'Iniciar Prueba de Autenticación'}
      </button>
      {result && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h2>Resultado:</h2>
          <pre><code>{result}</code></pre>
        </div>
      )}
    </div>
  )
}
