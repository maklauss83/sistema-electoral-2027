'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { validarLogin } from '@/lib/validations'
import { Alert } from '@/components/ui/Alert'

export default function LoginPage() {
  const { login, persona, loading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errores, setErrores] = useState({})
  const [alerta, setAlerta] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!loading && persona) router.replace('/dashboard')
  }, [persona, loading, router])

  function handleChange(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: null }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { valido, errores: err } = validarLogin(form)
    if (!valido) { setErrores(err); return }

    setCargando(true)
    setAlerta(null)
    try {
      await login(form.email.trim(), form.password)
      router.replace('/dashboard')
    } catch (err) {
      setAlerta({
        tipo: 'error',
        mensaje: err.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos'
          : 'Error al iniciar sesión. Intenta de nuevo.',
      })
    } finally {
      setCargando(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-800/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🗳️
            </div>
            <h1 className="text-2xl font-bold">Sistema Electoral</h1>
            <p className="text-blue-200 text-sm mt-1">Elecciones 2027</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {alerta && (
              <div className="mb-4">
                <Alert tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                    errores.email
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                  }`}
                />
                {errores.email && <p className="text-xs text-red-600 mt-1">{errores.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                    errores.password
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                  }`}
                />
                {errores.password && <p className="text-xs text-red-600 mt-1">{errores.password}</p>}
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Entrando...
                  </span>
                ) : 'Iniciar sesión'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          Sistema Electoral 2027 — Acceso restringido
        </p>
      </div>
    </div>
  )
}
