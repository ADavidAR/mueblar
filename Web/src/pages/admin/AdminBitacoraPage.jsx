import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import AccessDenied from '../../components/admin/AccessDenied'
import { Plus, Pencil, Trash } from '../../components/ui/icons'
import { usePermissions } from '../../hooks/usePermissions'
import {
  getRoles,
  searchRoles,
  deleteRole,
} from '../../services/roleService'


function AddButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-copper px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  )
}

export default function AdminBitacoraPage() {
  const { loading: permsLoading, access, create, canDelete, modify } = usePermissions('/view/roles-management')

  const navigate          = useNavigate()
  const [logs, setlog] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQ, setSearchQ] = useState('')


 


   const [confirmDeleteId, setConfirmDeleteId] = useState(null)
   const [deleting, setDeleting]               = useState(false)

  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [rolesRes] = await Promise.all([getRoles()])
        if (!cancelled) {
          setRoles(Array.isArray(rolesRes) ? rolesRes : [])
         
          setError(null)
         
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [fetchKey])

  async function handleSearch(e) {
    const q = e.target.value
    setSearchQ(q)
    if (!q.trim()) { setLoading(true); setFetchKey((k) => k + 1); return }
    try {
     const res = roles.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()))
      
      setRoles(Array.isArray(res) ? res : [])
    } catch { /* mantiene lista actual */ }
  }

  async function handleDelete(id, name) {
    
    try {
      await deleteRole(id)
      setRoles((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }


  


  if (!permsLoading && !access) return <AccessDenied />

  return (
    <AdminLayout title="Gestión de Roles">

      {/* ── Roles Definidos ── */}
      <section>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-white">Roles Definidos</h2>
            <p className="mt-2 max-w-lg text-sm text-neutral-400">
              Asigne niveles de acceso granulares para cumplir con los requisitos
              específicos del ecosistema de la aplicación móvil.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <input
              type="search"
              placeholder="Buscar rol..."
              value={searchQ}
              onChange={handleSearch}
              className="w-44 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-4 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
            />
            {create && <AddButton onClick={()=>navigate('/view/roles/create')} label="Crear Nuevo Rol" />}
          </div>
        </div>

       
      </section>

      {/* ── Matriz de Roles (permisos disponibles) ── */}
      <section className="mt-12">
      

        <div className="rounded-2xl border border-neutral-800 bg-neutral-800/40">
          {(permsLoading || loading) ? (
            <p className="py-12 text-center text-sm text-neutral-500">Cargando...</p>
          ) : roles.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-500">
              No hay roles definidos en el sistema.
            </p>
          ) : (
             <ul>
              {roles.map((r,i) => (
                <li
                  key={r.id}
                  className={i < roles.length - 1 ? 'border-b border-neutral-800' : ''}
                >
                  {confirmDeleteId === r.id ? (
                    <div className="flex items-center justify-between px-5 py-4">
                      <p className="text-sm text-red-400">
                        ¿Estás seguro de eliminar{' '}
                        <span className="font-medium text-white">"{r.name}"</span>?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-full border border-neutral-700 px-4 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deleting}
                          className="rounded-full bg-red-700/70 px-4 py-1.5 text-xs text-red-200 transition-opacity hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-5 py-4 hover:bg-neutral-800/50">
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-copper/60" />
                        <span className="text-sm font-medium text-white">{r.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {modify && (
                          <button
                            onClick={() =>navigate(`/view/Roles/edit/${encodeURIComponent(r.id)}`)}
                            className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-700 hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setConfirmDeleteId(r.id)}
                            className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-red-900/40 hover:text-red-400"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

    </AdminLayout>
  )
}
