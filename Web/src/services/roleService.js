import request from './request'

// ── Roles ──────────────────────────────────────────────────────────────────

export const getRoles = ({ limit, page,search} = {}) => {
  const params = new URLSearchParams()
  if (limit !== undefined)  params.set('limit', limit)
  if (page !== undefined) params.set('page', page)
  if (search)             params.set('search', search)
  const qs = params.toString()
  return request(`/api/roles${qs ? `?${qs}` : ''}`)
}

export const searchRoles = (q) =>
  request(`/api/roles/search?search=${encodeURIComponent(q)}`)

export const getRole = (id) =>
  request(`/api/roles/${id}`)

export const createRole = (payload) =>
  request('/api/roles', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateRole = (id, payload) =>
  request(`/api/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteRole = (id) =>
  request(`/api/roles/${id}`, { method: 'DELETE' })
