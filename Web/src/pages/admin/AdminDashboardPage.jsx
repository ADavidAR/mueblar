import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import { Package, Shield, Settings, Tag, Layers, List, LayoutDashboard } from '../../components/ui/icons'

const MODULE_ICONS = {
  '/view/inventory':             Package,
  '/view/attribute-types':       Layers,
  '/view/attributes':            List,
  '/view/roles-management':      Shield,
  '/view/users-management':      Settings,
  '/view/categories-management': Tag,
}



export default function AdminDashboardPage() {
  const { user } = useAuth()
  const modules = user?.modules ?? []
  const roleLabel = user?.role ?? '—'

  return (
    <AdminLayout title="Dashboard">

      {/* Bienvenida */}
      <section className="mb-10">
        <h2 className="font-display text-4xl text-white">
          Bienvenido,{' '}
          <span className="text-copper-light">{user?.email}</span>
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Tu rol es:{' '}
          <span className="font-medium text-white">{roleLabel}</span>
        </p>
      </section>

      {/* Módulos disponibles */}
      <section>
        <h3 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
          Módulos disponibles
        </h3>

        {modules.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No tenés módulos asignados.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map(({ to, label }) => {
              const Icon = MODULE_ICONS[to] ?? LayoutDashboard
              return (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-800/40 p-5 transition-colors hover:border-copper/40 hover:bg-neutral-800"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-copper/10 text-copper-light transition-colors group-hover:bg-copper/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{label}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">{to}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

    </AdminLayout>
  )
}
