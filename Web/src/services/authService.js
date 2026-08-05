import request from './request'

export const getToken = () => localStorage.getItem('token')

export const isAuthenticated = () => !!localStorage.getItem('token')

export const loginUser = async (email, password) => {
  const data = await request('/api/auth/login', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  localStorage.setItem('token', data.token)
  return data
}

export const logoutUser = () => {
  localStorage.removeItem('token')
}

export const registerUser = (name, lastName, email, password) =>
  request('/api/auth/register', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify({ name, lastName, email, password })
  })

export const recoveryEmail = (email) =>
  request('/api/auth/recovery-email', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify({ email })
  })

export const resetPassword = (id, password, tokenReset) =>
  request('/api/auth/reset-password', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify({ id, password, tokenReset })
  })

/*
  Verifica en el backend si el token de recuperación es válido y no expiró.
  GET /api/auth/token-verification/{token} → 200 OK | 401 | 404.
  Lanza un error (con .status) si el token no es válido.
*/
export const verifyToken = (token) =>
  request(`/api/auth/token-verification/${token}`, { skipAuth: true })

export const getCurrentUser = () => request('/api/profile')

// El backend decodifica el token y devuelve { "<roleId>": "<roleName>" }.
export const getRoleFromToken = async () => {
  const map = await request('/api/auth/role', { method: 'POST' })
  const [roleId] = Object.keys(map)
  return { roleId: Number(roleId), roleName: map[roleId] }
}

export const getPermitsForUrl = async (url) => {
  const { permits } = await request('/api/auth/permits', {
    skipAuth: false,
    method: 'POST',
    body: JSON.stringify({ url }),
    
  })
  return {
    access: Boolean(permits & 8),
    create: Boolean(permits & 4),
    delete: Boolean(permits & 2),
    modify: Boolean(permits & 1),
  }
}

export const updateProfile = (payload) =>
  request('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  })  
