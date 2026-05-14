'use client'
import { useState, useEffect, useCallback } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/Badge'

export default function ActividadPage() {
  const [actividad, setActividad] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const { data, error } = await supabase
        .from('registro_actividad')
        .select(`
          *,
          persona:id_persona (id, nombre, apellido, rol)
        `)
        .order('fecha_hora', { ascending: false })
        .limit(200)
      if (error) throw error
      setActividad(data)
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // Formato de fecha legible
  function formatFecha(fecha) {
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  // Ícono por acción
  function iconAccion(accion) {
    if (accion.includes('INSERT')) return '➕'
    if (accion.includes('UPDATE')) return '✏️'
    if (accion.includes('DELETE')) return '🗑️'
    if (accion.includes('login')) return '🔐'
    return '📋'
  }

  // Color por acción
  function colorAccion(accion) {
    if (accion.includes('INSERT')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (accion.includes('UPDATE')) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (accion.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-200'
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const actividadFiltrada = actividad.filter(a => {
    const nombre = `${a.persona?.nombre || ''} ${a.persona?.apellido || ''}`.toLowerCase()
    const accion = a.accion?.toLowerCase() || ''
    return nombre.includes(filtro.toLowerCase()) || accion.includes(filtro.toLowerCase())
  })

  return (
    <AuthGuard rolesPermitidos={['candidato', 'coordinador_electoral']}>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📋 Actividad</h1>
            <p className="text-sm text-gray-400 mt-0.5">Registro de acciones en el sistema</p>
          </div>
          <button
            onClick={cargar}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Filtro */}
        <div className="mb-5">
          <input
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            placeholder="Buscar por persona o acción..."
            className="w-full max-w-sm px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : actividadFiltrada.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <span className="text-4xl mb-3">📋</span>
              <p className="text-sm">Sin actividad registrada</p>
            </div>
          ) : (
            <>
              {/* Vista desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Fecha y hora</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Usuario</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Acción</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {actividadFiltrada.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {formatFecha(a.fecha_hora)}
                        </td>
                        <td className="px-5 py-3">
                          {a.persona ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                                {a.persona.nombre?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{a.persona.nombre} {a.persona.apellido}</p>
                                <Badge rol={a.persona.rol} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Sistema</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${colorAccion(a.accion)}`}>
                            {iconAccion(a.accion)} {a.accion}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-400">
                          {a.ip_origen || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista móvil */}
              <div className="md:hidden divide-y divide-gray-50">
                {actividadFiltrada.map(a => (
                  <div key={a.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${colorAccion(a.accion)}`}>
                        {iconAccion(a.accion)} {a.accion}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatFecha(a.fecha_hora)}</span>
                    </div>
                    {a.persona && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                          {a.persona.nombre?.[0]?.toUpperCase()}
                        </div>
                        <p className="text-sm text-gray-700">{a.persona.nombre} {a.persona.apellido}</p>
                        <Badge rol={a.persona.rol} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Mostrando los últimos 200 registros
        </p>
      </div>
    </AuthGuard>
  )
}
