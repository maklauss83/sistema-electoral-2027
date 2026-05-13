'use client'
import { useState } from 'react'
import { validarPersona, ROLES_LABELS, ROLES_PERMITIDOS, puedeCrearRol } from '@/lib/validations'

export function PersonaForm({ inicial = {}, rolCreador, onGuardar, onCancelar, cargando }) {
  const [form, setForm] = useState({
    nombre: inicial.nombre || '',
    apellido: inicial.apellido || '',
    telefono: inicial.telefono || '',
    correo: inicial.correo || '',
    rol: inicial.rol || '',
    password: '',
    activo: inicial.activo ?? true,
  })
  const [errores, setErrores] = useState({})

  const rolesDisponibles = ROLES_PERMITIDOS[rolCreador] || []
  const esEdicion = !!inicial.id
  const necesitaLogin = ['candidato', 'coordinador_electoral', 'coordinador_seccion', 'movilizador'].includes(form.rol)

  function handleChange(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: null }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const { valido, errores: err } = validarPersona(form)

    // Validar password solo si es nuevo y necesita login
    if (!esEdicion && necesitaLogin && !form.password) {
      err.password = 'La contraseña es obligatoria para este rol'
    }
    if (!esEdicion && necesitaLogin && form.password && form.password.length < 6) {
      err.password = 'Mínimo 6 caracteres'
    }
    if (!esEdicion && necesitaLogin && !form.correo?.trim()) {
      err.correo = 'El correo es obligatorio para este rol'
    }

    if (!valido || Object.keys(err).length > 0) {
      setErrores(err)
      return
    }
    onGuardar(form)
  }

  const inputClass = (campo) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
      errores[campo]
        ? 'border-red-400 bg-red-50 focus:border-red-500'
        : 'border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre *</label>
          <input className={inputClass('nombre')} value={form.nombre} onChange={e => handleChange('nombre', e.target.value)} placeholder="Juan" />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Apellido *</label>
          <input className={inputClass('apellido')} value={form.apellido} onChange={e => handleChange('apellido', e.target.value)} placeholder="García" />
          {errores.apellido && <p className="text-xs text-red-600 mt-1">{errores.apellido}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rol *</label>
        <select className={inputClass('rol')} value={form.rol} onChange={e => handleChange('rol', e.target.value)} disabled={esEdicion}>
          <option value="">Seleccionar rol...</option>
          {rolesDisponibles.map(r => (
            <option key={r} value={r}>{ROLES_LABELS[r]}</option>
          ))}
        </select>
        {errores.rol && <p className="text-xs text-red-600 mt-1">{errores.rol}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Teléfono</label>
          <input className={inputClass('telefono')} value={form.telefono} onChange={e => handleChange('telefono', e.target.value)} placeholder="555-123-4567" type="tel" />
          {errores.telefono && <p className="text-xs text-red-600 mt-1">{errores.telefono}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Correo {necesitaLogin && !esEdicion && '*'}
          </label>
          <input className={inputClass('correo')} value={form.correo} onChange={e => handleChange('correo', e.target.value)} placeholder="correo@ejemplo.com" type="email" />
          {errores.correo && <p className="text-xs text-red-600 mt-1">{errores.correo}</p>}
        </div>
      </div>

      {/* Password solo para nuevos con login */}
      {!esEdicion && necesitaLogin && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contraseña *</label>
          <input className={inputClass('password')} value={form.password} onChange={e => handleChange('password', e.target.value)} placeholder="Mínimo 6 caracteres" type="password" />
          {errores.password && <p className="text-xs text-red-600 mt-1">{errores.password}</p>}
          <p className="text-xs text-gray-400 mt-1">Con esto el usuario podrá iniciar sesión</p>
        </div>
      )}

      {esEdicion && (
        <div className="flex items-center gap-2">
          <input type="checkbox" id="activo" checked={form.activo} onChange={e => handleChange('activo', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
          <label htmlFor="activo" className="text-sm text-gray-700">Persona activa</label>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancelar} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={cargando} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
          {cargando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear persona'}
        </button>
      </div>
    </form>
  )
}
