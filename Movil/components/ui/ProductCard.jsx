import { Link } from "expo-router"
import { Image, Pressable, Text, View, Animated } from "react-native"
import { useCallback, useEffect, useRef, useState } from "react"

import { EmptyHeartIcon, FilledHeartIcon } from "../Icons"
import { numberSeparatorFormatter } from "../../utils/formatters"
import SerifText from "./SerifText"

/**
 * Botón de favorito flotante sobre la imagen.
 * El estado es solo visual (aún no hay lógica de favoritos en esta rama):
 * alterna el corazón para dar feedback táctil sin alterar ninguna lógica.
 */
function FavoriteButton() {
    const [liked, setLiked] = useState(false)
    const [scale] = useState(() => new Animated.Value(1))

    const toggle = () => {
        setLiked((v) => !v)
        scale.setValue(0.7)
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 40,
            bounciness: 12,
        }).start()
    }

    return (
        <Pressable
            onPress={toggle}
            hitSlop={8}
            className="absolute top-3 right-3 h-9 w-9 items-center justify-center rounded-full bg-black/45"
        >
            <Animated.View style={{ transform: [{ scale }] }}>
                {liked
                    ? <FilledHeartIcon color="#e2685f" size={16} />
                    : <EmptyHeartIcon color="#ffffff" size={16} />}
            </Animated.View>
        </Pressable>
    )
}

export function ProductCard ({ item, topVariation, onImageLoad }) {
    const [scale] = useState(() => new Animated.Value(1))

    const animateTo = (toValue) =>
        Animated.spring(scale, {
            toValue,
            useNativeDriver: true,
            speed: 50,
            bounciness: 0,
        }).start()

    return (
        <Link asChild href={`/view/product-details/${item.model}`}>
            <Pressable
                onPressIn={() => animateTo(0.96)}
                onPressOut={() => animateTo(1)}
                className="w-full"
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <View className="rounded-2xl overflow-hidden bg-white dark:bg-card shadow-sm shadow-black/20">
                        <Image
                            source={{ uri: topVariation.thumbnail }}
                            style={{ height: 200, width: '100%' }}
                            resizeMode="cover"
                            onLoadEnd={onImageLoad}
                        />
                        <FavoriteButton />
                    </View>

                    <SerifText className="mt-3 text-lg font-semibold text-stone-900 dark:text-stone-50">
                        {item.model}
                    </SerifText>

                    <Text className="mt-1 text-base font-medium text-copper-dark dark:text-copper-light">
                        {`L ${numberSeparatorFormatter(topVariation.price)}`}
                    </Text>
                </Animated.View>
            </Pressable>
        </Link>
    )
}

export function SceneObjectCard ({ item, onPress }) {
    const [scale] = useState(() => new Animated.Value(1))

    const animateTo = (toValue) =>
        Animated.spring(scale, {
            toValue,
            useNativeDriver: true,
            speed: 50,
            bounciness: 0,
        }).start()

    return (
            <Pressable
            onPress={onPress}
                onPressIn={() => animateTo(0.96)}
                onPressOut={() => animateTo(1)}
                className="w-[48%]"
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <View className="rounded-2xl w-full overflow-hidden bg-white dark:bg-card shadow-sm shadow-black/20">
                        <Image
                            source={{ uri: item.thumbnail }}
                            style={{ height: 200, width: '100%' }}
                            resizeMode="cover"
                        />
                    </View>

                    <SerifText className="mt-3 text-lg font-semibold text-stone-900 dark:text-stone-50">
                        {item.model}
                    </SerifText>
                </Animated.View>
            </Pressable>
    )
}

export function AnimatedProductCard ({item, topVariation, index, resetKey}) {
    const [fadeAnim] = useState(() => new Animated.Value(0))
    const [slideAnim] = useState(() => new Animated.Value(20))
    const imageLoadedRef = useRef(false)

    const runAnimation = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 120,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 120,
                useNativeDriver: true,
            })
        ]).start()
    }, [fadeAnim, slideAnim, index])

    const handleImageLoad = useCallback(() => {
        imageLoadedRef.current = true
        runAnimation()
    }, [runAnimation])

    // Al cambiar resetKey se reinician los valores. Si la imagen ya estaba
    // cargada (cache, ej. refresh con los mismos productos) el <Image> no
    // vuelve a disparar onLoadEnd, así que la animación se relanza acá mismo.

    useEffect(() => {
        fadeAnim.setValue(0)
        slideAnim.setValue(20)
        if (imageLoadedRef.current) {
            runAnimation()
        }
    }, [resetKey, fadeAnim, slideAnim, runAnimation])

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                width: "48%"
            }}

        >
            <ProductCard item={item} topVariation={topVariation} onImageLoad={handleImageLoad} />
        </Animated.View>
    )
}
