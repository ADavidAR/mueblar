import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import AccessDenied from '../../components/admin/AccessDenied'
import AdminFormModal, { ModalField, ModalInput } from '../../components/admin/AdminFormModal'
import { Plus, Pencil, Trash, Search } from '../../components/ui/icons'
import { usePermissions } from '../../hooks/usePermissions'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categoryService'

export default function AdminCategoriesPage() {
  const { loading: permsLoading, access, create, canDelete, modify } = usePermissions('/view/categories-management')

  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [searchQ, setSearchQ]       = useState('')

  const [modalOpen, setModalOpen]             = useState(false)
  const [editItem, setEditItem]               = useState(null)
  const [name, setName]                       = useState('')
  const [saving, setSaving]                   = useState(false)
  const [saveError, setSaveError]             = useState(null)

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting]               = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await getCategories()
        if (!cancelled) {
          setCategories(Array.isArray(res) ? res : [])
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
  }, [])

  function openCreate() {
    setEditItem(null)
    setName('')
    setSaveError(null)
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setName(item.name ?? '')
    setSaveError(null)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!name.trim()) { setSaveError('El nombre es requerido.'); return }
    setSaving(true)
    setSaveError(null)
    try {
      if (editItem) {
        // El backend regenera el id al actualizar, así que se vuelve a cargar la lista.
        await updateCategory(editItem.id, name.trim())
      } else {
        await createCategory(name.trim())
      }
      const res = await getCategories()
      setCategories(Array.isArray(res) ? res : [])
      setModalOpen(false)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setDeleting(true)
    try {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setConfirmDeleteId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = categories.filter((c) =>
    (c.name ?? '').toLowerCase().includes(searchQ.toLowerCase())
  )

  if (!permsLoading && !access) return <AccessDenied />

  return (
    <AdminLayout title="Categorías">

      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-white">Gestión de Categorías</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Administre las categorías del catálogo de productos de la plataforma.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                placeholder="Buscar categoría..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-52 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-8 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
              />
            </div>
            {create && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 rounded-full bg-copper px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Añadir Categoría
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">{error}</p>
        )}

        <div className="rounded-2xl border border-neutral-800 bg-neutral-800/40">
          {(permsLoading || loading) ? (
            <p className="py-16 text-center text-sm text-neutral-500">Cargando...</p>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-500">
              No hay categorías registradas.
            </p>
          ) : (
            <ul>
              {filtered.map((c, i) => (
                <li
                  key={c.id}
                  className={i < filtered.length - 1 ? 'border-b border-neutral-800' : ''}
                >
                  {confirmDeleteId === c.id ? (
                    <div className="flex items-center justify-between px-5 py-4">
                      <p className="text-sm text-red-400">
                        ¿Estás seguro de eliminar{' '}
                        <span className="font-medium text-white">"{c.name}"</span>?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-full border border-neutral-700 px-4 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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
                        <span className="text-sm font-medium text-white">{c.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {modify && (
                          <button
                            onClick={() => openEdit(c)}
                            className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-700 hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setConfirmDeleteId(c.id)}
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

      <AdminFormModal
        open={modalOpen}
        title={editItem ? 'Editar Categoría' : 'Nueva Categoría'}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      >
        <ModalField label="Nombre de Categoría">
          <ModalInput
            autoFocus
            placeholder="Ej: Salas"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </ModalField>
        {saveError && (
          <p className="text-sm text-red-400">{saveError}</p>
        )}
      </AdminFormModal>

    </AdminLayout>
  )
}
