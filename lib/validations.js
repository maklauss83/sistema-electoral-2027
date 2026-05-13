// ── Validaciones del sistema electoral ──────────────────────────
// Principio SOLID: Single Responsibility — cada función valida una sola cosa

export const ROLES = {
  CANDIDATO: 'candidato',
  COORDINADOR_ELECTORAL: 'coordinador_electoral',
  COORDINADOR_SECCION: 'coordinador_seccion',
  MOVILIZADOR: 'movilizador',
  CIUDADANO: 'ciudadano',
}

export const ROLES_LABELS = {
  candidato: 'Candidato',
  coordinador_electoral: 'Coordinador Electoral',
  coordinador_seccion: 'Coordinador de Sección',
  movilizador: 'Movilizador',
  ciudadano: 'Ciudadano',
}

export const ROLES_COLORES = {
  candidato: 'purple',
  coordinador_electoral: 'blue',
  coordinador_seccion: 'teal',
  movilizador: 'amber',
  ciudadano: 'gray',
}

// Qué roles puede crear cada rol
export const ROLES_PERMITIDOS = {
  candidato: ['coordinador_electoral', 'coordinador_seccion', 'movilizador', 'ciudadano'],
  coordinador_electoral: ['coordinador_seccion', 'movilizador', 'ciudadano'],
  coordinador_seccion: ['movilizador'],
  movilizador: ['ciudadano'],
  ciudadano: [],
}

export function validarPersona(data) {
  const errores = {}

  if (!data.nombre?.trim()) errores.nombre = 'El nombre es obligatorio'
  else if (data.nombre.trim().length < 2) errores.nombre = 'Mínimo 2 caracteres'

  if (!data.apellido?.trim()) errores.apellido = 'El apellido es obligatorio'
  else if (data.apellido.trim().length < 2) errores.apellido = 'Mínimo 2 caracteres'

  if (!data.rol) errores.rol = 'El rol es obligatorio'

  if (data.correo && data.correo.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.correo.trim())) errores.correo = 'Correo inválido'
  }

  if (data.telefono && data.telefono.trim()) {
    const telRegex = /^[\d\s\-\+\(\)]{7,15}$/
    if (!telRegex.test(data.telefono.trim())) errores.telefono = 'Teléfono inválido'
  }

  return { valido: Object.keys(errores).length === 0, errores }
}

export function validarSeccion(data) {
  const errores = {}

  if (!data.numero_seccion?.trim()) errores.numero_seccion = 'El número de sección es obligatorio'
  else if (data.numero_seccion.trim().length < 1) errores.numero_seccion = 'Ingresa un número válido'

  return { valido: Object.keys(errores).length === 0, errores }
}

export function validarLogin(data) {
  const errores = {}

  if (!data.email?.trim()) errores.email = 'El correo es obligatorio'
  else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email.trim())) errores.email = 'Correo inválido'
  }

  if (!data.password) errores.password = 'La contraseña es obligatoria'
  else if (data.password.length < 6) errores.password = 'Mínimo 6 caracteres'

  return { valido: Object.keys(errores).length === 0, errores }
}

export function puedeCrearRol(rolCreador, rolNuevo) {
  return ROLES_PERMITIDOS[rolCreador]?.includes(rolNuevo) ?? false
}

export function esAdmin(rol) {
  return rol === ROLES.CANDIDATO || rol === ROLES.COORDINADOR_ELECTORAL
}
