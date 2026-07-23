import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { useFadeIn } from '../../hooks/useFadeIn'
import Brand from '../ui/Brand'
import ThemeToggle from '../ui/ThemeToggle'
import { ArrowLeftIcon } from '../Icons'

export default function AuthScreen({
    children,
    showBack = false, // Mostrar boton de volver atrás
    backLabel,
    showBrand = false,
    showThemeToggle = true,
    contentClassName = '',
}) {
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const fade = useFadeIn()
    const hasTopBar = showBack || showBrand || showThemeToggle

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-stone-50 dark:bg-surface"
        >
        <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                flexGrow: 1,
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 24,
            }}
        >
            {hasTopBar ? (
            <View className="h-10 flex-row items-center justify-between px-6">
                <View className="flex-1 flex-row items-center">
                {showBack ? (
                    <Pressable
                    onPress={() => router.back()}
                    hitSlop={10}
                    className="flex-row items-center active:opacity-60"
                    >
                    <ArrowLeftIcon />
                    {backLabel ? (
                        <Text className="ml-2 font-semibold text-stone-900 dark:text-stone-100">
                        {backLabel}
                        </Text>
                    ) : null}
                    </Pressable>
                ) : null}
                </View>
                <View className="flex-1 items-center">{showBrand ? <Brand /> : null}</View>
                <View className="flex-1 items-end">{showThemeToggle ? <ThemeToggle /> : null}</View>
            </View>
            ) : null}

            <Animated.View style={[fade, { flex: 1 }]}>
            <View className={`flex-1 px-7 ${contentClassName}`}>{children}</View>
            </Animated.View>
        </ScrollView>
        </KeyboardAvoidingView>
    )
}
