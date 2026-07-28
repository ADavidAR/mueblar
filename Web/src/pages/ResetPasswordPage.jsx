import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { resetPassword, verifyToken } from '../services/authService'
import { validatePassword } from '../services/validator'
import Field from '../components/ui/Field'
import Button from '../components/ui/Button'
import Figure from '../components/ui/Figure'
import { Eyebrow } from '../components/ui/Tags'
import { ArrowLeft } from '../components/ui/icons'

function AsideArt() {
  return (
    <Figure
      src="/images/forgot-aside.jpg"
      tone="dark"
      alt="Espacio interior en penumbra"
      rounded="rounded-none"
      className="hidden min-h-[460px] md:block"
      overlay={
        <div className="flex h-full flex-col justify-end p-8">
          <Eyebrow className="mb-2">Curaduría del Espacio</Eyebrow>
          <p className="font-display text-2xl text-ink">
            Un nuevo comienzo seguro.
          </p>
        </div>
      }
    />
  )
}

export default function ResetPasswordPage() {
  const { token, id } = useParams()
  const decodedToken = decodeURIComponent(token)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  function validate() {
    const newErrors = {}
    const passwordError = validatePassword(password)
    if (passwordError) newErrors.password = passwordError
    if (!confirm) newErrors.confirm = 'Confirma tu contraseña.'
    else if (password !== confirm) newErrors.confirm = 'Las contraseñas no coinciden.'
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    try {
      await verifyToken(decodedToken)
      await resetPassword(Number(id), password, decodedToken)
      setDone(true)
    } catch (err) {
      const status = err.status
      if (status === 400 || status === 401) {
        setErrors({ server: 'El enlace es inválido o ha expirado. Solicitá uno nuevo.' })
      } else if (status >= 500) {
        setErrors({ server: 'Error del servidor. Intentá de nuevo más tarde.' })
      } else {
        setErrors({ server: err.message || 'No se pudo cambiar la contraseña.' })
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-28">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl md:grid-cols-2">
        <AsideArt />

        <div className="flex flex-col justify-center p-8 md:p-12">
          {done ? (
            <>
              <h1 className="font-display text-3xl leading-tight text-ink">
                Contraseña actualizada
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Tu contraseña se cambió correctamente. Ya podés iniciar sesión con
                tus nuevas credenciales.
              </p>
              <Button to="/login" variant="primary" size="lg" className="mt-8">

                Ir a iniciar sesión
              </Button>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl leading-tight text-ink">
                Nueva
                <br />
                Contraseña
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Ingresa tu nueva contraseña para completar la recuperación.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
                <Field
                  label="Nueva contraseña"
                  type="password"
                  variant="underline"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  error={errors.password}
                />
                <Field
                  label="Confirmar contraseña"
                  type="password"
                  variant="underline"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  error={errors.confirm}
                />

                {errors.server && (
                  <p role="alert" className="text-sm text-red-400/90">
                    {errors.server}
                  </p>
                )}

                <Button type="submit" variant="primary" size="lg" fullWidth>
                  Cambiar Contraseña
                </Button>
              </form>

              <Link
                to="/login"
                className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-copper-light"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
