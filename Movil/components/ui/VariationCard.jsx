import { Image, Pressable, Text, View } from "react-native";
import { CircleCheckIcon } from "../Icons";
import { COLORS } from "../../constants/theme";

export default function VariationCard ({ sku, name, thumbnail, price, isActive, onPress }) {
    return (
        <Pressable
            key={sku}
            onPress={onPress}
            className={`flex-row items-center rounded-2xl border p-3 active:opacity-80 ${
                isActive
                    ? "border-copper bg-copper/10"
                    : "border-stone-300 dark:border-white/10"
            }`}
        >
            <Image
                source={{ uri: thumbnail }}
                style={{ width: 56, height: 56 }}
                className="rounded-xl"
            />
            <View className="flex-1 ml-3">
                <Text className={`text-base font-semibold ${isActive ? "text-copper-dark dark:text-copper-light" : "text-stone-900 dark:text-stone-100"}`}>
                    {name}
                </Text>
                <Text className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                    L {price}
                </Text>
            </View>
            {isActive ? <CircleCheckIcon color={COLORS.copper} size={20} /> : null}
        </Pressable>
    )
}