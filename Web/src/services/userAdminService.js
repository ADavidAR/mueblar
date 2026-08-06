import request from './request'

// ── Usuarios (admin) ───────────────────────────────────────────────────────

export const getUsers = ({ limit, page, email, name } = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined) params.set('limit', limit)
  if (page !== undefined)  params.set('page', page)
  if (email)                params.set('email', email)
  if (name)            params.set('name', name)
  
 
  const qs = params.toString()
  return request(`/api/users${qs ? `?${qs}` : ''}`)
}

export const searchUsers = (q) =>
  request(`/api/users/search?search=${encodeURIComponent(q)}`)

export const getUser = (id) =>
  request(`/api/users/${id}`)

export const createUser = (payload) =>
  request('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateUser = (id, payload) =>
  request(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteUser = (id) =>
  request(`/api/users/${id}`, { method: 'DELETE' })
