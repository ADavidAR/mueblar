import { Link } from "expo-router"
import { Image, Pressable, Text, View } from "react-native"

import { EmptyHeartIcon } from "../Icons"

export default function ProductCard ({ item, topVariation }) {
    return (
        <Link
            asChild
            href={`/view/product-details/${item.model}`}
        >
            <Pressable className="w-[48%] mb-4">
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
                        {`L ${topVariation.price}`}
                    </Text>
                </View>
            </Pressable>
        </Link>
    )
}