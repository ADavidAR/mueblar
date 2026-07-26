import request from './request'

const FAVORITES_TITLE = 'Favoritos'

export const getCollections = ({ limit, page, search } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined) params.set('limit', limit)
  if (page !== undefined)  params.set('page', page)
  if (search)               params.set('search', search)
  const qs = params.toString()
  return request(`/api/collections${qs ? `?${qs}` : ''}`)
}

export const createCollection = (title) =>
  request('/api/collections', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })

export const addProductToCollection = (collectionId, model) =>
  request(`/api/collections/${collectionId}`, {
    method: 'POST',
    body: JSON.stringify({ model }),
  })

export const removeProductFromCollection = (collectionId, model) =>
  request(`/api/collections/${collectionId}/products/${encodeURIComponent(model)}`, {
    method: 'DELETE',
  })

// Busca la colección "Favoritos" del usuario; si no existe, la crea.
// GET /api/collections ya trae los productos de cada colección embebidos
// (con thumbnail/precio reales), así que no hace falta pedirlos aparte.
export async function getOrCreateFavoritesCollection() {
  const list = await getCollections({ limit: 50 })
  const collections = Array.isArray(list) ? list : []
  const existing = collections.find(
    (c) => c.title?.toLowerCase() === FAVORITES_TITLE.toLowerCase()
  )
  if (existing) return existing

  await createCollection(FAVORITES_TITLE)
  const refreshed = await getCollections({ limit: 50 })
  return (Array.isArray(refreshed) ? refreshed : []).find(
    (c) => c.title?.toLowerCase() === FAVORITES_TITLE.toLowerCase()
  )
}
