'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ROLES_LABELS } from '@/lib/validations'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['candidato','coordinador_electoral','coordinador_seccion','movilizador'] },
  { href: '/secciones', label: 'Secciones', icon: '🗂️', roles: ['candidato','coordinador_electoral','coordinador_seccion'] },
  { href: '/personas', label: 'Personas', icon: '👥', roles: ['candidato','coordinador_electoral','coordinador_seccion','movilizador'] },
  { href: '/jerarquia', label: 'Jerarquía', icon: '🔗', roles: ['candidato','coordinador_electoral'] },
]

export function Sidebar() {
  const { persona, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const itemsVisibles = NAV_ITEMS.filter(item =>
    item.roles.includes(persona?.rol)
  )

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">🗳️</div>
          <div>
            <p className="font-bold text-sm leading-tight">Sistema Electoral</p>
            <p className="text-xs text-slate-400">2027</p>
          </div>
        </div>
      </div>

      {/* Info usuario */}
      {persona && (
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
              {persona.nombre?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{persona.nombre} {persona.apellido}</p>
              <p className="text-xs text-slate-400 truncate">{ROLES_LABELS[persona.rol]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 p-3">
        {itemsVisibles.map(item => {
          const activo = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ${
                activo
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all"
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
