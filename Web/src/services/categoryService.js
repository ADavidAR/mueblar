import request from './request'

// ── Categorías ─────────────────────────────────────────────────────────────

export const getCategories = () =>
  request('/api/categories')

export const createCategory = (name) =>
  request('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })

export const updateCategory = (id, name) =>
  request(`/api/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })

export const deleteCategory = (id) =>
  request(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
