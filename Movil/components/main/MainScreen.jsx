import { KeyboardAvoidingView, Pressable, ScrollView, Text, View, Platform, Animated } from "react-native";
import { Link, useRouter, useTheme } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArrowLeftIcon, ArrowRightIcon, SearchIcon } from "../Icons";
import { useFadeIn } from "../../hooks/useFadeIn";
import Brand from "../ui/Brand";
import ThemeToggle from "../ui/ThemeToggle";

export default function MainScreen({
    children,
    showBack = false,
    backLabel,
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
    
    const hasTopBar = showBack || showBrand || showProfile || showSearch
    
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-stone-50 dark:bg-surface"
        >
            <View
                className="flex-1 bg-stone-50 dark:bg-surface"
                style={{
                    paddingTop: insets.top + 12,
                    paddingBottom: insets.bottom + 24
                }}
            >
                { hasTopBar
                ? ( 
                <View className="h-14 flex-row items-center justify-between px-6">
                    { showBack
                    ? ( 
                    <View className="flex-1 flex-row items-center">
                        <Pressable
                            onPress={() => router.back()}
                            hitSlop={10}
                            className="flex-row items-center active:opacity-60"
                        >
                            <ArrowLeftIcon />
                            { backLabel 
                            ? <Text className="ml-2 font-semibold text-stone-900 dark:text-stone-100">
                                {backLabel}
                            </Text>
                            : null }
                        </Pressable>
                    </View>)
                    : null}
                    <View className="flex-1 flex-row items-center">
                        { showSearch
                        ? (
                        <Pressable
                            onPress={onSearchPress}
                            hitSlop={10}
                            className="flex-row items-center active:opacity-60"
                        >
                            <SearchIcon />
                        </Pressable>
                        )
                        : null}
                    </View>

                    <View className="flex-1 items-center">{showBrand ? <Brand /> : null}</View>
                    <View className="flex-1 items-end">
                        {showProfile
                        ? (
                            <Link
                            asChild
                            href="/view/profile"
                            >
                                <Pressable className="flex-row items-center active:opacity-60">
                                    <Text className="mr-2 font-semibold text-stone-900 dark:text-stone-100">Perfil</Text>
                                    <ArrowRightIcon />
                                </Pressable>
                            </Link>
                        ) 
                        : null}
                    </View>
                    {showThemeToggle ? (<View className="flex-1 items-end"> <ThemeToggle /> </View>) : null}
                </View>)
                : null}
                <Animated.View style={[fade, { flex: 1 }]}>
                    <View className={`flex-1  px-7 ${contentClassName}`}>{children}</View>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    )
}