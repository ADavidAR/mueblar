import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import AccessDenied from '../../components/admin/AccessDenied'
import { Plus, Pencil, Trash } from '../../components/ui/icons'
import { usePermissions } from '../../hooks/usePermissions'
import {
  getRoles,
  searchRoles,
  deleteRole,
  getPermissions,
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

export default function AdminRolesPage() {
  const { loading: permsLoading, access, create, canDelete, modify } = usePermissions('/view/roles-management')

  const [roles, setRoles]             = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [searchQ, setSearchQ]         = useState('')

  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [rolesRes, permsRes] = await Promise.all([getRoles(), getPermissions()])
        if (!cancelled) {
          setRoles(Array.isArray(rolesRes) ? rolesRes : [])
          setPermissions(Array.isArray(permsRes) ? permsRes : [])
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
      const res = await searchRoles(q)
      setRoles(Array.isArray(res) ? res : [])
    } catch { /* mantiene lista actual */ }
  }

  async function handleDelete(id, name) {
    if (!confirm(`¿Eliminar el rol "${name}"?`)) return
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
            {create && <AddButton label="Crear Nuevo Rol" />}
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {(permsLoading || loading) ? (
          <p className="py-12 text-center text-sm text-neutral-500">Cargando...</p>
        ) : roles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-700 p-8 text-center text-sm text-neutral-500">
            No hay roles registrados.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-800/40 p-5"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-medium text-white">{role.name}</h3>
                  <div className="flex gap-1">
                    {modify && (
                      <button className="rounded p-1 text-neutral-400 hover:bg-neutral-700 hover:text-white">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(role.id, role.name)}
                        className="rounded p-1 text-neutral-400 hover:bg-red-900/40 hover:text-red-400"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {role.permissions?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((p) => (
                      <span
                        key={p.id ?? p.name}
                        className="rounded-full bg-copper/10 px-2 py-0.5 text-[10px] text-copper-light"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Matriz de Roles (permisos disponibles) ── */}
      <section className="mt-12">
        <div className="mb-4">
          <h2 className="font-display text-3xl text-white">Matriz de Roles</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Sincronice módulos de acceso funcional con el controlador lógico interno
            de la aplicación.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-800/40">
          {(permsLoading || loading) ? (
            <p className="py-12 text-center text-sm text-neutral-500">Cargando...</p>
          ) : permissions.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-500">
              No hay permisos definidos en el sistema.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700 text-left text-[11px] uppercase tracking-widest text-neutral-500">
                  <th className="px-6 pb-3 pt-4">Permiso</th>
                  <th className="px-6 pb-3 pt-4">Roles asignados</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => {
                  const assigned = roles.filter((r) =>
                    r.permissions?.some((p) => p.id === perm.id)
                  )
                  return (
                    <tr
                      key={perm.id}
                      className="border-b border-neutral-800 hover:bg-neutral-800/40"
                    >
                      <td className="px-6 py-3 text-white">{perm.name}</td>
                      <td className="px-6 py-3">
                        {assigned.length === 0 ? (
                          <span className="text-neutral-500">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {assigned.map((r) => (
                              <span
                                key={r.id}
                                className="rounded-full bg-neutral-700 px-2 py-0.5 text-[10px] text-neutral-300"
                              >
                                {r.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

    </AdminLayout>
  )
}
