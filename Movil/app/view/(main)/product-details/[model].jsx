import { useLocalSearchParams } from "expo-router"
import { FlatList, Image, Pressable, ScrollView, Text, View } from "react-native"

import MainScreen from "../../../../components/main/MainScreen"
import { useEffect, useState } from "react"
import { fetchSingleProduct } from "../../../../services/inventoryService"

import data from "../../../../mocks/products.json"
import { numberSeparatorFormatter, parseAttributes } from "../../../../utils/formatters"
import SpecificationTable from "../../../../components/ui/SpecificationTable"

export default function ProductDetails () {
    const { model } = useLocalSearchParams({})
    const [ product, setProduct ] = useState({})
    const [ topVariation, setTopVariation ] = useState()
    const [ selectedImg, setSelectedImg ] = useState("")

    const [ productData, setproductData ] = useState({
        imgs: [],
        materials: [],
        color: [],
        dimesnions: []
    })
    useEffect(() => {
        const loadProduct = async () => {
            const newProd =  data.filter(p => p.model === model)[0] //await fetchSingleProduct(model)
            const newTop = newProd.variations.filter(v => v.top)[0]
            setProduct(newProd)
            setTopVariation(newTop)
            setSelectedImg(newTop.thumbnail)
            const { materials: newMaterials, color: newColor } = parseAttributes(newTop.attribs)
            const newDims = [
                `Ancho: ${newProd.dimensions.width}cm`,
                `Profundidad: ${newProd.dimensions.depth}cm`,
                `Alto: ${newProd.dimensions.height}cm`,
            ]
            
            setproductData({
                imgs: [newTop.thumbnail, ...newTop.imgs],
                materials: newMaterials,
                color: newColor,
                dimesnions: newDims
            })
        }

        loadProduct()
    }, [model, setTopVariation, setProduct, setSelectedImg, setproductData])

    return (
        <MainScreen 
            showBack 
            backLabel="Atrás"
            showProfile 
            showBrand
            contentClassName="justify-center"
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: "center"
                }}
            >
                <Image
                    source={{ uri: selectedImg }}
                    style={{width: "100%", height: 350 }}
                    resizeMode="cover"
                    className="rounded-3xl"
                />
                <View
                    className="my-10 h-[150]"
                >
                    <FlatList
                        data={productData.imgs}
                        horizontal={true}
                        contentContainerStyle={{gap: 16, height: 150}}
                        renderItem={({ item }) => {
                            return (
                                <Pressable
                                onPress={() => setSelectedImg(item)}
                                >
                                    <Image
                                        source={{uri: item}}
                                        style={{ width: 120, height: "100%"}}
                                        className="rounded-xl"
                                    >

                                    </Image>
                                </Pressable>
                            )
                        }}
                    />
                </View>
                <View className="items-start mb-5 w-[100%]">
                    <Text className="mb-5 dark:color-stone-50 font-bold text-6xl">
                        {model}
                    </Text>
                    <Text className="mb-5 color-copper-dark dark:color-copper-light font-semibold text-2xl">
                        L {numberSeparatorFormatter(topVariation?.price)}
                    </Text>
                    <Text className="color-copper-dark dark:color-copper-lighter font-semibold text-2xl">
                        {product?.description}
                    </Text>
                </View>
                <SpecificationTable 
                    color={productData.color}
                    dimensions={productData.dimesnions}
                    materials={productData.materials}

                />
            </ScrollView>
        </MainScreen>
    )
}