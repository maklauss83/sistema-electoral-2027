'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'

export function AuthGuard({ children, rolesPermitidos }) {
  const { persona, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!persona) {
      router.replace('/login')
      return
    }
    if (rolesPermitidos && !rolesPermitidos.includes(persona.rol)) {
      router.replace('/dashboard')
    }
  }, [persona, loading, router, rolesPermitidos])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!persona) return null

  if (rolesPermitidos && !rolesPermitidos.includes(persona.rol)) return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
