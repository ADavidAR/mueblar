import { useNavigate } from 'react-router-dom'
import AdminLayout from '../layout/AdminLayout'

export default function AccessDenied() {
  const navigate = useNavigate()
  return (
    <AdminLayout title="Acceso denegado">
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-900/30 text-4xl text-red-500">
          ✕
        </div>
        <h2 className="mt-6 font-display text-3xl text-white">Acceso denegado</h2>
        <p className="mt-3 max-w-xs text-sm text-neutral-400">
          No tenés permisos para ver esta sección. Contactá al administrador si
          creés que esto es un error.
        </p>
        <button
          onClick={() => navigate('/view/dashboard')}
          className="mt-8 rounded-full bg-copper px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Regresar al inicio
        </button>
      </div>
    </AdminLayout>
  )
}
