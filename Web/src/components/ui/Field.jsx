import { useId, useState } from 'react'
import { Eye, EyeOff } from './icons'

/*
  Campo de formulario reutilizable (label + input + error).
  variant:
    - "box": input con relleno y borde redondeado (Login / Registro).
    - "underline": sólo borde inferior (Recuperar contraseña).
  Los campos de tipo password muestran un botón para ver/ocultar el texto.
  Mantiene el control en el padre vía value/onChange (componente controlado).
*/

const BASE =
  'w-full bg-transparent text-ink placeholder:text-faint focus:outline-none transition-colors'

const VARIANT = {
  box:
    'rounded-md border border-line-strong bg-bg-soft/60 px-4 py-3 text-[15px] focus:border-copper',
  underline:
    'border-0 border-b border-line-strong px-1 py-2 text-[15px] rounded-none focus:border-copper',
}

export default function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  variant = 'box',
  className = '',
  ...rest
}) {
  const id = useId()
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-[11px] font-medium uppercase tracking-[0.2em] text-muted"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          className={`${BASE} ${VARIANT[variant]} ${error ? 'border-red-400/70' : ''} ${isPassword ? 'pr-10' : ''}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
            aria-label={show ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-400/90">
          {error}
        </p>
      )}
    </div>
  )
}
