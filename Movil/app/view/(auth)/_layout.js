import { Stack } from 'expo-router'

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name='login' options={{ title: 'Iniciar sesión' }} />
            <Stack.Screen name='register' options={{ title: 'Registrarse' }} />
            <Stack.Screen name='recovery' options={{ title: 'Recuperar cuenta' }} />
        </Stack>
    )
}
