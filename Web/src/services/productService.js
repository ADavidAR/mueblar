import request from './request'

// ── Productos ──────────────────────────────────────────────────────────────

/**
 * Obtiene el listado público de productos del catálogo, paginado y con filtros opcionales.
 *
 * @param {object} [params] opciones de consulta
 * @param {number} [params.limit] cantidad de productos por página
 * @param {number} [params.page] número de página (no offset de filas)
 * @param {string[]} [params.categories] nombres de categorías a filtrar
 * @param {string} [params.search] texto de búsqueda
 * @param {string[]} [params.materials] nombres de materiales a filtrar
 * @returns {Promise<object[]>} lista de productos
 */
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

/**
 * Igual que `getProducts`, pero requiere sesión: el backend agrega `isInCollection`
 * a cada producto según si el usuario logueado ya lo tiene guardado en alguna colección.
 *
 * @param {object} [params] mismas opciones de consulta que `getProducts`
 * @returns {Promise<object[]>} lista de productos con el campo `isInCollection`
 */
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

/**
 * Obtiene el detalle completo de un producto (versión pública, sin sesión).
 *
 * @param {string} model identificador del producto (modelo)
 * @returns {Promise<object>} datos del producto y sus variaciones
 */
export const getProduct = (model) =>
  request(`/api/products/${encodeURIComponent(model)}`)

/**
 * Igual que `getProduct`, pero requiere sesión: el backend agrega `isInCollection`
 * según si el usuario logueado ya tiene el producto guardado en alguna colección.
 *
 * @param {string} model identificador del producto (modelo)
 * @returns {Promise<object>} datos del producto, sus variaciones y el campo `isInCollection`
 */
export const getProductAuth = (model) =>
  request(`/api/products/${encodeURIComponent(model)}/token`)

/**
 * Crea un nuevo producto en el catálogo junto con sus variaciones.
 *
 * @param {object} payload datos del producto y sus variaciones
 * @returns {Promise<any>} respuesta del backend
 */
export const createProduct = (payload) =>
  request('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

/**
 * Actualiza un producto existente y sus variaciones.
 *
 * @param {string} model identificador del producto a modificar
 * @param {object} payload nuevos datos del producto y sus variaciones
 * @returns {Promise<any>} respuesta del backend
 */
export const updateProduct = (model, payload) =>
  request(`/api/products/${encodeURIComponent(model)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/**
 * Elimina un producto del catálogo.
 *
 * @param {string} model identificador del producto a eliminar
 * @returns {Promise<any>} respuesta del backend
 */
export const deleteProduct = (model) =>
  request(`/api/products/${encodeURIComponent(model)}`, { method: 'DELETE' })

// ── Tipos de Atributo ──────────────────────────────────────────────────────

/**
 * Obtiene el listado de tipos de atributo, paginado.
 *
 * @param {object} [params] opciones de consulta
 * @param {number} [params.limit] cantidad de resultados por página
 * @param {number} [params.page] número de página
 * @returns {Promise<object[]>} lista de tipos de atributo
 */
export const getAttributeTypes = ({ limit, page } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined) params.set('limit', limit)
  if (page !== undefined)  params.set('page', page)
  const qs = params.toString()
  return request(`/api/attribute-types${qs ? `?${qs}` : ''}`)
}

/**
 * Crea un nuevo tipo de atributo.
 *
 * @param {{id: string, description: string}} payload id y descripción del tipo de atributo (ambos obligatorios en el backend)
 * @returns {Promise<any>} respuesta del backend
 */
export const createAttributeType = (payload) =>
  request('/api/attribute-types', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

/**
 * Actualiza un tipo de atributo existente.
 *
 * @param {string} id identificador del tipo de atributo a modificar
 * @param {{id: string, description: string}} payload nuevos datos del tipo de atributo
 * @returns {Promise<any>} respuesta del backend
 */
export const updateAttributeType = (id, payload) =>
  request(`/api/attribute-types/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/**
 * Elimina un tipo de atributo.
 *
 * @param {string} id identificador del tipo de atributo a eliminar
 * @returns {Promise<any>} respuesta del backend
 */
export const deleteAttributeType = (id) =>
  request(`/api/attribute-types/${encodeURIComponent(id)}`, { method: 'DELETE' })

// ── Atributos ──────────────────────────────────────────────────────────────

/**
 * Obtiene el listado de atributos, paginado. El backend pagina con `{ limit, page }`
 * (número de página), no con offset de filas.
 *
 * @param {object} [params] opciones de consulta
 * @param {number} [params.limit] cantidad de resultados por página
 * @param {number} [params.page] número de página
 * @returns {Promise<object[]>} lista de atributos
 */
export const getAttributes = ({ limit, page } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined) params.set('limit', limit)
  if (page !== undefined)  params.set('page', page)
  const qs = params.toString()
  return request(`/api/attributes${qs ? `?${qs}` : ''}`)
}

/**
 * Crea un nuevo atributo asociado a un tipo de atributo existente.
 *
 * @param {{name: string, atribType: {id: string}}} payload nombre del atributo y el tipo al que pertenece
 * @returns {Promise<any>} respuesta del backend
 */
export const createAttribute = (payload) =>
  request('/api/attribute', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

/**
 * Actualiza un atributo existente.
 *
 * @param {string} id identificador del atributo a modificar
 * @param {{name: string, atribType: {id: string}}} payload nuevos datos del atributo
 * @returns {Promise<any>} respuesta del backend
 */
export const updateAttribute = (id, payload) =>
  request(`/api/attributes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/**
 * Elimina un atributo.
 *
 * @param {string} id identificador del atributo a eliminar
 * @returns {Promise<any>} respuesta del backend
 */
export const deleteAttribute = (id) =>
  request(`/api/attributes/${encodeURIComponent(id)}`, { method: 'DELETE' })