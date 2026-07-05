import { useLocalSearchParams } from "expo-router"
import { FlatList, Image, ScrollView, Text, View } from "react-native"

import MainScreen from "../../../../components/main/MainScreen"
import { useEffect, useState } from "react"
import { fetchSingleProduct } from "../../../../services/inventoryService"

import data from "../../../../mocks/products.json"

export default function ProductDetails () {
    const { model } = useLocalSearchParams()
    const [ product, setProduct ] = useState()
    const [ topVariation, setTopVariation ] = useState()
    useEffect(() => {
        const loadProduct = async () => {
            const newProd =  data.filter(p => p.model === model)[0] //await fetchSingleProduct(model)
            setProduct(newProd)
            setTopVariation(newProd.variations.filter(v => v.top)[0])
        }

        loadProduct()
    }, [model, setTopVariation, setProduct])

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
                    source={{ uri: topVariation?.thumbnail }}
                    style={{width: "100%", height: 350 }}
                    resizeMode="cover"
                    className="rounded-3xl"
                />
                <View>
                    <FlatList

                    />
                </View>
                <Text className="color-copper-light">
                    {topVariation?.imgs}
                </Text>
            </ScrollView>
        </MainScreen>
    )
}