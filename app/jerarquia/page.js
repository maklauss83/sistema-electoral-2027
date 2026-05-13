'use client'
import { useState, useEffect, useCallback } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { JerarquiaService } from '@/services/jerarquia.service'
import { PersonaService } from '@/services/persona.service'
import { SeccionService } from '@/services/seccion.service'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalConfirmar } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { ROLES_LABELS } from '@/lib/validations'

export default function JerarquiaPage() {
  const { persona } = useAuth()
  const [relaciones, setRelaciones] = useState([])
  const [personas, setPersonas] = useState([])
  const [secciones, setSecciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [alerta, setAlerta] = useState(null)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [form, setForm] = useState({ id_superior: '', id_subordinado: '', id_seccion: '', tipo_relacion: 'coordina' })
  const [errForm, setErrForm] = useState({})

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [rels, pers, secc] = await Promise.all([
        JerarquiaService.obtenerTodas(),
        PersonaService.obtenerTodas(),
        SeccionService.obtenerTodas(),
      ])
      setRelaciones(rels)
      setPersonas(pers)
      setSecciones(secc)
    } catch (e) {
      mostrarAlerta('error', 'Error al cargar jerarquía')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  function mostrarAlerta(tipo, mensaje) { setAlerta({ tipo, mensaje }) }

  function validarForm() {
    const err = {}
    if (!form.id_superior) err.id_superior = 'Selecciona el superior'
    if (!form.id_subordinado) err.id_subordinado = 'Selecciona el subordinado'
    if (form.id_superior === form.id_subordinado) err.id_subordinado = 'No puede ser la misma persona'
    if (!form.tipo_relacion) err.tipo_relacion = 'Selecciona el tipo'
    return err
  }

  async function handleCrear(e) {
    e.preventDefault()
    const err = validarForm()
    if (Object.keys(err).length > 0) { setErrForm(err); return }
    setGuardando(true)
    try {
      await JerarquiaService.crear({
        id_superior: parseInt(form.id_superior),
        id_subordinado: parseInt(form.id_subordinado),
        id_seccion: form.id_seccion ? parseInt(form.id_seccion) : null,
        tipo_relacion: form.tipo_relacion,
      })
      mostrarAlerta('success', 'Relación creada correctamente')
      setModalCrear(false)
      setForm({ id_superior: '', id_subordinado: '', id_seccion: '', tipo_relacion: 'coordina' })
      await cargar()
    } catch (e) {
      mostrarAlerta('error', e.message.includes('unique') ? 'Esa relación ya existe' : 'Error al crear relación')
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar() {
    setGuardando(true)
    try {
      await JerarquiaService.eliminar(modalEliminar.id)
      mostrarAlerta('success', 'Relación desactivada')
      setModalEliminar(null)
      await cargar()
    } catch (e) {
      mostrarAlerta('error', 'Error al desactivar relación')
    } finally {
      setGuardando(false)
    }
  }

  const inputClass = (campo) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none bg-white ${
      errForm[campo] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
    }`

  const TIPOS_RELACION = {
    coordina: { label: 'Coordina', color: 'blue' },
    moviliza: { label: 'Moviliza', color: 'amber' },
    registra: { label: 'Registra', color: 'gray' },
  }

  return (
    <AuthGuard rolesPermitidos={['candidato','coordinador_electoral']}>
      {alerta && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <Alert tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🔗 Jerarquía</h1>
            <p className="text-sm text-gray-400 mt-0.5">{relaciones.length} relaciones activas</p>
          </div>
          <button onClick={() => setModalCrear(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            + Nueva relación
          </button>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {relaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <span className="text-4xl mb-3">🔗</span>
                <p className="text-sm">No hay relaciones jerárquicas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Superior</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Relación</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Subordinado</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Sección</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {relaciones.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{r.superior?.nombre} {r.superior?.apellido}</p>
                            <Badge rol={r.superior?.rol} />
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge texto={TIPOS_RELACION[r.tipo_relacion]?.label || r.tipo_relacion} color={TIPOS_RELACION[r.tipo_relacion]?.color || 'gray'} />
                        </td>
                        <td className="px-5 py-3">
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{r.subordinado?.nombre} {r.subordinado?.apellido}</p>
                            <Badge rol={r.subordinado?.rol} />
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-gray-500">{r.seccion ? `Sección ${r.seccion.numero_seccion}` : '—'}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => setModalEliminar(r)} className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                            Desactivar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal abierto={modalCrear} onClose={() => setModalCrear(false)} titulo="Nueva relación jerárquica">
        <form onSubmit={handleCrear} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Superior *</label>
            <select className={inputClass('id_superior')} value={form.id_superior} onChange={e => { setForm(p=>({...p, id_superior: e.target.value})); setErrForm(p=>({...p, id_superior: null})) }}>
              <option value="">Seleccionar persona...</option>
              {personas.filter(p => p.rol !== 'ciudadano').map(p => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido} — {ROLES_LABELS[p.rol]}</option>
              ))}
            </select>
            {errForm.id_superior && <p className="text-xs text-red-600 mt-1">{errForm.id_superior}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo de relación *</label>
            <select className={inputClass('tipo_relacion')} value={form.tipo_relacion} onChange={e => setForm(p=>({...p, tipo_relacion: e.target.value}))}>
              <option value="coordina">Coordina</option>
              <option value="moviliza">Moviliza</option>
              <option value="registra">Registra</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subordinado *</label>
            <select className={inputClass('id_subordinado')} value={form.id_subordinado} onChange={e => { setForm(p=>({...p, id_subordinado: e.target.value})); setErrForm(p=>({...p, id_subordinado: null})) }}>
              <option value="">Seleccionar persona...</option>
              {personas.filter(p => p.id !== parseInt(form.id_superior)).map(p => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido} — {ROLES_LABELS[p.rol]}</option>
              ))}
            </select>
            {errForm.id_subordinado && <p className="text-xs text-red-600 mt-1">{errForm.id_subordinado}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sección (opcional)</label>
            <select className={inputClass('id_seccion')} value={form.id_seccion} onChange={e => setForm(p=>({...p, id_seccion: e.target.value}))}>
              <option value="">Sin sección específica</option>
              {secciones.map(s => (
                <option key={s.id} value={s.id}>Sección {s.numero_seccion}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalCrear(false)} className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={guardando} className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {guardando ? 'Guardando...' : 'Crear relación'}
            </button>
          </div>
        </form>
      </Modal>

      <ModalConfirmar abierto={!!modalEliminar} onClose={() => setModalEliminar(null)} onConfirmar={handleEliminar}
        titulo="Desactivar relación"
        mensaje={`¿Desactivar la relación entre ${modalEliminar?.superior?.nombre} y ${modalEliminar?.subordinado?.nombre}?`}
        cargando={guardando} />
    </AuthGuard>
  )
}
