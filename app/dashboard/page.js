'use client'
import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { PersonaService } from '@/services/persona.service'
import { SeccionService } from '@/services/seccion.service'
import { JerarquiaService } from '@/services/jerarquia.service'
import { Badge, BadgeActivo } from '@/components/ui/Badge'
import { ROLES_LABELS, esAdmin } from '@/lib/validations'

function StatCard({ titulo, valor, icono, color = 'blue', subtitulo }) {
  const colores = {
    blue: 'from-blue-500 to-blue-700',
    purple: 'from-purple-500 to-purple-700',
    teal: 'from-teal-500 to-teal-700',
    amber: 'from-amber-500 to-amber-600',
    gray: 'from-gray-500 to-gray-700',
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`bg-gradient-to-br ${colores[color]} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <span className="text-3xl">{icono}</span>
          <span className="text-3xl font-bold">{valor}</span>
        </div>
      </div>
      <div className="p-4">
        <p className="font-semibold text-gray-800 text-sm">{titulo}</p>
        {subtitulo && <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { persona } = useAuth()
  const [stats, setStats] = useState(null)
  const [secciones, setSecciones] = useState([])
  const [subordinados, setSubordinados] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!persona) return
    cargarDatos()
  }, [persona])

  async function cargarDatos() {
    setCargando(true)
    try {
      if (esAdmin(persona.rol)) {
        const [s, sec] = await Promise.all([
          PersonaService.obtenerEstadisticas(),
          SeccionService.obtenerTodas(),
        ])
        setStats(s)
        setSecciones(sec)
      } else if (persona.rol === 'coordinador_seccion') {
        const [misSecc, sub] = await Promise.all([
          SeccionService.obtenerMisSecciones(persona.id),
          PersonaService.obtenerMisSubordinados(persona.id),
        ])
        setSecciones(misSecc)
        setSubordinados(sub)
      } else if (persona.rol === 'movilizador') {
        const sub = await PersonaService.obtenerMisSubordinados(persona.id)
        setSubordinados(sub)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }

  const bienvenida = () => {
    const hora = new Date().getHours()
    if (hora < 12) return 'Buenos días'
    if (hora < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <AuthGuard>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {bienvenida()}, {persona?.nombre} 👋
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge rol={persona?.rol} />
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-sm text-gray-500">Sistema Electoral 2027</span>
          </div>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stats para admins */}
            {esAdmin(persona?.rol) && stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard titulo="Total personas" valor={stats.total} icono="👥" color="blue" />
                <StatCard titulo="Coordinadores Sección" valor={stats.por_rol?.coordinador_seccion || 0} icono="🗂️" color="teal" />
                <StatCard titulo="Movilizadores" valor={stats.por_rol?.movilizador || 0} icono="🚀" color="amber" />
                <StatCard titulo="Ciudadanos" valor={stats.por_rol?.ciudadano || 0} icono="🏘️" color="gray" />
              </div>
            )}

            {/* Stats para coordinador de sección */}
            {persona?.rol === 'coordinador_seccion' && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <StatCard titulo="Mis secciones" valor={secciones.length} icono="🗂️" color="teal" />
                <StatCard titulo="Mis movilizadores" valor={subordinados.length} icono="🚀" color="amber" />
              </div>
            )}

            {/* Stats para movilizador */}
            {persona?.rol === 'movilizador' && (
              <div className="grid grid-cols-1 gap-4 mb-8 max-w-xs">
                <StatCard titulo="Ciudadanos registrados" valor={subordinados.length} icono="🏘️" color="blue" subtitulo="Personas que has registrado" />
              </div>
            )}

            {/* Secciones para admins */}
            {esAdmin(persona?.rol) && secciones.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Secciones electorales</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {secciones.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 font-bold text-sm">
                          {s.numero_seccion}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Sección {s.numero_seccion}</p>
                          <p className="text-xs text-gray-400">{s.coordinadores?.filter(c=>c.activo).length || 0} coordinadores</p>
                        </div>
                      </div>
                      <BadgeActivo activo={s.activa} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subordinados */}
            {subordinados.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Mi equipo</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {subordinados.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                          {p.nombre?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{p.nombre} {p.apellido}</p>
                          <p className="text-xs text-gray-400">{p.telefono || 'Sin teléfono'}</p>
                        </div>
                      </div>
                      <Badge rol={p.rol} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  )
}
