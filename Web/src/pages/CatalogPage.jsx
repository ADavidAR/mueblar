import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProducts, getProductsAuth } from '../services/productService'
import { getCategories } from '../services/categoryService'
import {
  getOrCreateFavoritesCollection,
  addProductToCollection,
  removeProductFromCollection,
} from '../services/collectionService'
import ProductCard from '../components/catalog/ProductCard'

const PAGE_SIZE = 9

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? 'border-copper bg-copper/15 text-copper-light'
          : 'border-line-strong text-muted hover:border-copper/50 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function CatalogPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const onlyFavorites = searchParams.get('favorites') === 'true'

  const [categories, setCategories]     = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [products, setProducts]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [page, setPage]                 = useState(0)
  const [hasMore, setHasMore]           = useState(true)
  const [favoritesId, setFavoritesId]   = useState(null)

  useEffect(() => {
    let cancelled = false
    getCategories()
      .then((res) => { if (!cancelled) setCategories(Array.isArray(res) ? res : []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Ver "Colecciones" sin sesión no tiene sentido: manda a login.
  useEffect(() => {
    if (onlyFavorites && !isAuthenticated) navigate('/login', { replace: true })
  }, [onlyFavorites, isAuthenticated, navigate])

  useEffect(() => {
    if (onlyFavorites && !isAuthenticated) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        if (onlyFavorites) {
          // GET /api/collections ya trae thumbnail/precio reales por producto,
          // así que no hace falta pedir nada más (y evita el endpoint con el bug
          // de /api/collections/{id}, que ignora el filtro por colección).
          const col = await getOrCreateFavoritesCollection()
          if (cancelled) return
          setFavoritesId(col.id)
          const all = col.products ?? []
          if (!cancelled) {
            setProducts(all.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE))
            setHasMore((page + 1) * PAGE_SIZE < all.length)
            setError(null)
          }
        } else {
          const fetcher = isAuthenticated ? getProductsAuth : getProducts
          const res = await fetcher({
            limit: PAGE_SIZE,
            page,
            categories: activeCategory ? [activeCategory] : undefined,
          })
          if (cancelled) return
          const list = Array.isArray(res) ? res : []
          setProducts(list)
          setHasMore(list.length >= PAGE_SIZE)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setProducts([])
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page, activeCategory, isAuthenticated, onlyFavorites])

  function toggleFavoritesView(next) {
    setPage(0)
    setActiveCategory(null)
    setSearchParams(next ? { favorites: 'true' } : {})
  }

  async function toggleFavorite(model, currentlyFav) {
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      let favId = favoritesId
      if (!favId) {
        const col = await getOrCreateFavoritesCollection()
        favId = col.id
        setFavoritesId(favId)
      }
      if (currentlyFav) {
        await removeProductFromCollection(favId, model)
      } else {
        await addProductToCollection(favId, model)
      }
      setProducts((prev) =>
        onlyFavorites
          ? prev.filter((p) => p.model !== model)
          : prev.map((p) => p.model === model ? { ...p, isInCollection: !currentlyFav } : p)
      )
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-24 pt-36 md:px-10">
      {onlyFavorites ? (
        <>
          <p className="text-xs uppercase tracking-[0.25em] text-copper">Coleccion:</p>
          <h1 className="mt-1 font-display text-5xl text-ink">FAVORITOS</h1>
        </>
      ) : (
        <>
          <h1 className="font-display text-5xl text-ink">Catalogo</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            Curaduría exclusiva de piezas arquitectónicas listas para integrarse a tu espacio
            a través de Realidad Aumentada.
          </p>
        </>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div className="flex flex-wrap gap-2">
          {!onlyFavorites && (
            <>
              <Chip active={activeCategory === null} onClick={() => { setActiveCategory(null); setPage(0) }}>
                Todas
              </Chip>
              {categories.map((c) => (
                <Chip
                  key={c.id}
                  active={activeCategory === c.name}
                  onClick={() => { setActiveCategory(c.name); setPage(0) }}
                >
                  {c.name}
                </Chip>
              ))}
            </>
          )}
          {isAuthenticated && (
            <Chip active={onlyFavorites} onClick={() => toggleFavoritesView(!onlyFavorites)}>
              {onlyFavorites ? '← Ver todo el catálogo' : 'Solo mis favoritos'}
            </Chip>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-900/20 px-4 py-2 text-sm text-red-400">{error}</p>
      )}

      {loading ? (
        <p className="py-24 text-center text-sm text-muted">Cargando...</p>
      ) : products.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted">
          {onlyFavorites ? 'Todavía no guardaste ningún producto en Favoritos.' : 'No hay productos en este catálogo.'}
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p.model}
              model={p.model}
              name={p.variations?.[0]?.name ?? p.model}
              category={onlyFavorites ? undefined : p.categories?.map((c) => c.name).join(', ')}
              price={p.variations?.[0]?.price ?? null}
              thumbnail={p.variations?.[0]?.thumbnail}
              favorited={onlyFavorites ? true : p.isInCollection === true}
              onToggleFavorite={() => toggleFavorite(p.model, onlyFavorites ? true : p.isInCollection === true)}
            />
          ))}
        </div>
      )}

      <div className="mt-16 flex items-center justify-center gap-4 text-sm">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="uppercase tracking-[0.15em] text-muted transition-colors hover:text-ink disabled:opacity-30"
        >
          ‹ Anterior
        </button>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-copper text-copper-light">
          {page + 1}
        </span>
        <button
          disabled={!hasMore}
          onClick={() => setPage((p) => p + 1)}
          className="uppercase tracking-[0.15em] text-muted transition-colors hover:text-ink disabled:opacity-30"
        >
          Siguiente ›
        </button>
      </div>
    </div>
  )
}
