import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import AccessDenied from '../../components/admin/AccessDenied'
import { Plus, Pencil, Trash, Search } from '../../components/ui/icons'
import { usePermissions } from '../../hooks/usePermissions'
import { getProducts, deleteProduct } from '../../services/productService'

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
          : 'bg-neutral-700 text-neutral-400'
      }`}
    >
      {enabled ? 'Activo' : 'Inactivo'}
    </span>
  )
}

const PAGE_SIZE = 10

export default function AdminInventoryPage() {
  const { loading: permsLoading, access, create, canDelete, modify } = usePermissions('/view/inventory')
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [searchQ, setSearchQ]   = useState('')
  const [page, setPage]         = useState(0)
  const [fetchKey, setFetchKey] = useState(0)

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting]                = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const prods = await getProducts({ limit: PAGE_SIZE, page })
        if (!cancelled) {
          setProducts(Array.isArray(prods) ? prods : [])
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

  async function handleSearchProducts(e) {
    const q = e.target.value
    setSearchQ(q)
    if (!q.trim()) {
      setLoading(true)
      setFetchKey((k) => k + 1)
      return
    }
    try {
      const res = await getProducts({ limit: PAGE_SIZE, page: 0, search: q })
      setProducts(Array.isArray(res) ? res : [])
    } catch { /* mantiene lista actual */ }
  }

  async function handleDelete(model) {
    setDeleting(true)
    try {
      await deleteProduct(model)
      setProducts((prev) => prev.filter((p) => p.model !== model))
      setConfirmDeleteId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (!permsLoading && !access) return <AccessDenied />

  return (
    <AdminLayout title="Inventario" searchPlaceholder="Buscar catálogo...">

      {/* ── Productos ── */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-800/40 p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
            <input
              type="search"
              placeholder="Buscar producto..."
              value={searchQ}
              onChange={handleSearchProducts}
              className="w-52 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-8 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
            />
          </div>
          {create && <AddButton label="Añadir Nuevo Producto" onClick={() => navigate('/view/inventory/new')} />}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-700 text-left text-[11px] uppercase tracking-widest text-neutral-500">
              <th className="pb-3 pr-4">Detalle del Producto</th>
              <th className="pb-3 pr-4">Categoría</th>
              <th className="pb-3 pr-4">Estado AR</th>
              <th className="pb-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(permsLoading || loading) ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-sm text-neutral-500">
                  Cargando...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-sm text-neutral-500">
                  No hay productos registrados.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                confirmDeleteId === p.model ? (
                  <tr key={p.model} className="border-b border-neutral-800">
                    <td colSpan={4} className="py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-red-400">
                          ¿Estás seguro de eliminar{' '}
                          <span className="font-medium text-white">"{p.model}"</span>?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-full border border-neutral-700 px-4 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleDelete(p.model)}
                            disabled={deleting}
                            className="rounded-full bg-red-700/70 px-4 py-1.5 text-xs text-red-200 transition-opacity hover:bg-red-700 disabled:opacity-50"
                          >
                            {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={p.model} className="border-b border-neutral-800 hover:bg-neutral-800/40">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-white">{p.name ?? p.model}</p>
                      <p className="text-xs text-neutral-500">{p.model}</p>
                    </td>
                    <td className="py-3 pr-4 text-neutral-300">
                      {p.categories?.map((c) => c.name ?? c).join(', ') || '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge enabled={p.enable !== false} />
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-1">
                        {modify && (
                          <button
                            onClick={() => navigate(`/view/inventory/edit/${encodeURIComponent(p.model)}`)}
                            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setConfirmDeleteId(p.model)}
                            className="rounded p-1.5 text-neutral-400 hover:bg-red-900/40 hover:text-red-400"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              ))
            )}
          </tbody>
        </table>

        <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
          <span>Mostrando {products.length} entradas</span>
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
              disabled={products.length < PAGE_SIZE}
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
