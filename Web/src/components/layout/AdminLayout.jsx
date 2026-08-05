import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Package, Shield, Settings, Tag, LogOut, Search, User, ArrowUpRight, Layers, List, Logs } from '../ui/icons'
import PageTransition from './PageTransition'


const ADMIN_NAV = [
  { label: 'Inventario',              to: '/view/inventory',              icon: Package },
  { label: 'Roles',                   to: '/view/roles-management',       icon: Shield  },
  { label: 'Configuración Usuarios',  to: '/view/users-management',       icon: Settings},
  { label: 'Categorías',              to: '/view/categories-management',  icon: Tag     },
  { label: 'Tipos de Atributo',       to: '/view/attribute-types',        icon: Layers  },
  { label: 'Atributos',               to: '/view/attributes',             icon: List    },
  { label: 'Bitácoras',               to: '/view/reports',                icon: Logs    },
]

export default function AdminLayout({ children, title, searchPlaceholder, action }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

   // Un Set con las rutas que el usuario sí puede ver, según lo que
  // AuthContext ya calculó con permisos reales en el login.
  const allowedPaths = new Set((user?.modules ?? []).map((m) => m.to))
  const visibleNav = ADMIN_NAV.filter((item) => allowedPaths.has(item.to))

  function handleLogout() {
    logout()
    navigate('/login')
  }


  return (
    <div className="flex h-screen bg-neutral-900 text-white">

      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col bg-neutral-950 px-4 py-6">
        <Link to="/view/dashboard" className="mb-10 block px-2">
          <p className="font-display text-xl tracking-wide text-white">MueblAR</p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-neutral-500">
            Portal Administrativo
          </p>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {visibleNav.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-copper/15 text-copper-light'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="leading-tight">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-0.5">
          <Link
            to="/view/main-view"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <ArrowUpRight className="h-4 w-4 shrink-0" />
            Ver Sitio
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área principal */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950/50 px-8 py-4">
          <h1 className="font-display text-xl text-copper-light">{title}</h1>

          <div className="flex items-center gap-6">
            {searchPlaceholder && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="w-52 rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-8 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-copper/50 focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <a href="/view/client-profile">

              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.email}</p>
                <p className="text-xs text-neutral-400">{user?.role}</p>
              </div>
              </a>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-copper/20">
                <User className="h-4 w-4 text-copper-light" />
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-8">
          <PageTransition pathKey={pathname}>
            {action && (
              <div className="mb-6 flex justify-end">
                {action}
              </div>
            )}
            {children}
          </PageTransition>
        </main>

        <footer className="border-t border-neutral-800 px-8 py-3 text-center text-[10px] uppercase tracking-[0.18em] text-neutral-700">
          © 2026 MueblAR Interiors. Todos los Derechos Reservados.
        </footer>
      </div>
    </div>
  )
}
