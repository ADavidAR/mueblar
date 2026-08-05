import { useRouter } from "expo-router"

import MainScreen from "../../../components/main/MainScreen"
import ProfileForm from "../../../components/main/ProfileForm"



export default function Profile() {
    const router = useRouter()

    // esto solo vuelve a la pantalla anterior (el botón "Salir" del
    // header) — no es el cierre de sesión real, ese vive en ProfileForm.
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
