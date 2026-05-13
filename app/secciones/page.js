'use client'
import { useState, useEffect, useCallback } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { SeccionService } from '@/services/seccion.service'
import { PersonaService } from '@/services/persona.service'
import { Badge, BadgeActivo } from '@/components/ui/Badge'
import { Modal, ModalConfirmar } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { validarSeccion } from '@/lib/validations'

const ROLES_ACCESO = ['candidato','coordinador_electoral','coordinador_seccion']

function SeccionForm({ inicial = {}, onGuardar, onCancelar, cargando }) {
  const [form, setForm] = useState({
    numero_seccion: inicial.numero_seccion || '',
    descripcion: inicial.descripcion || '',
    activa: inicial.activa ?? true,
  })
  const [errores, setErrores] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const { valido, errores: err } = validarSeccion(form)
    if (!valido) { setErrores(err); return }
    onGuardar(form)
  }

  const inputClass = (campo) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
      errores[campo] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Número de sección *</label>
        <input
          className={inputClass('numero_seccion')}
          value={form.numero_seccion}
          onChange={e => { setForm(p=>({...p, numero_seccion: e.target.value})); setErrores(p=>({...p, numero_seccion: null})) }}
          placeholder="Ej: 1745"
        />
        {errores.numero_seccion && <p className="text-xs text-red-600 mt-1">{errores.numero_seccion}</p>}
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción / Ubicación</label>
        <textarea
          className={inputClass('descripcion') + ' resize-none'}
          value={form.descripcion}
          onChange={e => setForm(p=>({...p, descripcion: e.target.value}))}
          placeholder="Descripción o ubicación de la sección..."
          rows={3}
        />
      </div>
      {inicial.id && (
        <div className="flex items-center gap-2">
          <input type="checkbox" id="activa" checked={form.activa} onChange={e => setForm(p=>({...p, activa: e.target.checked}))} className="w-4 h-4 text-blue-600 rounded" />
          <label htmlFor="activa" className="text-sm text-gray-700">Sección activa</label>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancelar} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
        <button type="submit" disabled={cargando} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
          {cargando ? 'Guardando...' : inicial.id ? 'Actualizar' : 'Crear sección'}
        </button>
      </div>
    </form>
  )
}

export default function SeccionesPage() {
  const { persona } = useAuth()
  const [secciones, setSecciones] = useState([])
  const [coordinadoresDisponibles, setCoordinadoresDisponibles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [alerta, setAlerta] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [modalCoord, setModalCoord] = useState(null)
  const [idCoordSeleccionado, setIdCoordSeleccionado] = useState('')

  const cargar = useCallback(async () => {
    if (!persona) return
    setCargando(true)
    try {
      const data = await SeccionService.obtenerTodas()
      setSecciones(data)
      const coords = await PersonaService.obtenerPorRol('coordinador_seccion')
      setCoordinadoresDisponibles(coords)
    } catch (e) {
      mostrarAlerta('error', 'Error al cargar secciones')
    } finally {
      setCargando(false)
    }
  }, [persona])

  useEffect(() => { cargar() }, [cargar])

  function mostrarAlerta(tipo, mensaje) {
    setAlerta({ tipo, mensaje })
  }

  async function handleCrear(form) {
    setGuardando(true)
    try {
      await SeccionService.crear(form, persona.id)
      mostrarAlerta('success', `Sección ${form.numero_seccion} creada correctamente`)
      setModalCrear(false)
      await cargar()
    } catch (e) {
      mostrarAlerta('error', e.message.includes('unique') ? 'Esa sección ya existe' : 'Error al crear sección')
    } finally {
      setGuardando(false)
    }
  }

  async function handleEditar(form) {
    setGuardando(true)
    try {
      await SeccionService.actualizar(modalEditar.id, form)
      mostrarAlerta('success', 'Sección actualizada correctamente')
      setModalEditar(null)
      await cargar()
    } catch (e) {
      mostrarAlerta('error', 'Error al actualizar')
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar() {
    setGuardando(true)
    try {
      await SeccionService.eliminar(modalEliminar.id)
      mostrarAlerta('success', 'Sección eliminada correctamente')
      setModalEliminar(null)
      await cargar()
    } catch (e) {
      mostrarAlerta('error', 'Error al eliminar')
    } finally {
      setGuardando(false)
    }
  }

  async function handleAsignarCoord() {
    if (!idCoordSeleccionado) return
    setGuardando(true)
    try {
      await SeccionService.asignarCoordinador(modalCoord.id, parseInt(idCoordSeleccionado))
      mostrarAlerta('success', 'Coordinador asignado correctamente')
      setModalCoord(null)
      setIdCoordSeleccionado('')
      await cargar()
    } catch (e) {
      mostrarAlerta('error', e.message.includes('unique') ? 'Ese coordinador ya está en esta sección' : 'Error al asignar')
    } finally {
      setGuardando(false)
    }
  }

  async function handleQuitarCoord(idSeccion, idPersona) {
    try {
      await SeccionService.quitarCoordinador(idSeccion, idPersona)
      mostrarAlerta('success', 'Coordinador removido')
      await cargar()
    } catch (e) {
      mostrarAlerta('error', 'Error al remover coordinador')
    }
  }

  const seccionesFiltradas = secciones.filter(s =>
    s.numero_seccion?.toLowerCase().includes(filtro.toLowerCase()) ||
    s.descripcion?.toLowerCase().includes(filtro.toLowerCase())
  )

  const esAdminUser = persona?.rol === 'candidato' || persona?.rol === 'coordinador_electoral'

  return (
    <AuthGuard rolesPermitidos={ROLES_ACCESO}>
      {alerta && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <Alert tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🗂️ Secciones</h1>
            <p className="text-sm text-gray-400 mt-0.5">{seccionesFiltradas.length} secciones</p>
          </div>
          {esAdminUser && (
            <button onClick={() => setModalCrear(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              + Nueva sección
            </button>
          )}
        </div>

        <div className="mb-5">
          <input
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            placeholder="Buscar sección..."
            className="w-full max-w-sm px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {cargando ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {seccionesFiltradas.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
                      <span className="text-teal-700 font-bold">{s.numero_seccion}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Sección {s.numero_seccion}</h3>
                      <p className="text-sm text-gray-400">{s.descripcion || 'Sin descripción'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BadgeActivo activo={s.activa} />
                    {esAdminUser && (
                      <>
                        <button onClick={() => setModalCoord(s)} className="px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">+ Coordinador</button>
                        <button onClick={() => setModalEditar(s)} className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">Editar</button>
                        <button onClick={() => setModalEliminar(s)} className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Eliminar</button>
                      </>
                    )}
                  </div>
                </div>

                {/* Coordinadores */}
                {s.coordinadores?.length > 0 && (
                  <div className="border-t border-gray-50 px-5 py-3 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Coordinadores</p>
                    <div className="flex flex-wrap gap-2">
                      {s.coordinadores.filter(c => c.activo).map(c => (
                        <div key={c.id} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-1.5">
                          <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-xs text-teal-700 font-bold">
                            {c.persona?.nombre?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{c.persona?.nombre} {c.persona?.apellido}</span>
                          {esAdminUser && (
                            <button onClick={() => handleQuitarCoord(s.id, c.persona?.id)} className="text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {seccionesFiltradas.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <span className="text-4xl mb-3">🗂️</span>
                <p className="text-sm">No hay secciones registradas</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal abierto={modalCrear} onClose={() => setModalCrear(false)} titulo="Nueva sección">
        <SeccionForm onGuardar={handleCrear} onCancelar={() => setModalCrear(false)} cargando={guardando} />
      </Modal>

      <Modal abierto={!!modalEditar} onClose={() => setModalEditar(null)} titulo="Editar sección">
        {modalEditar && <SeccionForm inicial={modalEditar} onGuardar={handleEditar} onCancelar={() => setModalEditar(null)} cargando={guardando} />}
      </Modal>

      <ModalConfirmar abierto={!!modalEliminar} onClose={() => setModalEliminar(null)} onConfirmar={handleEliminar}
        titulo="Eliminar sección" mensaje={`¿Eliminar la sección ${modalEliminar?.numero_seccion}? Esta acción no se puede deshacer.`} cargando={guardando} />

      {/* Modal asignar coordinador */}
      <Modal abierto={!!modalCoord} onClose={() => { setModalCoord(null); setIdCoordSeleccionado('') }} titulo={`Asignar coordinador a Sección ${modalCoord?.numero_seccion}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Coordinador de sección</label>
            <select value={idCoordSeleccionado} onChange={e => setIdCoordSeleccionado(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white">
              <option value="">Seleccionar...</option>
              {coordinadoresDisponibles.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setModalCoord(null); setIdCoordSeleccionado('') }} className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button onClick={handleAsignarCoord} disabled={!idCoordSeleccionado || guardando} className="flex-1 px-4 py-2.5 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-60">
              {guardando ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        </div>
      </Modal>
    </AuthGuard>
  )
}
