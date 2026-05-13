'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [persona, setPersona] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) cargarPersona(session.user.id)
      else setLoading(false)
    })

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) await cargarPersona(session.user.id)
        else {
          setPersona(null)
          setLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function cargarPersona(uid) {
    try {
      const { data, error } = await supabase
        .from('persona')
        .select('*')
        .eq('supabase_uid', uid)
        .single()
      if (error) throw error
      setPersona(data)
    } catch (e) {
      console.error('Error cargando persona:', e)
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setPersona(null)
  }

  return (
    <AuthContext.Provider value={{ user, persona, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
