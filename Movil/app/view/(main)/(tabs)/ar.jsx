import { NativeModules } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

/**
 * Pestaña AR.
 */
let ARView
try {
    ARView =
    NativeModules.VRTMaterialManager != null
        ? require('../../../../components/ar/ARFurnitureView').default
        : require("../../../../components/ar/ARSimulatedView").default
} catch {
    ARView = require('../../../../components/ar/ARSimulatedView').default
}

export default function ARScreen() {
    // sku/model: la variación concreta que el usuario tocó en "Ver en tu
    // espacio" (ver ProductDetails.jsx). Sin esto ARFurnitureView no sabe
    // qué modelo 3D mostrar.
    const { sku, model } = useLocalSearchParams()
    return <ARView sku={sku} model={model} />
}