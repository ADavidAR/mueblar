import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Field from '../components/ui/Field'
import Button from '../components/ui/Button'
import { Eyebrow } from '../components/ui/Tags'
import { User } from '../components/ui/icons'

/* Barra lateral de la cuenta (estática, a nivel de módulo). */
function AccountSidebar() {
  return (
    <aside>
      <h1 className="font-display text-4xl text-ink">Mi Cuenta</h1>
      <Eyebrow tone="muted" className="mt-2">
        Ajustes de Usuario
      </Eyebrow>

      <nav className="mt-8">
        <span className="flex items-center gap-3 rounded-lg border border-copper/40 bg-copper/10 px-4 py-3 text-sm font-medium text-copper-light">
          <User className="h-4 w-4" />
          Perfil
        </span>
      </nav>
    </aside>
  )
}

export default function ProfilePage() {
  const { user, loading } = useAuth()

  const [form, setForm] = useState(() => ({
    name: user?.name ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    password: '',
    confirm: ''
  }))

  const [status, setStatus] = useState(null)


  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus(null)

    if (form.password && form.password !== form.confirm) {
      setStatus({ type: 'error', msg: 'Las contraseñas no coinciden.' })
      return
    }

    setForm((prev) => ({ ...prev, password: '', confirm: '' }))
    setStatus({ type: 'ok', msg: 'Cambios guardados correctamente.' })
  }

  // Estados de carga / sin sesión
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Cargando…
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-24 pt-32 md:px-10">
      <div className="grid gap-10 md:grid-cols-[240px_1fr]">
        <AccountSidebar />

        <section className="relative overflow-hidden rounded-3xl border border-line bg-panel/60 p-8 md:p-10">
          <h2 className="font-display text-2xl text-ink">Detalles Personales</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            Actualiza tu información de contacto y ubicación para personalizar tu
            experiencia de visualización AR.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-10">
            <div className="grid gap-6 md:grid-cols-2">
              <Field
                label="name"
                value={form.name}
                onChange={update('name')}
                autoComplete="given-name"
              />
              <Field
                label="lastName"
                value={form.lastName}
                onChange={update('lastName')}
                autoComplete="family-name"
              />

              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={update('email')}
                autoComplete="email"
              />
              <div className="flex items-end">
                <Eyebrow tone="muted">Cambiar contraseña</Eyebrow>
              </div>

              <Field
                label="Contraseña"
                type="password"
                variant="underline"
                value={form.password}
                onChange={update('password')}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <Field
                label="Confirmar"
                type="password"
                variant="underline"
                value={form.confirm}
                onChange={update('confirm')}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {status && (
              <p
                role="alert"
                className={`mt-6 text-sm ${
                  status.type === 'ok' ? 'text-emerald-400/90' : 'text-red-400/90'
                }`}
              >
                {status.msg}
              </p>
            )}

            <div className="mt-12 flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() =>
                  setForm({
                    name: user.name ?? '',
                    lastName: user.lastName ?? '',
                    email: user.email ?? '',
                    password: '',
                    confirm: ''
                  })
                }
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="md">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
