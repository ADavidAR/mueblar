// import React from "react"
// import { View } from "react-native"
// import {
//     ViroARPlaneSelector,
//     ViroARScene,
//     ViroARSceneNavigator,
//     ViroAmbientLight,
//     ViroDirectionalLight,
//     ViroBox,
//     ViroMaterials,
// } from "@reactvision/react-viro";

// ViroMaterials.createMaterials({
//     cubeMaterial: {
//         diffuseColor: '#FF6B35',
//     },
// });

// function MyScene() {
//     return (
//         <ViroARScene
//             onTrackingUpdated={(state, reason) => console.log('tracking:', state, reason)}
//             >
//             <ViroAmbientLight color="#FFFFFF" intensity={800} />
//             <ViroDirectionalLight color="#FFFFFF" direction={[0, -1, -0.5]} castsShadow={true} shadowOpacity={0.5} />
//             <ViroARPlaneSelector
//                 alignment="HorizontalUpward"
//                 minWidth={0.3}
//                 minHeight={0.3}
//                 onPlaneDetected={(plane) => { console.log('plano detectado:', plane); return true; }}
//                 onPlaneSelected={(plane, tap) => console.log('plano seleccionado, tap en:', tap)}
//             >
//                 <ViroBox position={[0, 0.15, 0]} scale={[0.3, 0.3, 0.3]} materials={['cubeMaterial']} />
//             </ViroARPlaneSelector>
//         </ViroARScene>
//     )
// }

// export default function Ar() {
//     return (
//         <View className="flex-1">
//             <ViroARSceneNavigator
//                 autofocus={true}
//                 initialScene={{ scene: () => <MyScene /> }}
//             />
//         </View>
//     )
// }


import { NativeModules } from 'react-native'

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
    return <ARView />
}