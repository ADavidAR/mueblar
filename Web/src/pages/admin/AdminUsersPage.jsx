import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import AccessDenied from '../../components/admin/AccessDenied'
import { Plus, Pencil, Trash } from '../../components/ui/icons'
import { usePermissions } from '../../hooks/usePermissions'
import {
  getUsers,
  searchUsers,
  deleteUser,
} from '../../services/userAdminService'

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

function StatusBadge({ enabled }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        enabled
          ? 'bg-emerald-900/40 text-emerald-400'
          : 'bg-red-900/30 text-red-400'
      }`}
    >
      {enabled ? 'Activo' : 'Suspendido'}
    </span>
  )
}

const PAGE_SIZE = 10

export default function AdminUsersPage() {
  const { loading: permsLoading, access, create, canDelete, modify } = usePermissions('/view/users-management')

  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [page, setPage]       = useState(0)

  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await getUsers({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })
        if (!cancelled) {
          setUsers(Array.isArray(res) ? res : [])
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
  }, [page, fetchKey])

  async function handleSearch(e) {
    const q = e.target.value
    setSearchQ(q)
    if (!q.trim()) { setLoading(true); setFetchKey((k) => k + 1); return }
    try {
      const res = await searchUsers(q)
      setUsers(Array.isArray(res) ? res : [])
    } catch { /* mantiene lista actual */ }
  }

  async function handleDelete(id, name) {
    if (!confirm(`¿Eliminar el usuario "${name}"?`)) return
    try {
      await deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  if (!permsLoading && !access) return <AccessDenied />

  return (
    <AdminLayout title="Configuración de Usuarios">

      <section className="rounded-2xl border border-neutral-800 bg-neutral-800/40 p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-xl text-white">Personal del Sistema</h2>
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Buscar usuario..."
              value={searchQ}
              onChange={handleSearch}
              className="w-52 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-4 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
            />
            {create && <AddButton label="Crear Usuario" />}
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-700 text-left text-[11px] uppercase tracking-widest text-neutral-500">
              <th className="pb-3 pr-4">Usuario</th>
              <th className="pb-3 pr-4">Correo</th>
              <th className="pb-3 pr-4">Rol</th>
              <th className="pb-3 pr-4">Estado</th>
              <th className="pb-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(permsLoading || loading) ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-neutral-500">
                  Cargando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-neutral-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-800 hover:bg-neutral-800/40">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-white">
                      {u.name} {u.lastName}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-neutral-300">{u.email ?? u.correo}</td>
                  <td className="py-3 pr-4 text-neutral-400">
                    {u.role?.name ?? u.id_rol ?? '—'}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge enabled={u.enabled !== false && u.habilitado !== false} />
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex gap-1">
                      {modify && (
                        <button className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-white">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(u.id, `${u.name} ${u.lastName}`)}
                          className="rounded p-1.5 text-neutral-400 hover:bg-red-900/40 hover:text-red-400"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
          <span>Mostrando {users.length} entradas</span>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex h-7 w-7 items-center justify-center rounded border border-neutral-700 text-neutral-400 disabled:opacity-40 hover:border-copper hover:text-copper-light"
            >
              ‹
            </button>
            <span className="flex h-7 w-7 items-center justify-center rounded border border-copper bg-copper/10 text-copper-light">
              {page + 1}
            </span>
            <button
              disabled={users.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-neutral-700 text-neutral-400 disabled:opacity-40 hover:border-copper hover:text-copper-light"
            >
              ›
            </button>
          </div>
        </div>
      </section>

    </AdminLayout>
  )
}
