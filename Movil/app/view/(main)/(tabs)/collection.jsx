import { Text, View } from "react-native"

import MainScreen from "../../../../components/main/MainScreen"
import SerifText from "../../../../components/ui/SerifText"
import { EmptyHeartIcon } from "../../../../components/Icons"

export default function Collection () {

    return (
        <MainScreen showBrand showProfile>
            <View className="flex-1 items-center justify-center gap-y-4 pb-24">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-copper/15 border border-copper/30">
                    <EmptyHeartIcon size={26} />
                </View>
                <SerifText className="text-3xl font-bold text-stone-900 dark:text-stone-50">
                    Colecciones
                </SerifText>
                <Text className="text-center text-base text-stone-500 dark:text-stone-400">
                    Guarda tus piezas favoritas y organízalas{"\n"}en colecciones para tu espacio.
                </Text>
            </View>
        </MainScreen>
    )
}
