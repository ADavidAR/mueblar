import { Alert, FlatList, Pressable, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useEffect, useState } from "react"
import Modal from "react-native-modal"

import {
    ChevronDownIcon,
    ChevronUpIcon,
    CouchIcon,
    ArrowLeftIcon,
    TrashIcon,
} from "../Icons"
import { COLORS } from "../../constants/theme"
import { useTheme } from "../../context/ThemeContext"
import SerifText from "../ui/SerifText"
import { SceneObjectCard } from "../ui/ProductCard"
import { fetchSingleVariation } from "../../services/inventoryService"
import OptionsModal from "./OptionsModal"
import { useModelCatalog } from "../../hooks/useModelCatalog"

// `scene`: la MISMA instancia de useARObjects que ARFurnitureView, pasada
// por prop — ver la nota en OptionsModal.jsx.
export default function SceneObjectsModal({ visible, onHide, onSearch, scene }) {
    const getObjectData = useModelCatalog([])
    const insets = useSafeAreaInsets()
    const { isDark } = useTheme()
    const [ isAtEnd, setIsAtEnd ] = useState(false)
    const [ showOptionsModal, setShowOptionsModal ] = useState(false)
    const [ selectedIds, setSelectedIds ] = useState({
        objectId: null, 
        productId: null, 
        sku: null
    })


    // Detecta si una lista llegó al final para alternar los indicadores de flecha.
    const handleScroll = (event, key) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
        const padding = 10
        const reachedEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - padding
        setIsAtEnd(reachedEnd)
    }

    // Desplegar modal de Opciones de objeto
    const handlePress = (objectId , productId, sku) => {
        setSelectedIds({
            objectId,
            productId,
            sku
        })
        setShowOptionsModal(true)
    }

    const arrowColor = isDark ? COLORS.copperLight : COLORS.copperDark

    const handleClearScene = () => {
        Alert.alert(
            'Vaciar escena',
            'Se van a eliminar todos los muebles colocados. Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Vaciar', style: 'destructive', onPress: scene.clearScene },
            ],
        )
    }
    return (
        <>
        <Modal
            isVisible={visible}
            onBackdropPress={onHide}
            onBackButtonPress={onHide}
            animationIn="slideInLeft"
            animationOut="slideOutLeft"
            swipeDirection="left"
            onSwipeComplete={onHide}
            useNativeDriverForBackdrop
            style={{ margin: 0 }}
            backdropTransitionOutTiming={200}
            backdropOpacity={0.5}
        >
            <View
                className="flex-1 absolute w-[80%] bg-sand-2 dark:bg-earth px-6 rounded-tr-[2rem] rounded-br-[2rem]"
                style={{
                    paddingTop: insets.top + 16,
                    top: 0,
                    bottom: 0,
                    paddingBottom: insets.bottom + 16,
                }}
            >
                <View className="flex-1">

                    <View className="flex-row items-center mb-4">
                        <Pressable
                            onPress={onHide}
                            hitSlop={10}
                            className="flex-row items-center gap-x-2 active:opacity-60"
                        >
                            <View className="h-9 w-9 items-center justify-center rounded-full">
                                <ArrowLeftIcon />
                            </View>
                                <Text className="font-semibold text-stone-900 dark:text-stone-100">
                                    Salir
                                </Text>
                        </Pressable>
                    </View>
                    <SerifText className="mb-5 text-3xl font-bold color-copper">
                        Opociones
                    </SerifText>
                    <SerifText className=" ml-2 mb-5 text-3xl font-bold text-stone-900 dark:text-stone-50">
                        Selección Actual
                    </SerifText>

                    <View
                        className={`flex-row items-center justify-between border-copper-light px-4 py-3 my-0.5 `}
                    >
                        <View className="flex-row items-center gap-x-3">
                            <CouchIcon color={COLORS.copper} />
                            <Text className={`text-base  text-copper`}>
                                Objetos
                            </Text>
                        </View>
                        {scene.objects.length > 0 && (
                            <Pressable
                                onPress={handleClearScene}
                                hitSlop={10}
                                className="flex-row items-center gap-x-1 active:opacity-60"
                            >
                                <TrashIcon size={14} />
                                <Text className="text-xs font-semibold text-red-500">Vaciar</Text>
                            </Pressable>
                        )}
                    </View>

                    { scene.objects.length ? (
                        <>
                        <View className="items-center h-4">
                            {isAtEnd ? <ChevronUpIcon color={arrowColor} size={14} /> : null}
                        </View>
                        <View className="h-[46%] border-y  border-stone-300 dark:border-white/10 py-2">
                            <FlatList
                                data={scene.objects}
                                onScroll={(e) => handleScroll(e)}
                                scrollEventThrottle={16}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(o) => o.id}
                                numColumns={2}
                                columnWrapperStyle={{ justifyContent: "space-between" }}
                                contentContainerStyle={{ gap: 10 }}
                                renderItem={({ item }) => {
                                    return (
                                        <SceneObjectCard
                                            item={getObjectData(item.sku)}
                                            onPress={() => handlePress(item.id, item.productId, item.sku)}
                                        />
                                    )
                                }}
                            />
                        </View>
                        <View className="items-center h-4">
                            {isAtEnd ? null : <ChevronDownIcon color={arrowColor} size={14} />}
                        </View>
                        </>
                    )
                    : (
                            <Text className="font-semibold text-stone-900 dark:text-stone-100">
                                No hay elementos en escena
                            </Text>
                        )                    
                    }

                    {/* Indicador de swipe */}
                    <View
                        className="absolute right-[-1.4rem] top-1/2 -translate-y-1/2 w-1.5 h-[10rem] dark:bg-stone-400 bg-stone-500 rounded-full opacity-50"
                        pointerEvents="none"
                    />
                </View>
            </View>
        </Modal>
        <OptionsModal
            visible={showOptionsModal}
            onClose={() => setShowOptionsModal(false)}
            objectId={selectedIds.objectId}
            productId={selectedIds.productId}
            sku={selectedIds.sku}
            scene={scene}
        />
        </>
    )
}
