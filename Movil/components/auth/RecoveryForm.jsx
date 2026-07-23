import { View, Text } from 'react-native'
import { Controller } from 'react-hook-form'
import { Link } from 'expo-router'

import { useRecoveryForm } from '../../hooks/useRecoveryForm'
import { VALIDATION } from '../../constants/authErrors'
import SerifText from '../ui/SerifText'
import UnderlineField from '../ui/UnderlineField'
import PrimaryButton from '../ui/PrimaryButton'
import { ShieldKeyIcon } from '../Icons'

export default function RecoveryForm() {
  const {
    form: { control, formState: { errors } },
    requestError,
    sent,
    clearServerError,
    submit,
    isSubmitting,
  } = useRecoveryForm()

  return (
    <View className="flex-1 justify-center">
      <View className="rounded-3xl bg-white p-7 shadow-xl shadow-black/20 dark:bg-card">
        <View className="absolute right-5 top-5 h-11 w-11 items-center justify-center rounded-full bg-copper/10">
          <ShieldKeyIcon />
        </View>

        <Text className="text-sm font-semibold uppercase tracking-[2px] text-copper">
          Restauración
        </Text>
        <SerifText className="mt-2 text-4xl leading-tight text-stone-900 dark:text-stone-50">
          Recupera tu Acceso
        </SerifText>
        <Text className="mt-4 text-base leading-6 text-stone-500 dark:text-stone-400">
          Ingresa el correo electrónico asociado a tu cuenta de MueblAR. Te enviaremos un enlace
          seguro para restablecer tus credenciales.
        </Text>

        <View className="mt-8">
          <Controller
            control={control}
            name="email"
            rules={VALIDATION.email}
            render={({ field: { onChange, onBlur, value } }) => (
              <UnderlineField
                label="Correo electrónico"
                placeholder="wombat.reyes@email.comg"
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
        </View>

        {sent ? (
          <Text className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">
            Enviamos el enlace de restablecimiento a tu correo. Revisa tu bandeja de entrada.
          </Text>
        ) : null}
        {requestError ? (
          <Text className="mt-4 text-sm text-red-500">{requestError}</Text>
        ) : null}

        <View className="mt-8">
          <PrimaryButton
            label="Enviar enlace de restablecimiento"
            onPress={submit}
            loading={isSubmitting}
          />
        </View>

        <View className="mt-6 items-center gap-3">
          <Link
            href="/view/login"
          >
            <Text className="text-xs font-semibold uppercase tracking-[1px] text-stone-400 dark:text-stone-500">‹ Volver al inicio</Text>
          </Link>
        </View>
      </View>
    </View>
  )
}
