import products from './products.json'

/**
 * Mock local de /api/collections para trabajar sin backend. Mantiene un
 * "DB" mutable en memoria (se resetea al recargar la app) y expone una
 * función por endpoint real, con la misma forma de datos que documenta
 * services/collectionsService.js.
 */

let nextId = 2
const DB = [
    {
        id: 1,
        title: 'Favoritos',
        borrable: false,
        products: [{ model: 'Nordic Comfort XL' }, { model: 'ErgoTask Pro' }],
    },
]

const delay = (value, ms = 150) => new Promise((resolve) => setTimeout(() => resolve(value), ms))

const findProduct = (model) => products.find((p) => p.model === model)
const topVariation = (product) => product?.variations.find((v) => v.top) ?? product?.variations[0]

export const mockFetchCollections = () =>
    delay(DB.map((c) => ({ ...c, products: [...c.products] })))

// Devuelve los productos de una colección ya resueltos contra el catálogo,
// con el thumbnail de la variación top — lo que necesita CollectionSection
// para pintar las miniaturas sin volver a tocar CollectionsContext.
export const mockFetchCollectionProduct = (id_collection) => {
    const collection = DB.find((c) => c.id === id_collection)
    if (!collection) return delay([])

    const resolved = collection.products
        .map(({ model }) => {
            const product = findProduct(model)
            const variation = topVariation(product)
            if (!product || !variation) return null
            return {
                model,
                name: product.model,
                thumbnail: variation.thumbnail,
                price: variation.price,
            }
        })
        .filter(Boolean)

    return delay(resolved)
}

export const mockCreateCollection = (title) => {
    const collection = { id: nextId++, title, borrable: true, products: [] }
    DB.push(collection)
    return delay(collection)
}

export const mockAddProductToCollection = (id_collection, model) => {
    const collection = DB.find((c) => c.id === id_collection)
    if (collection && !collection.products.some((p) => p.model === model)) {
        collection.products.push({ model })
    }
    return delay(collection)
}

export const mockDeleteProductFromCollection = (id_collection, model) => {
    const collection = DB.find((c) => c.id === id_collection)
    if (collection) {
        collection.products = collection.products.filter((p) => p.model !== model)
    }
    return delay(collection)
}

export const mockUpdateCollectionTitle = (id_collection, title) => {
    const collection = DB.find((c) => c.id === id_collection)
    if (collection) collection.title = title
    return delay(collection)
}

export const mockDeleteCollection = (id_collection) => {
    const index = DB.findIndex((c) => c.id === id_collection)
    if (index !== -1) DB.splice(index, 1)
    return delay(true)
}
