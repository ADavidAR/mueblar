import { useEffect, useState } from "react"
import { Text, View, ScrollView } from "react-native"
import Modal from "react-native-modal"

import SerifText from "../ui/SerifText"
import PrimaryButton from "../ui/PrimaryButton"
import { numberSeparatorFormatter } from "../../utils/formatters"
import VariationCard from "../ui/VariationCard"
import { fetchSingleProduct } from "../../services/inventoryService"

import products from "../../mocks/products.json"

/**
 * Selector de variantes del producto (modal).
 *
 * Trabaja sobre `product.variations` (datos ya existentes) y devuelve la
 * variante elegida vía `onSelect`, sin tocar la lógica de la pantalla.
 */
export default function VariantsModal({ visible, product, selected, onSelect, onClose, shouldLoadVariants = false }) {
    const [ fetchedVariations, setFetchedVariations ] = useState(null)
    const variations = fetchedVariations ?? product?.variations ?? []
    const [draft, setDraft] = useState(selected)

    // Sincroniza la selección temporal cada vez que se abre el modal.
    useEffect(() => {
        
        if (visible) {
            if(shouldLoadVariants) {
                const loadVariations = async () => {
                    try {
                        const data = await fetchSingleProduct(product.model, false)
                        setFetchedVariations(data?.variations ?? [])
                    } catch (e) {
                        console.error('No se pudieron cargar las variantes', e)
                        setFetchedVariations([])
                    }
                }
                loadVariations()
            }
            const initDraftSelection = async () => {
                setDraft(selected)
            }

            initDraftSelection()
        }
    }, [visible, selected, product.model, shouldLoadVariants])

    const active = draft ?? selected

    return (
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
                            Variantes de Objeto
                        </SerifText>
                        <Text className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                            {product?.model}
                        </Text>
                    </View>
                    <Text className="text-lg font-semibold text-copper-dark dark:text-copper-light">
                        L {numberSeparatorFormatter(active?.price)}
                    </Text>
                </View>

                <Text className="mt-5 mb-3 text-xs font-semibold uppercase tracking-[3px] text-stone-500 dark:text-stone-400">
                    Elige una variante
                </Text>

                <ScrollView
                    style={{ maxHeight: 280 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12 }}
                >
                    {variations.map((v) => {
                        const isActive = v.sku === active?.sku
                        return (
                            <VariationCard
                                key={v.sku}
                                sku={v.sku}
                                thumbnail={v.thumbnail}
                                name={v.name}
                                price={v.price}
                                isActive={isActive}
                                onPress={() => setDraft(v)}
                            />
                        )
                    })}
                </ScrollView>

                <View className="mt-6">
                    <PrimaryButton
                        label="Confirmar Selección"
                        onPress={() => active && onSelect(active)}
                        className="h-14"
                    />
                </View>
            </View>
        </Modal>
    )
}
