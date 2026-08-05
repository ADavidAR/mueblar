import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { ModalField, ModalInput, ModalTextarea, ModalSelect } from '../../components/admin/AdminFormModal'
import { ArrowRight, Trash, Check, Package } from '../../components/ui/icons'
import {
  getProduct,
  createProduct,
  updateProduct,
  getAttributes,
  getAttributeTypes,
} from '../../services/productService'
import { getCategories } from '../../services/categoryService'

//inputs para ingresar las dimenciones del modelo
function DimensionBox({ label, value, onChange }) {
  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-5 text-center">
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder="0"
        className="w-full bg-transparent text-center text-2xl text-white focus:outline-none"
      />
      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
    </div>
  )
}

//checkbos para modal
function ModalCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-neutral-600 bg-transparent accent-copper"
      />
      {label}
    </label>
  )
}

// Subida a Supabase Storage desconectada por ahora (falta la policy de INSERT
// en el bucket). Es solo visual: el valor real se completa pegando la URL abajo.
function DropZone({ label, hint, value, onUrlChange }) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
      <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/60 px-4 py-8 text-center">
        <Package className="mx-auto h-6 w-6 text-neutral-600" />
        <p className="mt-3 text-sm text-neutral-300">{hint}</p>
        <p className="mt-1 text-xs text-neutral-600">o pegá la URL abajo</p>
      </div>
      <input
        type="text"
        placeholder="URL"
        value={value}
        onChange={(e) => onUrlChange(e.target.value)}
        className="mt-2 w-full border-b border-neutral-600 bg-transparent py-1.5 text-sm text-white placeholder:text-neutral-600 focus:border-copper focus:outline-none"
      />
    </div>
  )
}

// El id/nombre del tipo de atributo "Color" tal como vive en tu base de
// datos. Ajusta este string si en tu tabla tipo_atributo el id real es
// distinto (por ejemplo, si guardaste "Color" en vez de "color").
const COLOR_TYPE_ID = 'color'

function isColorType(typeId) {
  return typeId?.toLowerCase() === COLOR_TYPE_ID
}

let variantSeq = 0
function newVariant() {
  variantSeq += 1
  return {
    key: `new-${variantSeq}`,
    sku: '', name: `Variante_${variantSeq}`, model3d: '', thumbnail: '',
    imgs: [''], price: '', top: false, enabled: true,
    instanceParamsJson: '{}', attribIds: [], attribValues: {},
  }
}

function variantToRequest(v) {
  return {
    sku: v.sku.trim(),
    name: v.name.trim(),
    model_3d: v.model3d.trim(),
    thumbnail: v.thumbnail.trim(),
    imgs: v.imgs.map((s) => s.trim()).filter(Boolean),
    price: Number(v.price),
    top: v.top,
    enabled: v.enabled,
    instance_params: JSON.parse(v.instanceParamsJson || '{}'),
    atribs: v.attribIds.map((id) => ({ id, value: v.attribValues[id].trim() })),
  }
}

export default function AdminProductFormPage() {
  const { model: routeModel } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(routeModel)

  const [categories, setCategories] = useState([])
  const [attributes, setAttributes] = useState([])
  const [attributeTypes, setAttributeTypes] = useState([])

  // Formulario transitorio para agregar un atributo a la variante seleccionada.
  const [addAttrTypeId, setAddAttrTypeId] = useState('')
  const [addAttrId, setAddAttrId]         = useState('')
  const [addAttrValue, setAddAttrValue]   = useState('')

  const [loading, setLoading] = useState(isEdit)
  const [error, setError]     = useState(null)

  const [product, setProduct] = useState({
    model: '', description: '', enable: true,
    ancho: '', alto: '', profundidad: '',
    categoryId: '',
  })
  const [variants, setVariants] = useState([newVariant()])
  const [selected, setSelected] = useState(null) // null = producto, si no índice de variants

  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Todos los ids de atributo que pertenecen al tipo Color (puede haber
  // varios: "Morado", "Rojo", etc.) — se usa para saber cuáles hay que
  // quitar cuando se agrega un color nuevo, y para pintar el swatch en
  // los chips de abajo.
  const colorAttributeIds = new Set(
    attributes.filter((a) => isColorType(a.atribType?.id)).map((a) => a.id)
  )
//en este useEffect se cargan todos los datos que se necesitan para crear el producto 
  useEffect(() => {
    let cancelled = false
    async function loadRefs() {
      try {
        const [catsRes, attrsRes, typesRes] = await Promise.all([
          getCategories(),
          getAttributes({ limit: 200 }),
          getAttributeTypes({ limit: 200 }),
        ])
        if (!cancelled) {
          setCategories(Array.isArray(catsRes) ? catsRes : [])
          setAttributes(Array.isArray(attrsRes) ? attrsRes : [])
          setAttributeTypes(Array.isArray(typesRes) ? typesRes : [])
        }
      } catch { /* selectores quedan vacíos si falla */ }
    }
    loadRefs()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    async function loadProduct() {
      try {
        const full = await getProduct(routeModel)
        if (cancelled) return
        setProduct({
          model: full.model ?? '',
          description: full.description ?? '',
          enable: full.enable !== false,
          ancho: full.dimensions?.ancho ?? '',
          alto: full.dimensions?.alto ?? '',
          profundidad: full.dimensions?.profundidad ?? '',
          categoryId: full.categories?.[0]?.id ?? '',
        })
        const loadedVariants = (full.variations ?? []).map((v) => ({
          key: v.sku,
          sku: v.sku ?? '', name: v.name ?? '', model3d: v.model_3d ?? '', thumbnail: v.thumbnail ?? '',
          imgs: v.imgs?.length ? v.imgs : [''], price: v.price ?? '', top: v.top ?? false, enabled: v.enabled ?? true,
          instanceParamsJson: JSON.stringify(v.instance_params ?? {}, null, 2),
          attribIds: (v.atribs ?? []).map((a) => a.id),
          attribValues: Object.fromEntries((v.atribs ?? []).map((a) => [a.id, a.value])),
        }))
        setVariants(loadedVariants.length ? loadedVariants : [newVariant()])
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadProduct()
    return () => { cancelled = true }
  }, [isEdit, routeModel])

  function updateVariant(i, patch) {
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, ...patch } : v))
  }

  function addVariant() {
    setVariants((prev) => [...prev, newVariant()])
    selectPane(variants.length)
  }

  function removeVariant(i) {
    if (variants.length <= 1) return
    setVariants((prev) => prev.filter((_, idx) => idx !== i))
    if (selected === i) selectPane(null)
    else if (typeof selected === 'number' && selected > i) selectPane(selected - 1)
  }

  // Cambia qué panel está seleccionado y limpia el mini-formulario de "agregar atributo"
  // (en vez de reaccionar al cambio con un efecto, se resetea en el mismo lugar que lo dispara).
  function selectPane(value) {
    setSelected(value)
    setAddAttrTypeId('')
    setAddAttrId('')
    setAddAttrValue('')
  }

  function handleAddAttrib() {
    if (!addAttrTypeId || !addAttrId || !addAttrValue.trim() || typeof selected !== 'number') return
    const v = variants[selected]

    let nextAttribIds = v.attribIds
    const nextAttribValues = { ...v.attribValues }

    if (isColorType(addAttrTypeId)) {
      // Único color por variante: primero se quita cualquier atributo de
      // tipo Color que ya estuviera asignado (aunque fuera un color
      // distinto, ej. "Rojo"), y recién después se agrega el nuevo.
      nextAttribIds = nextAttribIds.filter((id) => !colorAttributeIds.has(id))
      colorAttributeIds.forEach((id) => delete nextAttribValues[id])
    }

    nextAttribIds = nextAttribIds.includes(addAttrId) ? nextAttribIds : [...nextAttribIds, addAttrId]
    nextAttribValues[addAttrId] = addAttrValue.trim()

    updateVariant(selected, { attribIds: nextAttribIds, attribValues: nextAttribValues })
    setAddAttrTypeId('')
    setAddAttrId('')
    setAddAttrValue('')
  }

  function removeAttrib(i, id) {
    const v = variants[i]
    const attribValues = { ...v.attribValues }
    delete attribValues[id]
    updateVariant(i, { attribIds: v.attribIds.filter((a) => a !== id), attribValues })
  }

  function updateImg(i, imgIdx, value) {
    updateVariant(i, { imgs: variants[i].imgs.map((s, idx) => idx === imgIdx ? value : s) })
  }

  function addImgField(i) {
    updateVariant(i, { imgs: [...variants[i].imgs, ''] })
  }

  function removeImgField(i, imgIdx) {
    updateVariant(i, { imgs: variants[i].imgs.filter((_, idx) => idx !== imgIdx) })
  }

  async function handleSave() {
    if (!product.model.trim())       { setSaveError('El nombre del producto es requerido.'); selectPane(null); return }
    if (!product.description.trim()) { setSaveError('La descripción es requerida.'); selectPane(null); return }
    if (!product.ancho || !product.alto || !product.profundidad) {
      setSaveError('Las 3 dimensiones son requeridas.'); selectPane(null); return
    }
    if (!product.categoryId) { setSaveError('Seleccioná una categoría.'); selectPane(null); return }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i]
      const issues = []

      if (!v.sku.trim())       issues.push('el SKU')
      if (!v.name.trim())      issues.push('el nombre')
      if (!v.model3d.trim())   issues.push('la URL del modelo 3D')
      if (!v.thumbnail.trim()) issues.push('la URL de la miniatura')
      if (!v.price)            issues.push('el precio')
      if (v.imgs.map((s) => s.trim()).filter(Boolean).length === 0) issues.push('al menos una imagen adicional')

      if (v.attribIds.length === 0) {
        issues.push('al menos un atributo')
      } else if (v.attribIds.some((id) => !v.attribValues[id]?.trim())) {
        issues.push('el valor de cada atributo seleccionado')
      }

      let instanceParamsOk = true
      try {
        const parsed = JSON.parse(v.instanceParamsJson || '{}')
        if (typeof parsed !== 'object' || parsed === null || Object.keys(parsed).length === 0) instanceParamsOk = false
      } catch {
        instanceParamsOk = false
      }
      if (!instanceParamsOk) issues.push('los parámetros de instanciación (JSON válido y no vacío)')

      if (issues.length > 0) {
        setSaveError(`Variante ${i + 1}: falta completar ${issues.join(', ')}.`)
        selectPane(i)
        return
      }
    }

    // El <select> siempre da el value como string, pero el id de categoría del
    // backend es numérico — hay que comparar como string para que matchee.
    const cat = categories.find((c) => String(c.id) === String(product.categoryId))
    const payload = {
      model: product.model.trim(),
      description: product.description.trim(),
      enable: product.enable,
      dimensions: { ancho: Number(product.ancho), alto: Number(product.alto), profundidad: Number(product.profundidad) },
      categories: cat ? [{ id: cat.id, name: cat.name }] : [],
      variations: variants.map(variantToRequest),
    }

    setSaving(true)
    setSaveError(null)
    try {
      if (isEdit) {
        await updateProduct(routeModel, payload)
      } else {
        await createProduct(payload)
      }
      navigate('/view/inventory')
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="">
        <p className="py-16 text-center text-sm text-neutral-500">Cargando...</p>
      </AdminLayout>
    )
  }

  const selectedVariant = typeof selected === 'number' ? variants[selected] : null

  return (
    <AdminLayout title="">

      <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-copper-light">Gestión de Catálogo</p>
          <h1 className="mt-2 font-display text-5xl text-white">{isEdit ? 'Editar Producto' : 'Crear Producto'}</h1>
          <p className="mt-4 max-w-xl text-sm text-neutral-400">
            Perfecciona la presencia digital de tus muebles. Asegúrate de que el modelo AR,
            las dimensiones y los metadatos visuales sean precisos para mantener nuestros estándares.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => navigate('/view/inventory')}
            className="rounded-full border border-neutral-700 px-5 py-2.5 text-sm text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
          >
            Descartar
          </button>
          <button
            onClick={addVariant}
            className="rounded-full bg-neutral-800 px-5 py-2.5 text-sm text-copper-light transition-colors hover:bg-neutral-700"
          >
            Agregar Variante
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-copper px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Producto'}
            {!saving && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">

        {/* ── Lista de variantes ── */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => selectPane(null)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              selected === null ? 'border-copper bg-copper/10' : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-600'
            }`}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Producto</p>
            <p className="mt-1 truncate text-sm font-medium text-white">{product.model || 'Sin nombre'}</p>
          </button>

          {variants.map((v, i) => (
            <div
              key={v.key}
              className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                selected === i ? 'border-copper bg-copper/10' : 'border-neutral-800 bg-neutral-800/40'
              }`}
            >
              <button onClick={() => selectPane(i)} className="min-w-0 flex-1 text-left">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Variante</p>
                <p className="mt-1 truncate text-sm font-medium text-white">{v.name || `Variante_${i + 1}`}</p>
              </button>
              {variants.length > 1 && (
                <button
                  onClick={() => removeVariant(i)}
                  className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-red-900/30 hover:text-red-400"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── Panel de detalle ── */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-800/40 p-8">
          {selectedVariant ? (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">

              {/* Contexto del producto + archivos de la variante */}
              <div className="flex flex-col gap-6">
                <button
                  type="button"
                  onClick={() => updateVariant(selected, { enabled: !selectedVariant.enabled })}
                  title={selectedVariant.enabled ? 'Variante habilitada (click para deshabilitar)' : 'Variante deshabilitada (click para habilitar)'}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    selectedVariant.enabled ? 'bg-copper text-white' : 'bg-neutral-700 text-neutral-400'
                  }`}
                >
                  <Check className="h-4 w-4" />
                </button>

                <div>
                  <h3 className="font-display text-2xl text-white">{product.model || 'Producto sin nombre'}</h3>
                  <p className="mt-3 text-sm text-neutral-400">{product.description || 'Sin descripción.'}</p>
                </div>

                <DropZone
                  label="Miniatura"
                  hint="Suelta tu miniatura .jpg o .png aquí"
                  value={selectedVariant.thumbnail}
                  onUrlChange={(url) => updateVariant(selected, { thumbnail: url })}
                />

                <DropZone
                  label="Modelo"
                  hint="Suelta tu modelo .glb o .gltf aquí"
                  value={selectedVariant.model3d}
                  onUrlChange={(url) => updateVariant(selected, { model3d: url })}
                />

                <div className="flex flex-col gap-2">
                  {selectedVariant.imgs.map((url, imgIdx) => (
                    <div key={imgIdx} className="flex items-center gap-2">
                      <ModalInput placeholder="URL de imagen adicional" value={url} onChange={(e) => updateImg(selected, imgIdx, e.target.value)} />
                      {selectedVariant.imgs.length > 1 && (
                        <button type="button" onClick={() => removeImgField(selected, imgIdx)} className="shrink-0 text-xs text-neutral-500 hover:text-red-400">
                          Quitar
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addImgField(selected)} className="self-start text-xs text-copper-light hover:opacity-80">
                    + Agregar imagen
                  </button>
                </div>
              </div>

              {/* Datos de la variante */}
              <div className="flex flex-col gap-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <input
                      type="text"
                      value={selectedVariant.name}
                      onChange={(e) => updateVariant(selected, { name: e.target.value })}
                      placeholder={`Variante_${selected + 1}`}
                      className="font-display w-full bg-transparent text-2xl text-white placeholder:text-neutral-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={selectedVariant.sku}
                      onChange={(e) => updateVariant(selected, { sku: e.target.value })}
                      placeholder="SKU (ej: SOF-SIE-001)"
                      className="mt-1 w-full bg-transparent text-xs text-neutral-500 placeholder:text-neutral-600 focus:outline-none"
                    />
                  </div>
                  <ModalCheckbox label="Destacada (top)" checked={selectedVariant.top} onChange={(e) => updateVariant(selected, { top: e.target.checked })} />
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                  <ModalField label="Tipo Atributo">
                    <ModalSelect
                      value={addAttrTypeId}
                      onChange={(e) => { setAddAttrTypeId(e.target.value); setAddAttrId(''); setAddAttrValue('') }}
                    >
                      <option value="">Seleccioná un tipo</option>
                      {attributeTypes.map((t) => (
                        <option key={t.id} value={t.id}>{t.id}</option>
                      ))}
                    </ModalSelect>
                  </ModalField>
                  <ModalField label="Atributo">
                    <ModalSelect value={addAttrId} onChange={(e) => setAddAttrId(e.target.value)}>
                      <option value="">Seleccioná un atributo</option>
                      {attributes.filter((a) => a.atribType?.id === addAttrTypeId).map((a) => (
                        <option key={a.id} value={a.id}>{a.id}</option>
                      ))}
                    </ModalSelect>
                  </ModalField>
                </div>

                {isColorType(addAttrTypeId) ? (
                  <ModalField label="Valor del Color">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={addAttrValue || '#000000'}
                        onChange={(e) => setAddAttrValue(e.target.value)}
                        className="h-9 w-14 cursor-pointer rounded-lg border border-neutral-700 bg-transparent"
                      />
                      <span className="text-xs text-neutral-400">
                        {addAttrValue || 'Elegí un color'}
                      </span>
                    </div>
                  </ModalField>
                ) : (
                  <ModalField label="Nombre (valor del atributo)">
                    <ModalInput placeholder="Ej: Roble" value={addAttrValue} onChange={(e) => setAddAttrValue(e.target.value)} />
                  </ModalField>
                )}

                <button
                  type="button"
                  onClick={handleAddAttrib}
                  disabled={!addAttrTypeId || !addAttrId || !addAttrValue.trim()}
                  className="self-start rounded-full border border-copper px-4 py-1.5 text-xs text-copper-light transition-colors hover:bg-copper/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  + Agregar atributo
                </button>

                {selectedVariant.attribIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.attribIds.map((id) => (
                      <span key={id} className="flex items-center gap-1.5 rounded-full border border-copper/40 bg-copper/10 px-3 py-1 text-xs text-copper-light">
                        {colorAttributeIds.has(id) && (
                          <span
                            className="h-3 w-3 rounded-full border border-white/20"
                            style={{ backgroundColor: selectedVariant.attribValues[id] }}
                          />
                        )}
                        {id}
                        <button type="button" onClick={() => removeAttrib(selected, id)} className="hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                )}

                <ModalField label="Precio (L.)">
                  <ModalInput placeholder="Ej: 1250" value={selectedVariant.price} onChange={(e) => updateVariant(selected, { price: e.target.value })} />
                </ModalField>

                <details>
                  <summary className="cursor-pointer text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    Parámetros de instanciación AR (avanzado)
                  </summary>
                  <div className="mt-3">
                    <ModalTextarea
                      placeholder='{ "escala": 1 }'
                      value={selectedVariant.instanceParamsJson}
                      onChange={(e) => updateVariant(selected, { instanceParamsJson: e.target.value })}
                      rows={3}
                    />
                  </div>
                </details>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl text-white">Información del Producto</h2>

              <div className="mt-8 flex flex-col gap-8">
                <ModalField label="Nombre">
                  <ModalInput placeholder="Ej: Nordic Lounge Chair" value={product.model} onChange={(e) => setProduct((p) => ({ ...p, model: e.target.value }))} />
                </ModalField>

                <ModalField label="Categoría">
                  <ModalSelect value={product.categoryId} onChange={(e) => setProduct((p) => ({ ...p, categoryId: e.target.value }))}>
                    <option value="">Seleccioná una categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </ModalSelect>
                </ModalField>

                <ModalField label="Estado">
                  <ModalCheckbox label="Producto habilitado" checked={product.enable} onChange={(e) => setProduct((p) => ({ ...p, enable: e.target.checked }))} />
                </ModalField>

                <ModalField label="Dimensiones Técnicas (cm)">
                  <div className="grid grid-cols-3 gap-4">
                    <DimensionBox label="Ancho" value={product.ancho} onChange={(e) => setProduct((p) => ({ ...p, ancho: e.target.value }))} />
                    <DimensionBox label="Alto" value={product.alto} onChange={(e) => setProduct((p) => ({ ...p, alto: e.target.value }))} />
                    <DimensionBox label="Profundidad" value={product.profundidad} onChange={(e) => setProduct((p) => ({ ...p, profundidad: e.target.value }))} />
                  </div>
                </ModalField>

                <ModalField label="Descripción">
                  <ModalTextarea placeholder="Descripción del producto..." value={product.description} onChange={(e) => setProduct((p) => ({ ...p, description: e.target.value }))} />
                </ModalField>
              </div>
            </>
          )}

          {saveError && (
            <p className="mt-8 text-sm text-red-400">{saveError}</p>
          )}
        </div>
      </div>

    </AdminLayout>
  )
}
