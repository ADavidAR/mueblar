import AuthScreen from '../../../components/auth/AuthScreen'
import RegisterForm from '../../../components/auth/RegisterForm'

export default function Register() {
  return (
    <AuthScreen showBack backLabel="Cuenta">
      <RegisterForm />
    </AuthScreen>
  )
}
