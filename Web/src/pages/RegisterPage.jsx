import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/authService'
import { validateEmail, validatePassword, validateName } from '../services/validator'
import { useAuth } from '../context/AuthContext'
import Field from '../components/ui/Field'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  function validate() {
    const newErrors = {}

    const nameError = validateName(name)
    if (nameError) newErrors.name = nameError

    const lastNameError = validateName(lastName)
    if (lastNameError) newErrors.lastName = lastNameError

    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(password)
    if (passwordError) newErrors.password = passwordError

    if (!confirm) {
      newErrors.confirm = 'Confirma tu contraseña.'
    } else if (password !== confirm) {
      newErrors.confirm = 'Las contraseñas no coinciden.'
    }

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
      await registerUser(name, lastName, email, password)
      await login(email, password)
      navigate('/view/main-view')
    } catch (err) {
      const status = err.status
      if (status === 409) setErrors({ server: 'Ya existe una cuenta con ese correo.' })
      else if (status === 400) setErrors({ server: 'Revisá los datos ingresados e intentá de nuevo.' })
      else if (status === 403) setErrors({ server: 'No tenés permisos para registrarte.' })
      else if (status >= 500) setErrors({ server: 'Error del servidor. Intentá de nuevo más tarde.' })
      else setErrors({ server: err.message || 'Error al crear la cuenta.' })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 pb-20 pt-32">
      <div className="w-full max-w-md">
        <h1 className="font-display text-5xl text-ink">Crear cuenta</h1>
        <p className="mt-3 text-[15px] text-muted">
          Únete a MueblAR y visualiza el mobiliario en tu espacio.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              autoComplete="given-name"
              error={errors.name}
            />
            <Field
              label="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido"
              autoComplete="family-name"
              error={errors.lastName}
            />
          </div>

          <Field
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@ejemplo.com"
            autoComplete="email"
            error={errors.email}
          />

          <Field
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={errors.password}
          />

          <Field
            label="Confirmar contraseña"
            type="password"
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
            Crear cuenta
          </Button>
        </form>

        <div className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"

            className="text-copper-light underline underline-offset-4 hover:text-copper"
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}