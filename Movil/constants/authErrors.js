
// Traduce el status HTTP de login/registro/recuperación a un mensaje único
// para mostrar en el formulario.
export function mapAuthError(err) {
  const status = err?.status
  if (status === 409) return 'Ya existe una cuenta con ese correo.'
  if (status === 400) return 'Revisá los datos ingresados e intentá de nuevo.'
  if (status === 401) return 'Correo o contraseña incorrectos.'
  if (status === 403) return 'No tenés permisos para continuar.'
  if (status === 404) return 'No encontramos una cuenta con ese correo.'
  if (status >= 500) return 'Error del servidor. Intentá de nuevo más tarde.'
  return err?.message || 'Ocurrió un error. Intentá de nuevo.'
}

export function mapProductError(err) {
  const status = err?.status
  if (status === 400) return 'Ups. Hubo algún error con este producto.'
  if (status === 404) return 'No pudimos encontrar este porducto.'
  if (status >= 500) return 'Error del servidor. Intentá de nuevo más tarde.'
  return err?.message || 'Ocurrió un error. Intentá de nuevo.'
}

// A diferencia de mapAuthError, esta devuelve un objeto {campo: mensaje}
// (o {campo: {message}} según el caso) para pintar el error debajo de cada
// input del formulario de perfil, no un string suelto.
export function mapUpdateUserError(err) {
  const status = err?.status
  if (status === 400 && err.details) {
    err.details.server ='Revisá los datos ingresados e intentá de nuevo.'
    return err.details
  }
  if (status >= 500) return {
    name: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    server: "Error del servidor. Intentá de nuevo más tarde.",
  }
  return {
    server: err?.message || 'Ocurrió un error. Intentá de nuevo.'
  } 
  
}

/** Reglas de validación reutilizables para react-hook-form. */
export const VALIDATION = {
  email: {
    required: 'El correo es obligatorio.',
    pattern: {
      value:
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      message: 'Ingresa un correo válido.',
    },
  },
  name: {
    required: 'El nombre es obligatorio.',
    pattern: {
      value: /^[a-zA-ZÀ-ÿñÑ]+(?:\s+[a-zA-ZÀ-ÿñÑ]+)*$/,
      message: 'Ingresa nombre (solo puede contener letras y espacio).',
    },
  },
  lastName: {
    required: 'El apellido es obligatorio.',
    pattern: {
      value: /^[a-zA-ZÀ-ÿñÑ]+(?:\s+[a-zA-ZÀ-ÿñÑ]+)*$/,
      message: 'Ingresa apellido (solo puede contener letras y espacio).',
    },
  },
  password: {
    required: 'La contraseña es obligatoria.',
    minLength: { value: 8, message: 'Debe tener al menos 8 caracteres.' },
    validate: (value) => {
      if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una letra mayúscula.'
      if (!/[a-z]/.test(value)) return 'Debe incluir al menos una letra minúscula.'
      if (!/[0-9]/.test(value)) return 'Debe incluir al menos un número.'
      if (!/[^A-Za-z0-9]/.test(value))
        return 'Debe incluir al menos un carácter especial (ej: @, #, $, !).'
      return true
    },
  },
}
