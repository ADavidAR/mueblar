import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCurrentUser, updateProfile } from '../services/authService'
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
  const { user, loading: authLoading } = useAuth()

  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: '', confirm: '' })
  // Último estado confirmado en el backend, para que "Cancelar" revierta a esto y no a datos vacíos.
  const [savedProfile, setSavedProfile] = useState(null)

  const [profileLoading, setProfileLoading] = useState(true)
  const [status, setStatus]                 = useState(null)
  const [saving, setSaving]                 = useState(false)

  // Trae el perfil real del backend al montar (useAuth ya no guarda nombre/apellido).
  useEffect(() => {
    if (!user) return
    let cancelled = false

    getCurrentUser()
      .then((data) => {
        if (cancelled) return
        const loaded = {
          name: data.firstName ?? '',
          lastName: data.lastName ?? '',
          email: data.email ?? '',
        }
        setSavedProfile(loaded)
        setForm({ ...loaded, password: '', confirm: '' })
      })
      .catch((err) => {
        if (!cancelled) setStatus({ type: 'error', msg: err.message })
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })

    return () => { cancelled = true }
  }, [user])

  // Genera un onChange distinto por cada campo, sin repetir código.
  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus(null)

    // El backend exige contraseña en cada actualización (UserCreateRequestDTO
    // valida @NotBlank), así que no se puede guardar sin volver a escribirla.
    if (!form.password) {
      setStatus({ type: 'error', msg: 'La contraseña es obligatoria para guardar cambios.' })
      return
    }
    if (form.password !== form.confirm) {
      setStatus({ type: 'error', msg: 'Las contraseñas no coinciden.' })
      return
    }

    setSaving(true)
    try {
      await updateProfile({
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        // confirmar con UserCreateRequestDTO.java si "enabled"/"role"
        // también son obligatorios acá.
        enabled: true,
      })

      // Al guardar, lo nuevo pasa a ser el "último confirmado".
      const updated = { name: form.name.trim(), lastName: form.lastName.trim(), email: form.email.trim() }
      setSavedProfile(updated)
      setForm({ ...updated, password: '', confirm: '' })
      setStatus({ type: 'ok', msg: 'Cambios guardados correctamente.' })
    } catch (err) {
      setStatus({ type: 'error', msg: err.message })
    } finally {
      setSaving(false)
    }
  }

  // Descarta ediciones sin guardar, vuelve a los datos confirmados.
  function handleCancel() {
    if (!savedProfile) return
    setForm({ ...savedProfile, password: '', confirm: '' })
    setStatus(null)
  }

  // Estados de carga / sin sesión
  if (authLoading || profileLoading) {
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
                label="Nombre"
                value={form.name}
                onChange={update('name')}
                autoComplete="given-name"
              />
              <Field
                label="Apellido"
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
                <Eyebrow tone="muted">Confirma tu contraseña para guardar</Eyebrow>
              </div>

              <Field
                label="Contraseña"
                type="password"
                variant="underline"
                value={form.password}
                onChange={update('password')}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <Field
                label="Confirmar"
                type="password"
                variant="underline"
                value={form.confirm}
                onChange={update('confirm')}
                placeholder="••••••••"
                autoComplete="current-password"
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
              <Button type="button" variant="ghost" size="md" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
