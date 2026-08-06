import { NativeModules } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

import { ModelCatalogProvider } from '../../../../context/ModelCatalogContext'

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
    // espacio" (ver ProductDetails.jsx).
    const { sku, model } = useLocalSearchParams()
    return (
        // Un solo cache de modelos 3D compartido entre ARFurnitureView,
        // SceneObjectsModal y OptionsModal
        <ModelCatalogProvider>
            <ARView sku={sku} model={model} />
        </ModelCatalogProvider>
    )
}