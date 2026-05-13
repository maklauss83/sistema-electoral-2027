import { ROLES_LABELS, ROLES_COLORES } from '@/lib/validations'

const COLORES = {
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  red: 'bg-red-100 text-red-800 border-red-200',
}

export function Badge({ rol, texto, color }) {
  const colorKey = color || ROLES_COLORES[rol] || 'gray'
  const label = texto || ROLES_LABELS[rol] || rol

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${COLORES[colorKey] || COLORES.gray}`}>
      {label}
    </span>
  )
}

export function BadgeActivo({ activo }) {
  return activo
    ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo
      </span>
    : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Inactivo
      </span>
}
