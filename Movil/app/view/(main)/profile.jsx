import { Pressable, Text, View } from "react-native"

import MainScreen from "../../../components/main/MainScreen"
import { logoutUser } from "../../../services/authService"
import { useRouter } from "expo-router"

export default function Profile() {
    const router = useRouter()

    return (
        <MainScreen backLabel="Atrás" showBack showThemeToggle>
            <View className="bg-stone-50 dark:bg-surface flex-1 justify-start items-center">
                <Text className="color-slate-50 my-5" >Perfil</Text>
                <Pressable 
                    className="w-20 aspect-square bg-red-800"
                    onPress={() => {
                        logoutUser()
                        router.navigate("/view/login")
                    }}
                >
                </Pressable>
            </View>
        </MainScreen>

    )
    
}