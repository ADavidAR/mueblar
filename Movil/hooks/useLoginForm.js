import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useForm } from 'react-hook-form'

import { loginUser } from '../services/authService'
import { mapAuthError } from '../constants/authErrors'

/**
 * Lógica del formulario de inicio de sesión. Encapsula react-hook-form,
 * la llamada a loginUser y el manejo de errores. La vista solo renderiza.
 */
export function useLoginForm() {
  const router = useRouter()
  const [requestError, setRequestError] = useState(null)

  const form = useForm({ defaultValues: { email: '', password: '' } })

  const clearServerError = () => {
    if (requestError) setRequestError(null)
  }

  const submit = form.handleSubmit(async ({ email, password }) => {
    setRequestError(null)
    try {
      await loginUser(email, password)
      router.replace('/view/catalog')
    } catch (err) {
      console.log(err)
      setRequestError(mapAuthError(err))
    }
  })

  return {
    form,
    requestError,
    clearServerError,
    submit,
    isSubmitting: form.formState.isSubmitting,
  }
}
