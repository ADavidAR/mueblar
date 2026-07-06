import { Link } from "expo-router"
import { Image, Pressable, Text, View, Animated } from "react-native"

import { EmptyHeartIcon } from "../Icons"
import { numberSeparatorFormatter } from "../../utils/formatters"
import { useEffect, useRef, useState } from "react"

export function ProductCard ({ item, topVariation }) {
    return (
        <Link
            asChild
            href={`/view/product-details/${item.model}`}
        >
            <Pressable className="w-[100%] mb-4">
                <View>
                    <Image
                        source={{ uri: topVariation.thumbnail }}
                        style={{ height: 200, width: '100%' }}
                        resizeMode="cover"
                        className="rounded-lg"
                    />

                    <Pressable className="absolute top-3 right-3 bg-surface opacity-80 p-2 rounded-full">
                        <EmptyHeartIcon color="white" />
                    </Pressable>

                    <Text className="text-surface dark:text-white mt-2">
                        {item.model}
                    </Text>

                    <Text className="text-surface dark:text-white">
                        {`L ${numberSeparatorFormatter(topVariation.price)}`}
                    </Text>
                </View>
            </Pressable>
        </Link>
    )
}

export function AnimatedProductCard ({item, topVariation, index, shouldReset, stopReset}) {
    const [fadeAnim, setFadeAnim] = useState( () => new Animated.Value(0))
    const [slideAnim, setSlideAnim] = useState( () => new Animated.Value(20))
    useEffect(() => {
        const resetAnim = async () => {
            if(shouldReset) {
                setFadeAnim(new Animated.Value(0))
                setSlideAnim(new Animated.Value(20))
                stopReset()
            }
        } 
        resetAnim()
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
    }, [fadeAnim, slideAnim, index, shouldReset, stopReset])

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