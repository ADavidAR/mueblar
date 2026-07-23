import { View, Text } from 'react-native'
import { Controller } from 'react-hook-form'
import { Link } from 'expo-router'

import { useRegisterForm } from '../../hooks/useRegisterForm'
import { VALIDATION } from '../../constants/authErrors'
import SerifText from '../ui/SerifText'
import Brand from '../ui/Brand'
import UnderlineField from '../ui/UnderlineField'
import PasswordField from '../ui/PasswordField'
import PrimaryButton from '../ui/PrimaryButton'

export default function RegisterForm() {
    const {
        form: { control, watch, formState: { errors } },
        requestError,
        clearServerError,
        submit,
        isSubmitting,
    } = useRegisterForm()

    const password = watch('password')

    return (
        <View className="flex-1">
            <View className="items-center">
                <Brand />
            </View>

            <SerifText className="mt-4 text-4xl leading-tight text-stone-900 dark:text-stone-50">
                Comienza tu Colección
            </SerifText>
            <Text className="mt-2 text-base text-stone-500 dark:text-stone-400">
                Crea una cuenta para guardar piezas deseadas y verlas en AR.
            </Text>

            <View className="mt-8 gap-6">
                <Controller
                    control={control}
                    name="name"
                    rules={VALIDATION.name}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <UnderlineField
                            label="Nombre"
                            placeholder="Wombat Filiberto"
                            autoCapitalize="words"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={(t) => {
                                onChange(t)
                                clearServerError()
                            }}
                            error={errors.name?.message}
                        />
                    )}
                />
                
                <Controller
                    control={control}
                    name="lastName"
                    rules={VALIDATION.lastName}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <UnderlineField
                            label="Apellido"
                            placeholder="Reyes"
                            autoCapitalize="word"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={(t) => {
                                onChange(t)
                                clearServerError()
                            }}
                            error={errors.lastName?.message}
                        />
                    )}
                />

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
                    rules={VALIDATION.password}
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

                <Controller
                    control={control}
                    name="confirmPassword"
                    rules={{
                        required: 'Confirma la contraseña.',
                        validate: (val) => val === password || 'Las contraseñas no coinciden.',
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <PasswordField
                            label="Confirmar"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={(t) => {
                                onChange(t)
                                clearServerError()
                            }}
                            error={errors.confirmPassword?.message}
                        />
                    )}
                />

                {requestError ? (
                <Text className="text-sm text-red-500">{requestError}</Text>
                ) : null}

                <PrimaryButton
                    label="Registrarse"
                    onPress={submit}
                    loading={isSubmitting}
                    className="mt-2"
                />
            </View>

            <View className="mt-6 flex-row justify-center">
                <Text className="text-stone-500 dark:text-stone-400">¿Ya tienes una cuenta? </Text>
                <Link href="/view/login" >
                    <Text className="font-semibold text-copper underline" >Iniciar sesión</Text>
                </Link>
            </View>
        </View>
    )
}
