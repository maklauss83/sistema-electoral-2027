'use client'
import { useState, useEffect, useCallback } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { PersonaService } from '@/services/persona.service'
import { Badge, BadgeActivo } from '@/components/ui/Badge'
import { Modal, ModalConfirmar } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { PersonaForm } from '@/components/forms/PersonaForm'
import { JerarquiaService } from '@/services/jerarquia.service'
import { SeccionService } from '@/services/seccion.service'
import { esAdmin } from '@/lib/validations'

const TODOS = ['candidato','coordinador_electoral','coordinador_seccion','movilizador']

export default function PersonasPage() {
  const { persona } = useAuth()
  const [personas, setPersonas] = useState([])
  const [filtro, setFiltro] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [cargando, setCargando] = useState(true)
  const [alerta, setAlerta] = useState(null)

  // Modales
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // Secciones para jerarquía
  const [secciones, setSecciones] = useState([])
  const [idSeccionRelacion, setIdSeccionRelacion] = useState('')

  const cargar = useCallback(async () => {
    if (!persona) return
    setCargando(true)
    try {
      let data
      if (esAdmin(persona.rol)) {
        data = await PersonaService.obtenerTodas()
        const secc = await SeccionService.obtenerTodas()
        setSecciones(secc)
      } else {
        data = await PersonaService.obtenerMisSubordinados(persona.id)
      }
      setPersonas(data)
    } catch (e) {
      mostrarAlerta('error', 'Error al cargar personas: ' + e.message)
    } finally {
      setCargando(false)
    }
  }, [persona])

  useEffect(() => { cargar() }, [cargar])

  function mostrarAlerta(tipo, mensaje) {
    setAlerta({ tipo, mensaje, id: Date.now() })
  }

  async function handleCrear(form) {
    setGuardando(true)
    try {
      const nueva = await PersonaService.crear(form)
      // Crear jerarquía automáticamente
      if (persona.rol !== 'candidato') {
        await JerarquiaService.crear({
          id_superior: persona.id,
          id_subordinado: nueva.id,
          id_seccion: idSeccionRelacion || null,
          tipo_relacion: persona.rol === 'movilizador' ? 'registra' : 'coordina',
        })
      }
      mostrarAlerta('success', `${form.nombre} ${form.apellido} creado correctamente`)
      setModalCrear(false)
      await cargar()
    } catch (e) {
      mostrarAlerta('error', 'Error al crear: ' + (e.message || 'Intenta de nuevo'))
    } finally {
      setGuardando(false)
    }
  }

  async function handleEditar(form) {
    setGuardando(true)
    try {
      await PersonaService.actualizar(modalEditar.id, form)
      mostrarAlerta('success', 'Persona actualizada correctamente')
      setModalEditar(null)
      await cargar()
    } catch (e) {
      mostrarAlerta('error', 'Error al actualizar: ' + e.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar() {
    setGuardando(true)
    try {
      await PersonaService.desactivar(modalEliminar.id)
      mostrarAlerta('success', 'Persona desactivada correctamente')
      setModalEliminar(null)
      await cargar()
    } catch (e) {
      mostrarAlerta('error', 'Error al desactivar: ' + e.message)
    } finally {
      setGuardando(false)
    }
  }

  const personasFiltradas = personas.filter(p => {
    const nombre = `${p.nombre} ${p.apellido}`.toLowerCase()
    const matchNombre = nombre.includes(filtro.toLowerCase())
    const matchRol = !filtroRol || p.rol === filtroRol
    return matchNombre && matchRol
  })

  return (
    <AuthGuard rolesPermitidos={TODOS}>
      {/* Alertas */}
      {alerta && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <Alert tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">👥 Personas</h1>
            <p className="text-sm text-gray-400 mt-0.5">{personasFiltradas.length} registros</p>
          </div>
          <button
            onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            + Nueva persona
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-5">
          <input
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            placeholder="Buscar por nombre..."
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={filtroRol}
            onChange={e => setFiltroRol(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="">Todos los roles</option>
            <option value="coordinador_electoral">Coord. Electoral</option>
            <option value="coordinador_seccion">Coord. Sección</option>
            <option value="movilizador">Movilizador</option>
            <option value="ciudadano">Ciudadano</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : personasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <span className="text-4xl mb-3">👤</span>
              <p className="text-sm">No se encontraron personas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Persona</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Rol</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Contacto</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Estado</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {personasFiltradas.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                            {p.nombre?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{p.nombre} {p.apellido}</p>
                            <p className="text-xs text-gray-400">ID: {p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3"><Badge rol={p.rol} /></td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-700">{p.correo || '—'}</p>
                        <p className="text-xs text-gray-400">{p.telefono || '—'}</p>
                      </td>
                      <td className="px-5 py-3"><BadgeActivo activo={p.activo} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setModalEditar(p)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Editar
                          </button>
                          {esAdmin(persona?.rol) && (
                            <button
                              onClick={() => setModalEliminar(p)}
                              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Desactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear */}
      <Modal abierto={modalCrear} onClose={() => setModalCrear(false)} titulo="Nueva persona">
        {esAdmin(persona?.rol) && secciones.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Asignar a sección (opcional)</label>
            <select
              value={idSeccionRelacion}
              onChange={e => setIdSeccionRelacion(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
            >
              <option value="">Sin sección específica</option>
              {secciones.map(s => (
                <option key={s.id} value={s.id}>Sección {s.numero_seccion}</option>
              ))}
            </select>
          </div>
        )}
        <PersonaForm
          rolCreador={persona?.rol}
          onGuardar={handleCrear}
          onCancelar={() => setModalCrear(false)}
          cargando={guardando}
        />
      </Modal>

      {/* Modal Editar */}
      <Modal abierto={!!modalEditar} onClose={() => setModalEditar(null)} titulo="Editar persona">
        {modalEditar && (
          <PersonaForm
            inicial={modalEditar}
            rolCreador={persona?.rol}
            onGuardar={handleEditar}
            onCancelar={() => setModalEditar(null)}
            cargando={guardando}
          />
        )}
      </Modal>

      {/* Modal Confirmar desactivar */}
      <ModalConfirmar
        abierto={!!modalEliminar}
        onClose={() => setModalEliminar(null)}
        onConfirmar={handleEliminar}
        titulo="Desactivar persona"
        mensaje={`¿Seguro que deseas desactivar a ${modalEliminar?.nombre} ${modalEliminar?.apellido}? Podrás reactivarla después.`}
        cargando={guardando}
      />
    </AuthGuard>
  )
}
