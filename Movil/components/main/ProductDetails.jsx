import { FlatList, Image, Pressable, ScrollView, Text, View } from "react-native"
import { useEffect, useState } from "react"
import { useRouter } from "expo-router"

import data from "../../mocks/products.json"
import { numberSeparatorFormatter, parseAttributes } from "../../utils/formatters"
import SpecificationTable from "../ui/SpecificationTable"
import SerifText from "../ui/SerifText"
import PrimaryButton from "../ui/PrimaryButton"
import VariantsModal from "./VariantsModal"
import "../../assets/img_placeholder.jpeg"
import { CubeIcon, FilledHeartIcon, EmptyHeartIcon } from "../Icons"
import { fetchSingleProduct } from "../../services/inventoryService"

/** Construye la vista de datos derivada de una variación concreta. */
function buildProductData(prod, variation) {
    const { materials, color } = parseAttributes(variation.attribs)
    const dimensions = [
        `Ancho: ${prod.dimensions.width}cm`,
        `Profundidad: ${prod.dimensions.depth}cm`,
        `Alto: ${prod.dimensions.height}cm`,
    ]
    return {
        imgs: [variation.thumbnail, ...variation.imgs],
        materials,
        color,
        dimensions,
    }
}

export default function ProductDetails ({ model }) {
    const router = useRouter()
    
    const [ product, setProduct ] = useState({})
    const [ selectedVariation, setSelectedVariation ] = useState()
    const [ selectedImg, setSelectedImg ] = useState("")
    const [ liked, setLiked ] = useState(false)
    const [ showVariants, setShowVariants ] = useState(false)

    const [ productData, setProductData ] = useState({
        imgs: [],
        materials: [],
        color: [],
        dimensions: [],
    })

    useEffect(() => {
        const loadProduct = async () => {
            const newProd = data.filter(p => p.model === model)[0] //await fetchSingleProduct(model)
            const newVariation = newProd.variations.filter(v => v.top)[0]
            setProduct(newProd)
            setSelectedVariation(newVariation)
            setSelectedImg(newVariation.thumbnail)
            setProductData(buildProductData(newProd, newVariation))
        }

        loadProduct()
    }, [model])

    // Selección de una variación desde el modal (reutiliza los mismos setters).
    const handleSelectVariation = (variation) => {
        setSelectedVariation(variation)
        setSelectedImg(variation.thumbnail)
        setProductData(buildProductData(product, variation))
        setShowVariants(false)
    }

    return (
        <>
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            {/* Imagen principal */}
            <View className="mt-2 rounded-3xl overflow-hidden bg-white dark:bg-card shadow-lg shadow-black/30">
                <Image
                    source={{ uri: selectedImg || "../../../../assets/img_placeholder.jpeg"}}
                    style={{ width: "100%", height: 380 }}
                    resizeMode="cover"
                />
                <Pressable
                    onPress={() => setLiked(v => !v)}
                    hitSlop={8}
                    className="absolute top-4 right-4 h-10 w-10 items-center justify-center rounded-full bg-black/40"
                >
                    {liked
                        ? <FilledHeartIcon color="#e2685f" size={18} />
                        : <EmptyHeartIcon color="#ffffff" size={18} />}
                </Pressable>
            </View>

            {/* Miniaturas */}
            <FlatList
                data={productData.imgs}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, i) => `${item}-${i}`}
                contentContainerStyle={{ gap: 12, paddingVertical: 20 }}
                renderItem={({ item }) => {
                    const active = item === selectedImg
                    return (
                        <Pressable onPress={() => setSelectedImg(item)}>
                            <Image
                                source={{ uri: item }}
                                style={{ width: 96, height: 96 }}
                                className={`rounded-2xl ${active ? "border-2 border-copper" : "border border-stone-200 dark:border-white/10"}`}
                            />
                        </Pressable>
                    )
                }}
            />

            {/* Botón Variantes de objeto */}
            <PrimaryButton
                label="Variantes de objeto"
                onPress={() => setShowVariants(true)}
                className="h-14"
            />

            {/* Título + precio + descripción */}
            <View className="mt-8 mb-6">
                <SerifText className="text-4xl font-bold text-stone-900 dark:text-stone-50">
                    {model}
                </SerifText>
                <Text className="mt-3 text-2xl font-semibold text-copper-dark dark:text-copper-light">
                    L {numberSeparatorFormatter(selectedVariation?.price)}
                </Text>
                <Text className="mt-4 text-base leading-7 text-stone-600 dark:text-stone-300">
                    {product?.description}
                </Text>
            </View>

            <SpecificationTable
                color={productData.color}
                dimensions={productData.dimensions}
                materials={productData.materials}
            />

            {/* Sostenibilidad */}
            <View className="mt-8 mb-8 border-t border-stone-200 dark:border-white/10 pt-6"/>

            {/* CTA: Ver en tu espacio */}
            <PrimaryButton
                label="Ver en tu espacio"
                icon={<CubeIcon size={18} />}
                onPress={() => router.push({
                    pathname:"/view/ar",
                    params: { sku: selectedVariation.sku}
                })}
            />
        </ScrollView>

        <VariantsModal
            visible={showVariants}
            product={product}
            selected={selectedVariation}
            onSelect={handleSelectVariation}
            onClose={() => setShowVariants(false)}
        />
        </>
    )
}