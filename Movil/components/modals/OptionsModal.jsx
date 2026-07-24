import { useState } from "react"
import { Text, View, Pressable } from "react-native"
import Modal from "react-native-modal"

import SerifText from "../ui/SerifText"
import { useRouter } from "expo-router"
import VariantsModal from "./VariantsModal"
import { useModelCatalog } from "../../hooks/useModelCatalog"

/**
 * Modal del opciones para objetos en Vista AR.
 *
 * Trabaja sobre `product.variations` (datos ya existentes) y devuelve la
 * variante elegida vía `onSelect`, sin tocar la lógica de la pantalla.
 *
 * `scene`: la MISMA instancia de useARObjects que usa ARFurnitureView, pasada
 * por prop en vez de llamar useARObjects() acá — cada llamada al hook tiene
 * su propio estado interno, así que una instancia aparte nunca se enteraría
 * de los cambios (ni al revés).
 */
export default function OptionsModal({ visible, onClose, objectId, productId, sku, scene }) {
    const getObjectData = useModelCatalog([])
    const [ showVariantsModal, setShowVariantsModal ] = useState(false)
    const router = useRouter()

    // Selección de una variación desde el modal
    const handleSelectVariation = (variation) => {
        scene.updateTransform(objectId, {sku: variation.sku})
        setShowVariantsModal(false)
        onClose()
    }
    return (
        <>
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            useNativeDriver
            animationIn="fadeInUp"
            animationOut="fadeOutDown"
            backdropOpacity={0.6}
            style={{ justifyContent: "center", margin: 20 }}
        >
            <View className="rounded-3xl bg-sand-2 dark:bg-earth-light px-6 py-7">
                {/* Encabezado */}
                <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                        <SerifText className="text-2xl font-bold text-stone-900 dark:text-stone-50">
                            Opciones
                        </SerifText>
                        <Text className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                            {productId}
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={() => setShowVariantsModal(true)}
                    className="mt-4 items-center rounded-full bg-copper py-4 active:opacity-80 disabled:opacity-40"
                >
                    <Text className="text-sm font-semibold uppercase tracking-[2px] text-white">
                        Variatnes de Objeto
                    </Text>
                </Pressable>

                <Pressable
                    className="mt-4 items-center rounded-full bg-copper py-4 active:opacity-80 disabled:opacity-40"
                    onPress={() => {
                        router.push({
                            pathname:`/view/product-details/${productId}`,
                            params: { sku }
                        })
                    }}
                >
                    <Text className="text-sm font-semibold uppercase tracking-[2px] text-white">
                        Ir a detalles
                    </Text>
                </Pressable>
            </View>
        </Modal>
        <VariantsModal
            onClose={() => setShowVariantsModal(false)}
            product={{ model: productId }}
            onSelect={handleSelectVariation}
            visible={showVariantsModal}
            shouldLoadVariants
            selected={{...getObjectData(sku), sku}}
            
        />
        </>

    )
}
