import { useRouter } from "expo-router"

import MainScreen from "../../../components/main/MainScreen"
import ProfileForm from "../../../components/main/ProfileForm"



export default function Profile() {
    const router = useRouter()

    const handleLogout = () => {
        router.back()
    }


    return (
        <MainScreen
            showBack
            backLabel="Salir"
            onBackPress={handleLogout}
            showThemeToggle
        >
            <ProfileForm />
        </MainScreen>
    )
}
