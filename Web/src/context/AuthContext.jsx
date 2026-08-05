import { createContext, useContext, useState, useCallback } from 'react'
import { loginUser, logoutUser, getToken, getRoleFromToken, getPermitsForUrl } from '../services/authService'

const AuthContext = createContext(null)

const USER_KEY = 'auth_user'

const ALL_MODULES = [
  { permission: '/view/inventory',             label: 'Inventario',                to: '/view/inventory' },
  { permission: '/view/attribute-types',       label: 'Tipos de Atributo',         to: '/view/attribute-types' },
  { permission: '/view/attributes',            label: 'Atributos',                 to: '/view/attributes' },
  { permission: '/view/roles-management',      label: 'Gestión de Roles',          to: '/view/roles-management' },
  { permission: '/view/users-management',      label: 'Configuración de Usuarios', to: '/view/users-management' },
  { permission: '/view/categories-management', label: 'Categorías',                to: '/view/categories-management' },
  { permission: '/view/reports',               label: 'Bitácoras',                 to: '/view/reports' }, 
]

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
    await loginUser(email, password)

    // El rol lo decodifica el backend (POST /api/auth/role) — el frontend ya
    // no abre el JWT. Los módulos accesibles se arman consultando /api/auth/permits
    // por cada ruta admin conocida, en vez de leerlos del token.
    const { roleName } = await getRoleFromToken()
    const role = (roleName ?? '').toLowerCase()

    const moduleChecks = await Promise.all(
      ALL_MODULES.map(async (m) => {
        try {
          const { access } = await getPermitsForUrl(m.permission)
          return access ? m : null
        } catch {
          return null
        }
      })
    )
    const modules = moduleChecks.filter(Boolean)

    const userData = { email, role, modules }
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
