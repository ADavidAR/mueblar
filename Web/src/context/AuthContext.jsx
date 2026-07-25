import { createContext, useContext, useState, useCallback } from 'react'
import { loginUser, logoutUser, getToken } from '../services/authService'

const AuthContext = createContext(null)

const USER_KEY = 'auth_user'

function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return {}
  }
}

const ADMIN_ROUTES = ['/view/inventory', '/view/roles-management']

const ALL_MODULES = [
  { path: '/view/inventory',             label: 'Inventario',                to: '/view/inventory' },
  { path: '/view/roles-management',      label: 'Gestión de Roles',          to: '/view/roles-management' },
  { path: '/view/users-management',      label: 'Configuración de Usuarios', to: '/view/users-management' },
  { path: '/view/categories-management', label: 'Categorías',                to: '/view/categories-management' },
]


// Mismos valores de bit que usa tu backend en JwtAuthenticationFilter
// (el switch de "GET" -> 8, "POST" -> 4, etc.), para que la comparación
// del lado del frontend coincida exactamente con la del lado del servidor.
const PERMISSION_BITS = { GET: 8, POST: 4, DELETE: 2, PUT: 1 }

/*
  Revisa si el mapa de permisos de un usuario tiene el bit necesario
  para actuar sobre una ruta con un método HTTP específico.

  Ejemplo de uso:
    hasPermission(user.permissions, '/api/products', 'POST')
*/
export function hasPermission(permissions, path, method) {
  const bits = permissions?.[path]
  if (bits == null) return false
  const requiredBit = PERMISSION_BITS[method]
  return (bits & requiredBit) === requiredBit
} 

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (!getToken()) return null
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const loading = false

  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password)
    const payload = decodeJwt(data.token)
    const permissions = payload.permissions ?? {}
    const role = ADMIN_ROUTES.some((r) => permissions[r] > 0) ? 'admin' : 'client'
    const modules = ALL_MODULES.filter(({ path }) => permissions[path] > 0)
    const userData = { email, role, id: payload.jti, modules,permissions }
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    logoutUser()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    setUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
