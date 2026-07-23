import { Text, View } from "react-native"

import MainScreen from "../../../../components/main/MainScreen"
import SerifText from "../../../../components/ui/SerifText"
import { ArIcon } from "../../../../components/Icons"
import { COLORS } from "../../../../constants/theme"

export default function AR() {

    return (
        <MainScreen showBrand showProfile>
            <View className="flex-1 items-center justify-center gap-y-4 pb-24">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-copper/15 border border-copper/30">
                    <ArIcon size={26} color={COLORS.copper} />
                </View>
                <SerifText className="text-3xl font-bold text-stone-900 dark:text-stone-50">
                    {"Vista Ar"}
                </SerifText>
                <Text className="text-center text-base text-stone-500 dark:text-stone-400">
                    Apunta tu cámara a la habitación{"\n"}y coloca el mueble en tu espacio real.
                </Text>
            </View>
        </MainScreen>
    )
}
