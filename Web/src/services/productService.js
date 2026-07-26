import request from './request'

// ── Productos ──────────────────────────────────────────────────────────────

// page = número de página (no offset de filas). categories/materials son listas de nombres.
export const getProducts = ({ limit, page, categories, search, materials } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined) params.set('limit', limit)
  if (page !== undefined)  params.set('page', page)
  if (search)               params.set('search', search)
  categories?.forEach((c) => params.append('categories', c))
  materials?.forEach((m) => params.append('materials', m))
  const qs = params.toString()
  return request(`/api/products${qs ? `?${qs}` : ''}`)
}

// Igual que getProducts, pero requiere sesión: el backend agrega `isInCollection`
// por producto (si está guardado en alguna colección del usuario logueado).
export const getProductsAuth = ({ limit, page, categories, search, materials } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined) params.set('limit', limit)
  if (page !== undefined)  params.set('page', page)
  if (search)               params.set('search', search)
  categories?.forEach((c) => params.append('categories', c))
  materials?.forEach((m) => params.append('materials', m))
  const qs = params.toString()
  return request(`/api/products/token${qs ? `?${qs}` : ''}`)
}

export const getProduct = (model) =>
  request(`/api/products/${encodeURIComponent(model)}`)

export const createProduct = (payload) =>
  request('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateProduct = (model, payload) =>
  request(`/api/products/${encodeURIComponent(model)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteProduct = (model) =>
  request(`/api/products/${encodeURIComponent(model)}`, { method: 'DELETE' })

// ── Tipos de Atributo ──────────────────────────────────────────────────────

export const getAttributeTypes = ({ limit, page } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined) params.set('limit', limit)
  if (page !== undefined)  params.set('page', page)
  const qs = params.toString()
  return request(`/api/attribute-types${qs ? `?${qs}` : ''}`)
}

// payload: { id: string, description: string } — ambos campos son obligatorios en el backend
export const createAttributeType = (payload) =>
  request('/api/attribute-types', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

// payload: { id: string, description: string }
export const updateAttributeType = (id, payload) =>
  request(`/api/attribute-types/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteAttributeType = (id) =>
  request(`/api/attribute-types/${encodeURIComponent(id)}`, { method: 'DELETE' })

// ── Atributos ──────────────────────────────────────────────────────────────

// El backend pagina con { limit, page } (número de página), no con offset.
export const getAttributes = ({ limit, page } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined) params.set('limit', limit)
  if (page !== undefined)  params.set('page', page)
  const qs = params.toString()
  return request(`/api/attributes${qs ? `?${qs}` : ''}`)
}

// payload: { name: string, atribType: { id: string } }
export const createAttribute = (payload) =>
  request('/api/attribute', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

// payload: { name: string, atribType: { id: string } }
export const updateAttribute = (id, payload) =>
  request(`/api/attributes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteAttribute = (id) =>
  request(`/api/attributes/${encodeURIComponent(id)}`, { method: 'DELETE' })
