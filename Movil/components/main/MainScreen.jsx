import { KeyboardAvoidingView, Pressable, Text, View, Platform, Animated } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArrowLeftIcon, SearchIcon, UserIcon } from "../Icons";
import { useFadeIn } from "../../hooks/useFadeIn";
import Brand from "../ui/Brand";
import ThemeToggle from "../ui/ThemeToggle";

/**
 * Cáscara común de las pantallas del área principal.
 *
 * La barra superior se organiza en dos grupos, tal como los mockups:
 *  - Izquierda: icono de navegación (atrás o búsqueda) + logo MueblAR.
 *  - Derecha: acceso a Perfil (nombre + avatar) o el toggle de tema.
 *
 * Solo cambia la presentación; las props y la navegación se conservan.
 */
export default function MainScreen({
    children,
    showBack = false,
    backLabel,
    onBackPress,
    showBrand = false,
    showSearch = false,
    onSearchPress,
    showProfile = false,
    showThemeToggle = false,
    contentClassName = ""
}) {
    const insets = useSafeAreaInsets()
    const fade = useFadeIn()
    const router = useRouter()

    const handleBack = onBackPress ?? (() => router.back())
    const hasTopBar = showBack || showBrand || showProfile || showSearch || showThemeToggle

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-sand dark:bg-surface"
        >
            <View
                className="flex-1 bg-sand dark:bg-surface"
                style={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom
                }}
            >
                { hasTopBar
                ? (
                <View className="h-16 flex-row items-center justify-between px-6 border-b border-stone-200/70 dark:border-white/5">
                    {/* Grupo izquierdo: navegación + marca */}
                    <View className="flex-row items-center gap-x-3">
                        { showBack
                        ? (
                            <Pressable
                                onPress={handleBack}
                                hitSlop={10}
                                className="flex-row items-center gap-x-2 active:opacity-60"
                            >
                                <View className="h-9 w-9 items-center justify-center rounded-full">
                                    <ArrowLeftIcon />
                                </View>
                                { backLabel && !showBrand ? (
                                    <Text className="font-semibold text-stone-900 dark:text-stone-100">
                                        {backLabel}
                                    </Text>
                                ) : null }
                            </Pressable>)
                        : null}
                        { showSearch
                        ? (
                            <Pressable
                                onPress={onSearchPress}
                                hitSlop={10}
                                className="h-9 w-9 items-center justify-center rounded-full active:bg-stone-200/60 dark:active:bg-white/5"
                            >
                                <SearchIcon />
                            </Pressable>
                        )
                        : null}
                        { showBrand ? <Brand /> : null }
                    </View>

                    {/* Grupo derecho: perfil + tema */}
                    <View className="flex-row items-center gap-x-3">
                        {showThemeToggle ? <ThemeToggle /> : null}
                        {showProfile
                        ? (
                            <Link asChild href="/view/profile">
                                <Pressable className="flex-row items-center gap-x-2 active:opacity-70">
                                    <Text className="font-semibold text-stone-900 dark:text-stone-100">
                                        Perfil
                                    </Text>
                                    <View className="h-9 w-9 items-center justify-center rounded-full bg-copper/15 border border-copper/40">
                                        <UserIcon />
                                    </View>
                                </Pressable>
                            </Link>
                        )
                        : null}
                    </View>
                </View>)
                : null}
                <Animated.View style={[fade, { flex: 1 }]}>
                    <View className={`flex-1 px-7 ${contentClassName}`}>{children}</View>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    )
}
