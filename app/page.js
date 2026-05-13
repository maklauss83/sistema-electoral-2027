'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { persona, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (persona) router.replace('/dashboard')
    else router.replace('/login')
  }, [persona, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}
