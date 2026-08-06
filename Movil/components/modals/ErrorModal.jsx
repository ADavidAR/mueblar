import { Text, View } from "react-native"
import CenterModal from "./CenterModal"
import SerifText from "../ui/SerifText"
import PrimaryButton from "../ui/PrimaryButton"

export default function ErrorModal ({ error, visible, onClose }) {
    return (
        <CenterModal
            visible={visible}
            onClose={onClose}
        >
            <View className="mb-5 flex-row items-center gap-3">
                <SerifText className="text-2xl text-stone-900 dark:text-stone-50">Ocurrió un Error</SerifText>
            </View>
            <Text>
                {error}
            </Text>
        
            <View className="mt-3">
                <PrimaryButton label="Aceptar" variant="outline" onPress={onClose} />
            </View>
        </CenterModal>
    )

}