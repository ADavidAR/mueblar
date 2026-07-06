import { Text, View } from "react-native"

import MainScreen from "../../../../components/main/MainScreen"

export default function AR() {

    return (
        <MainScreen backLabel="Atrás" showBack>
            <View className="bg-stone-50 dark:bg-surface flex-1 justify-start items-center">
                <Text className="color-slate-50 my-5" >AR</Text>
                
            </View>
        </MainScreen>

    )
    
}