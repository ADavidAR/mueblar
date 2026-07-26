import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import AccessDenied from '../../components/admin/AccessDenied'
import AdminFormModal, { ModalField, ModalInput, ModalSelect } from '../../components/admin/AdminFormModal'
import { Plus, Pencil, Trash, Search } from '../../components/ui/icons'
import { usePermissions } from '../../hooks/usePermissions'
import {
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  getAttributeTypes,
} from '../../services/productService'

const PAGE_SIZE = 10

export default function AdminAttributesPage() {
  const { loading: permsLoading, access, create, canDelete, modify } = usePermissions('/view/inventory')

  const [attributes, setAttributes]           = useState([])
  const [attrTypes, setAttrTypes]             = useState([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(null)
  const [searchQ, setSearchQ]                 = useState('')
  const [page, setPage]                       = useState(0)
  const [fetchKey, setFetchKey]               = useState(0)

  const [modalOpen, setModalOpen]             = useState(false)
  const [editItem, setEditItem]               = useState(null)
  const [name, setName]                       = useState('')
  const [atribTypeId, setAtribTypeId]         = useState('')
  const [saving, setSaving]                   = useState(false)
  const [saveError, setSaveError]             = useState(null)

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting]               = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Los tipos se traen completos (sin paginar): los necesita el selector "Tipo" del modal.
        const [attrsRes, typesRes] = await Promise.all([
          getAttributes({ limit: PAGE_SIZE, page }),
          getAttributeTypes({ limit: 200 }),
        ])
        if (!cancelled) {
          setAttributes(Array.isArray(attrsRes) ? attrsRes : [])
          setAttrTypes(Array.isArray(typesRes) ? typesRes : [])
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
    if (!q.trim()) {
      setLoading(true)
      setPage(0)
      setFetchKey((k) => k + 1)
      return
    }
    // El backend no soporta búsqueda por texto acá: se trae un lote grande y se filtra en el cliente.
    try {
      const res = await getAttributes({ limit: 200 })
      setAttributes(Array.isArray(res) ? res : [])
    } catch { /* mantiene lista actual */ }
  }

  function openCreate() {
    setEditItem(null)
    setName('')
    setAtribTypeId(attrTypes[0]?.id ?? '')
    setSaveError(null)
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setName(item.id ?? '')
    setAtribTypeId(item.atribType?.id ?? attrTypes[0]?.id ?? '')
    setSaveError(null)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!name.trim())  { setSaveError('El nombre es requerido.'); return }
    if (!atribTypeId)  { setSaveError('Seleccioná un tipo.');     return }
    setSaving(true)
    setSaveError(null)
    const payload = { name: name.trim(), atribType: { id: atribTypeId } }
    const localItem = { id: name.trim(), atribType: { id: atribTypeId } }
    try {
      if (editItem) {
        await updateAttribute(editItem.id, payload)
        setAttributes((prev) =>
          prev.map((a) => a.id === editItem.id ? localItem : a)
        )
      } else {
        // El backend no devuelve el objeto creado, así que lo agregamos localmente.
        await createAttribute(payload)
        setAttributes((prev) => [...prev, localItem])
      }
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
      await deleteAttribute(id)
      setAttributes((prev) => prev.filter((a) => a.id !== id))
      setConfirmDeleteId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = attributes.filter((a) =>
    (a.id ?? '').toLowerCase().includes(searchQ.toLowerCase())
  )

  if (!permsLoading && !access) return <AccessDenied />

  return (
    <AdminLayout title="Atributos">

      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-white">Atributos</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Administre los atributos vinculados a cada tipo para las variaciones de productos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                placeholder="Buscar atributo..."
                value={searchQ}
                onChange={handleSearch}
                className="w-52 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-8 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
              />
            </div>
            {create && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 rounded-full bg-copper px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Añadir Atributo
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
              No hay atributos registrados.
            </p>
          ) : (
            <ul>
              {filtered.map((a, i) => (
                <li
                  key={a.id}
                  className={i < filtered.length - 1 ? 'border-b border-neutral-800' : ''}
                >
                  {confirmDeleteId === a.id ? (
                    <div className="flex items-center justify-between px-5 py-4">
                      <p className="text-sm text-red-400">
                        ¿Estás seguro de eliminar{' '}
                        <span className="font-medium text-white">"{a.id}"</span>?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-full border border-neutral-700 px-4 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
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
                        <div>
                          <span className="text-sm font-medium text-white">{a.id}</span>
                          {a.atribType?.id && (
                            <span className="ml-2 text-xs text-neutral-500">{a.atribType.id}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {modify && (
                          <button
                            onClick={() => openEdit(a)}
                            className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-700 hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setConfirmDeleteId(a.id)}
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

        {!searchQ && (
          <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
            <span>Mostrando {attributes.length} entradas</span>
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
                disabled={attributes.length < PAGE_SIZE}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-7 w-7 items-center justify-center rounded border border-neutral-700 text-neutral-400 disabled:opacity-40 hover:border-copper hover:text-copper-light"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </section>

      <AdminFormModal
        open={modalOpen}
        title={editItem ? 'Editar Atributo' : 'Nuevo Atributo'}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      >
        <ModalField label="Nombre de Atributo">
          <ModalInput
            autoFocus
            placeholder="Ej: Rojo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </ModalField>
        <ModalField label="Tipo">
          <ModalSelect value={atribTypeId} onChange={(e) => setAtribTypeId(e.target.value)}>
            {attrTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.id}</option>
            ))}
          </ModalSelect>
        </ModalField>
        {saveError && (
          <p className="text-sm text-red-400">{saveError}</p>
        )}
      </AdminFormModal>

    </AdminLayout>
  )
}
