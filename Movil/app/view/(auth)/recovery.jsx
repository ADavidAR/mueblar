import AuthScreen from '../../../components/auth/AuthScreen'
import RecoveryForm from '../../../components/auth/RecoveryForm'

export default function Recovery() {
  return (
    <AuthScreen showBack backLabel="Cuenta" showBrand contentClassName="justify-center">
      <RecoveryForm />
    </AuthScreen>
  )
}
