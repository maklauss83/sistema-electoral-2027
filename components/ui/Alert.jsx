'use client'
import { useEffect, useState } from 'react'

const TIPOS = {
  success: {
    bg: 'bg-emerald-50 border-emerald-400',
    icon: '✅',
    text: 'text-emerald-800',
  },
  error: {
    bg: 'bg-red-50 border-red-400',
    icon: '❌',
    text: 'text-red-800',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-400',
    icon: '⚠️',
    text: 'text-amber-800',
  },
  info: {
    bg: 'bg-blue-50 border-blue-400',
    icon: 'ℹ️',
    text: 'text-blue-800',
  },
}

export function Alert({ tipo = 'info', mensaje, onClose, autoClose = 4000 }) {
  const [visible, setVisible] = useState(true)
  const estilos = TIPOS[tipo] || TIPOS.info

  useEffect(() => {
    if (!autoClose) return
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, autoClose)
    return () => clearTimeout(timer)
  }, [autoClose, onClose])

  if (!visible || !mensaje) return null

  return (
    <div className={`flex items-start gap-3 border-l-4 rounded-lg p-4 ${estilos.bg} ${estilos.text} shadow-sm`}>
      <span className="text-lg flex-shrink-0">{estilos.icon}</span>
      <p className="flex-1 text-sm font-medium">{mensaje}</p>
      <button
        onClick={() => { setVisible(false); onClose?.() }}
        className="text-lg leading-none opacity-60 hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  )
}

// Contenedor de alertas globales
export function AlertContainer({ alertas, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-96 max-w-[calc(100vw-2rem)]">
      {alertas.map(a => (
        <Alert
          key={a.id}
          tipo={a.tipo}
          mensaje={a.mensaje}
          onClose={() => onRemove(a.id)}
        />
      ))}
    </div>
  )
}
