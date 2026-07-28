import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowRight } from '../ui/icons'

export default function AdminFormModal({
  open,
  title,
  onClose,
  onSave,
  saving = false,
  children,
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 py-10 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-2xl px-16 py-10">

        {/* Título */}
        <h2 className="font-display text-center text-5xl text-white">{title}</h2>
        <div className="mx-auto mb-10 mt-3 h-px w-14 bg-copper" />

        {/* Campos */}
        <div className="mb-10 flex flex-col gap-8">
          {children}
        </div>

        {/* Divisor */}
        <hr className="mb-6 border-neutral-700" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-white"
          >
            <X className="h-3 w-3" />
            Descartar Cambios
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-3 rounded-full bg-copper px-8 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
            {!saving && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function ModalField({ label, children }) {
  return (
    <div>
      <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
      {children}
    </div>
  )
}

export function ModalInput({ placeholder, value, onChange, autoFocus }) {
  return (
    <input
      autoFocus={autoFocus}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full border-b border-neutral-600 bg-transparent py-2 text-lg text-white placeholder:text-neutral-600 focus:border-copper focus:outline-none"
    />
  )
}

export function ModalTextarea({ placeholder, value, onChange, rows = 3 }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full resize-y border-b border-neutral-600 bg-transparent py-2 text-base text-white placeholder:text-neutral-600 focus:border-copper focus:outline-none"
    />
  )
}

export function ModalSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full border-b border-neutral-600 bg-neutral-900 py-2 text-lg text-white focus:border-copper focus:outline-none"
    >
      {children}
    </select>
  )
}
