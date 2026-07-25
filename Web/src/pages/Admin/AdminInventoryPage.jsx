import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useAuth, hasPermission } from '../../context/AuthContext'
import AdminLayout from '../../components/layout/AdminLayout'
import { Plus, Pencil, Trash, Search } from '../../components/ui/icons'
import ConfirmModal  from '../../components/ui/ConfirmModal'
import {
  getProducts,
  searchProducts,
  deleteProduct,
  getAttributeTypes,
  deleteAttributeType,
  getAttributes,
} from '../../services/productService'

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
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${enabled
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
  const navigate = useNavigate()
  const { user } = useAuth()
  //phasspermission gpregunta si el usuario tiene permiso
  const canCreateProduct = hasPermission(user?.permissions, '/api/products', 'POST')
  const canViewAttributeType= hasPermission(user?.permissions,'/api/attribute-types','GET')
  const canCreateAttributeType= hasPermission(user?.permissions,'/view/attribute-type-add','POST')
  const canUpdateAttributeType= hasPermission(user?.permissions,'/api/attribute-types/{id_tipo_atributo}','PUT')
  const canDeleteAttributeType= hasPermission(user?.permissions,'/api/attribute-types/{id_tipo_atributo}','DELETE')
  //pata eliminar algo
  const [pendingDelete, setPendingDelete] = useState(null) // guarda QUÉ se va a borrar


  const [products, setProducts] = useState([])
  const [attrTypes, setAttrTypes] = useState([])
  const [attributes, setAttributes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [attrTypeQ, setAttrTypeQ] = useState('')
  const [attrQ, setAttrQ] = useState('')
  const [page, setPage] = useState(0)
  
 const [funcion, setFuncion] = useState(() => null);

  const loadAll = useCallback(async () => {
    try {
      const [prods, types, attrs] = await Promise.all([
        getProducts({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
        getAttributeTypes(),
        getAttributes(),
      ])
      //-------------------------------------------
      setProducts(Array.isArray(prods) ? prods : [])
      setAttrTypes(Array.isArray(types) ? types : [])
      setAttributes(Array.isArray(attrs) ? attrs : [])
      setError(null)


      //*--------------------------------------------
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }

  }, [page])

  useEffect(() => { loadAll() }, [loadAll])



  async function handleSearchProducts(e) {
    const q = e.target.value
    setSearchQ(q)
    if (!q.trim()) { setLoading(true); loadAll(); return }
    try {
      const res = await searchProducts(q)
      setProducts(Array.isArray(res) ? res : [])
    } catch { /* mantiene lista actual */ }
  }

  async function handleDeleteProduct(model) {
    if (!confirm(`¿Eliminar el producto "${model}"?`)) return
    try {
      await deleteProduct(model)
      setProducts((prev) => prev.filter((p) => p.model !== model))
    } catch (err) {
      alert(err.message)
    }
  }
  async function handleDeleteAttributeType(id){
   
    try {
      await deleteAttributeType(id)
      setAttrTypes((prev) => prev.filter((AT) => AT.id !== id))
      console.log(id)
    } catch (err) {
      console.log (err.message)
    }
  }

  const filteredAttrTypes = attrTypes.filter((t) =>
    t.id?.toLowerCase().includes(attrTypeQ.toLowerCase())
  )
  const filteredAttrs = attributes.filter((a) =>
    a.name?.toLowerCase().includes(attrQ.toLowerCase())
  )

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

          {canCreateProduct && (
            <AddButton
              label="Añadir Nuevo Producto"
              onClick={() => navigate('/view/product-creation')}
            />
          )}

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
            {loading ? (
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
                      <button className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-white">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.model)}
                        className="rounded p-1.5 text-neutral-400 hover:bg-red-900/40 hover:text-red-400"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
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

      {/* ── Tipo Atributo ── */}
{canViewAttributeType &&(
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-white">Tipo atributo</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                placeholder="Buscar Tipo de Atributo..."
                value={attrTypeQ}
                onChange={(e) => setAttrTypeQ(e.target.value)}
                className="w-52 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-8 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
              />
            </div>
            {canCreateAttributeType && (

              <AddButton onClick={() => navigate('/view/attribute-type-add')} label="Añadir Tipo de atributo" />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-800/40">
          {loading ? (
            <p className="py-12 text-center text-sm text-neutral-500">Cargando...</p>
          ) : filteredAttrTypes.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-500">
              No hay tipos de atributo registrados.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700 text-left text-[11px] uppercase tracking-widest text-neutral-500">
                  <th className="px-6 pb-3 pt-4">Nombre</th>
                  <th className="px-6 pb-3 pt-4">Descripción</th>       
                  <th className="pb-3 pt-4 text-right pr-6">Acciones</th>
                  
                </tr>

              </thead>
              <tbody>
                {filteredAttrTypes.map((t) => (
                  <tr key={t.id} className="border-b border-neutral-800 hover:bg-neutral-800/40">
                    <td className="px-6 py-3 text-white">{t.id}</td>
                    <td className="px-6 py-3 text-white">{t.description}</td>
                    <td className="py-3 pr-6 text-right">
                      <div className="inline-flex gap-1">
                        {canUpdateAttributeType && (
                          <button onClick={() => { navigate('/view/attribute-type-update',{
                          state:t
                        }) }} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-white">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDeleteAttributeType && (

                        <button onClick={()=>{
                          setPendingDelete(t.id)
                          setFuncion(()=>handleDeleteAttributeType)
                        }} className="rounded p-1.5 text-neutral-400 hover:bg-red-900/40 hover:text-red-400">
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
   )
}

      {/* ── Atributo ── */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-white">Atributo</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                placeholder="Buscar Atributo..."
                value={attrQ}
                onChange={(e) => setAttrQ(e.target.value)}
                className="w-52 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-8 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
              />
            </div>
            <AddButton label="Añadir atributo" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-800/40">
          {loading ? (
            <p className="py-12 text-center text-sm text-neutral-500">Cargando...</p>
          ) : filteredAttrs.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-500">
              No hay atributos registrados.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700 text-left text-[11px] uppercase tracking-widest text-neutral-500">
                  <th className="px-6 pb-3 pt-4">Nombre</th>
                  <th className="px-6 pb-3 pt-4">Tipo</th>
                  <th className="pb-3 pt-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttrs.map((a) => (
                  <tr key={a.id} className="border-b border-neutral-800 hover:bg-neutral-800/40">
                    <td className="px-6 py-3 text-white">{a.name}</td>
                    <td className="px-6 py-3 text-neutral-400">{a.atribType?.name ?? '—'}</td>
                    <td className="py-3 pr-6 text-right">
                      <div className="inline-flex gap-1">
                        <button className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-white">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button className="rounded p-1.5 text-neutral-400 hover:bg-red-900/40 hover:text-red-400">
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

    <ConfirmModal
      open={pendingDelete !== null}
      title="Eliminar variante"
      message={`¿Eliminar "${pendingDelete}"? Esta acción no se puede deshacer.`}
      onConfirm={() => {
        funcion(pendingDelete)
        setPendingDelete(null)
        setFuncion(() => null)
      }}
      onCancel={() => setPendingDelete(null)}
    />

    </AdminLayout>
  )
}
