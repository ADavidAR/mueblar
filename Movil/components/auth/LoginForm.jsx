import { View, Text } from 'react-native'
import { Controller } from 'react-hook-form'
import { Link } from 'expo-router'

import { useLoginForm } from '../../hooks/useLoginForm'
import { VALIDATION } from '../../constants/authErrors'
import SerifText from '../ui/SerifText'
import Brand from '../ui/Brand'
import UnderlineField from '../ui/UnderlineField'
import PasswordField from '../ui/PasswordField'
import PrimaryButton from '../ui/PrimaryButton'

export default function LoginForm() {
  const {
    form: { control, formState: { errors } },
    requestError,
    clearServerError,
    submit,
    isSubmitting,
  } = useLoginForm()

  return (
    <View className="flex-1">
      <View className="items-center">
        <Brand />
      </View>

      <SerifText className="mt-8 text-4xl leading-tight text-stone-900 dark:text-stone-50">
        Bienvenido de nuevo
      </SerifText>
      <Text className="mt-2 text-base text-stone-500 dark:text-stone-400">
        Inicia sesión en tu colección privada
      </Text>

      <View className="mt-10 gap-6">
        <Controller
          control={control}
          name="email"
          rules={VALIDATION.email}
          render={({ field: { onChange, onBlur, value } }) => (
            <UnderlineField
              label="Correo electrónico"
              placeholder="wombat.reyes@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onBlur={onBlur}
              onChangeText={(t) => {
                onChange(t)
                clearServerError()
              }}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: 'La contraseña es obligatoria.' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordField
              label="Contraseña"
              value={value}
              onBlur={onBlur}
              onChangeText={(t) => {
                onChange(t)
                clearServerError()
              }}
              error={errors.password?.message}
            />
          )}
        />

        <View className="items-end">
          <Link href="/view/recovery" >
            <Text className="text-sm text-stone-500 underline dark:text-stone-400">¿Olvidaste tu contraseña?</Text>
          </Link>
        </View>

        {requestError ? (
          <Text className="text-sm text-red-500">{requestError}</Text>
        ) : null}

        <PrimaryButton label="Iniciar sesión" onPress={submit} loading={isSubmitting} />
      </View>

      <View className="mt-8 flex-row justify-center">
        <Text className="text-stone-500 dark:text-stone-400">¿Nuevo en MueblAR? </Text>
        <Link href="/view/register" >
          <Text className="font-semibold text-copper underline">Crear cuenta</Text>
        </Link>
      </View>
    </View>
  )
}
