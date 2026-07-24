/*
  ConfirmModal — no sabe NADA sobre productos, variantes, usuarios, etc.
  Solo muestra un título, un mensaje, y dos botones. Quien lo use decide
  qué pasa realmente al confirmar (a través de la función onConfirm).

  Ejemplo de uso:

    const [pendingDelete, setPendingDelete] = useState(null) // guarda QUÉ se va a borrar

    <ConfirmModal
      open={pendingDelete !== null}
      title="Eliminar variante"
      message={`¿Eliminar "${pendingDelete}"? Esta acción no se puede deshacer.`}
      onConfirm={() => {
        // aquí va la lógica real de borrado, específica de cada caso
        setPendingDelete(null)
      }}
      onCancel={() => setPendingDelete(null)}
    />
*/
export default function ConfirmModal({
  open,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl text-white">{title}</h2>

        {message && (
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            {message}
          </p>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-neutral-700 px-5 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-500"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-full px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 ${
              danger ? 'bg-red-600' : 'bg-copper'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
