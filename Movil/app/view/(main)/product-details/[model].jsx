import { useLocalSearchParams } from "expo-router"
import MainScreen from "../../../../components/main/MainScreen"
import ProductDetails from "../../../../components/main/ProductDetails"


export default function ProductDetailsView () {
    const { model, sku } = useLocalSearchParams()

    return (
        <MainScreen showBack showBrand>
            <ProductDetails model={model} sku={sku} />
        </MainScreen>
    )
}
