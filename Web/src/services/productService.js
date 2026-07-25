import request from './request'

// ── Productos ──────────────────────────────────────────────────────────────

export const getProducts = ({ limit, offset, category } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined)    params.set('limit', limit)
  if (offset !== undefined)   params.set('offset', offset)
  if (category)               params.set('category', category)
  const qs = params.toString()
  return []//request (`/api/products`)//(`/api/products${qs ? `?${qs}` : ''}`)
}

export const searchProducts = (q) =>
  request(`/api/products/search?search=${encodeURIComponent(q)}`)

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

export const getAttributeTypes = ({ limit, offset } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined)  params.set('limit', limit)
  if (offset !== undefined) params.set('offset', offset)
  const qs = params.toString()
  return request (`/api/attribute-types${qs ? `?${qs}` : ''}`)
}

export const createAttributeType = (payload) =>
  request('/api/attribute-types', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateAttributeType = (id,payload) =>
  request(`/api/attribute-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  export const deleteAttributeType = (id,payload) =>
  request(`/api/attribute-types/${id}`, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  })
  

// ── Atributos ──────────────────────────────────────────────────────────────

export const getAttributes = ({ limit, offset } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined)  params.set('limit', limit)
  if (offset !== undefined) params.set('offset', offset)
  const qs = params.toString()
  return []//request(`/api/attributes${qs ? `?${qs}` : ''}`)
}

export const createAttribute = (payload) =>
  request('/api/attributes/add', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
