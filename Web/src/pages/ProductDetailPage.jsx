import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProduct, getProductAuth, getAttributes } from '../services/productService'
import {
  getOrCreateFavoritesCollection,
  addProductToCollection,
  removeProductFromCollection,
} from '../services/collectionService'
import Figure from '../components/ui/Figure'
import { Heart, ArrowLeft } from '../components/ui/icons'

export default function ProductDetailPage() {
  const { model } = useParams()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct]           = useState(null)
  const [attributesFull, setAttributesFull] = useState([])
  const [variationIndex, setVariationIndex] = useState(0)
  const [showVariants, setShowVariants]     = useState(false)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  const [favoritesId, setFavoritesId] = useState(null)
  const [favorited, setFavorited]     = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        // Con sesión se pide la variante /token del endpoint: es la única que el
        // backend deja consultar con un token de Cliente, y además devuelve
        // `isInCollection` para saber si ya está en favoritos.
        const fetchProduct = isAuthenticated ? getProductAuth : getProduct
        const [prod, attrs] = await Promise.all([
          fetchProduct(model),
          getAttributes({ limit: 200 }).catch(() => []),
        ])
        if (cancelled) return
        setProduct(prod)
        setAttributesFull(Array.isArray(attrs) ? attrs : [])
        setVariationIndex(0)
        setFavorited(prod?.isInCollection === true)
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [model, isAuthenticated])

  async function toggleFavorite() {
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      let favId = favoritesId
      if (!favId) {
        const col = await getOrCreateFavoritesCollection()
        favId = col.id
        setFavoritesId(favId)
      }
      if (favorited) {
        await removeProductFromCollection(favId, model)
      } else {
        await addProductToCollection(favId, model)
      }
      setFavorited((f) => !f)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <p className="py-32 text-center text-sm text-muted">Cargando...</p>
  }
  if (error || !product) {
    return (
      <div className="mx-auto max-w-[900px] px-6 pb-24 pt-32 text-center md:px-10">
        <p className="text-sm text-red-400">{error ?? 'Producto no encontrado.'}</p>
      </div>
    )
  }

  const variation = product.variations?.[variationIndex]

  // Agrupa los atributos de la variación por su tipo (MATERIAL, COLOR, etc.)
  const attrTypeById = Object.fromEntries(attributesFull.map((a) => [a.id, a.atribType?.id]))
  const specsByType = {}
  for (const atrib of variation?.atribs ?? []) {
    const type = attrTypeById[atrib.id] ?? 'Otro'
    specsByType[type] = specsByType[type] ? [...specsByType[type], atrib.value] : [atrib.value]
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 pb-24 pt-32 md:px-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="mt-8 flex justify-center">
        <div className="w-full max-w-md">
          <div className="relative">
            <Figure src={variation?.thumbnail} tone="dark" alt={variation?.name} className="aspect-[4/5]" />
            <button
              onClick={toggleFavorite}
              aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
            >
              <Heart className={`h-4 w-4 ${favorited ? 'text-copper-light' : 'text-ink-soft'}`} filled={favorited} />
            </button>
          </div>

          {variation?.imgs?.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {variation.imgs.slice(0, 2).map((url, i) => (
                <Figure key={i} src={url} tone="stone" className="aspect-square" />
              ))}
            </div>
          )}

          {product.variations?.length > 1 && (
            <div className="mt-6">
              <button
                onClick={() => setShowVariants((s) => !s)}
                className="w-full rounded-full bg-copper-gradient px-6 py-3 text-center text-sm font-medium text-white"
              >
                Variantes de objeto
              </button>
              {showVariants && (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {product.variations.map((v, i) => (
                    <button
                      key={v.sku}
                      onClick={() => setVariationIndex(i)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        i === variationIndex
                          ? 'border-copper text-copper-light'
                          : 'border-line-strong text-muted hover:text-ink'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h1 className="font-display text-4xl text-ink">{variation?.name ?? product.model}</h1>
        <p className="mt-2 text-xl text-copper-light">
          {variation?.price != null ? `L. ${Number(variation.price).toLocaleString('es-HN')}` : '—'}
        </p>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">{product.description}</p>

        <div className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-faint">Especificaciones</p>
          <dl className="mt-4 grid grid-cols-[140px_1fr] gap-y-3 text-sm">
            {Object.entries(specsByType).map(([type, values]) => (
              <div className="contents" key={type}>
                <dt className="text-muted">{type}</dt>
                <dd className="text-ink">{values.join(', ')}</dd>
              </div>
            ))}
            <div className="contents">
              <dt className="text-muted">Dimensiones</dt>
              <dd className="text-ink">
                Ancho: {product.dimensions?.ancho}cm · Profundidad: {product.dimensions?.profundidad}cm · Alto: {product.dimensions?.alto}cm
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}