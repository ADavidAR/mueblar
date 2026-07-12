import { Link } from "expo-router"
import { Image, Pressable, Text, View, Animated } from "react-native"
import { useEffect, useState } from "react"

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

export function ProductCard ({ item, topVariation }) {
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

export function AnimatedProductCard ({item, topVariation, index, shouldReset, stopReset}) {
    const [fadeAnim] = useState(() => new Animated.Value(0))
    const [slideAnim] = useState(() => new Animated.Value(20))

    useEffect(() => {
        if (shouldReset) {
            fadeAnim.setValue(0)
            slideAnim.setValue(20)
            stopReset()
        }

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
        ]).start();
        // fadeAnim/slideAnim son estables (nunca se reasignan), no hace falta
        // incluirlos como dependencias: incluirlos fue lo que causaba el loop original.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldReset])

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                width: "48%"
            }}

        >
            <ProductCard item={item} topVariation={topVariation} />
        </Animated.View>
    )
}
