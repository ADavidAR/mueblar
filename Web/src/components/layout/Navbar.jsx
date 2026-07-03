import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import Logo from './Logo'
import Button from '../ui/Button'
import { User, LogOut } from '../ui/icons'
import { useAuth } from '../../context/AuthContext'

/*
  Barra de navegación superior, fija y transparente sobre el contenido.
  Reacciona al estado de autenticación (useAuth):
   - Invitado  → Iniciar Sesión + Registrarse
   - Con sesión → Perfil (avatar) + Cerrar Sesión
  Los enlaces se declaran fuera del componente para no recrearse en cada render.
*/

const NAV_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Colecciones', to: '/colecciones' },
  { label: 'Nosotros', to: '/nosotros' },
]

function navLinkClass({ isActive }) {
  return [
    'font-display text-[15px] tracking-wide transition-colors',
    isActive ? 'text-ink' : 'text-muted hover:text-ink',
  ].join(' ')
}

/* Acciones para invitado (sin sesión) */
function GuestActions() {
  return (
    <>
      <Button to="/login" variant="outline" size="sm">
        Iniciar Sesión
      </Button>
      <Button to="/register" variant="orange" size="sm">
        Registrarse
      </Button>
    </>
  )
}

/* Acciones para usuario autenticado */
function UserActions({ user, onLogout }) {
  const initials = user
    ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase()
    : ''

  return (
    <>
      <Button to="/perfil" variant="outline" size="sm" aria-label="Ir a mi perfil">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-copper/30 text-[10px] font-semibold text-copper-light">
          {initials || <User className="h-3 w-3" />}
        </span>
        Perfil
      </Button>
      <Button variant="orange" size="sm" onClick={onLogout}>
        <LogOut className="h-4 w-4" />
        Cerrar Sesión
      </Button>
    </>
  )
}

const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const hideNav =
    AUTH_ROUTES.includes(pathname) || pathname.startsWith('/reset-password')

  function handleLogout() {
    logout() // limpia estado + borra token
    navigate('/') // redirige al inicio
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 md:px-10">
        <Logo />

        {!hideNav && (
          <ul className="hidden items-center gap-10 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <NavLink to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2.5">
          <Button
            to="/descargar"
            variant="outline"
            size="sm"
            className="hidden lg:inline-flex"
          >
            Descargar
          </Button>
          {isAuthenticated ? (
            <UserActions user={user} onLogout={handleLogout} />
          ) : (
            <GuestActions />
          )}
        </div>
      </nav>
    </header>
  )
}
