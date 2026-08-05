import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { recoveryEmail } from '../services/authService'
import { mapAuthError } from '../constants/authErrors'

// Lógica del formulario "olvidé mi contraseña": pide el email y solo
// marca `sent` como feedback — el reset real pasa por el link del correo.
export function useRecoveryForm() {
  const [requestError, setRequestError] = useState(null)
  const [sent, setSent] = useState(false)

  const form = useForm({ defaultValues: { email: '' } })

  const clearServerError = () => {
    if (requestError) setRequestError(null)
    if (sent) setSent(false)
  }

  const submit = form.handleSubmit(async ({ email }) => {
    setRequestError(null)
    try {
      await recoveryEmail(email)
      setSent(true)
    } catch (err) {
      setRequestError(mapAuthError(err))
    }
  })

  return {
    form,
    requestError,
    sent,
    clearServerError,
    submit,
    isSubmitting: form.formState.isSubmitting,
  }
}
