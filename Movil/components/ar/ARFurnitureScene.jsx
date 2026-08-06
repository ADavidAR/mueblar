import {
    ViroARScene,
    ViroARPlane,
    ViroQuad,
    ViroMaterials,
    ViroAmbientLight,
    ViroDirectionalLight,
    ViroTrackingStateConstants,
} from '@reactvision/react-viro'

import FurnitureModel from './FurnitureModel'
import { useState } from 'react'

ViroMaterials.createMaterials({
    // Textura de plano translúcida color cobre para señalar el suelo detectado
    floorIndicator: { diffuseColor: 'rgba(200, 145, 120, 0.28)' },
})

/**
 * Escena AR: recibe el estado desde ARFurnitureView vía `viroAppProps`
 *
 * Reconocimiento de entorno: `anchorDetectionTypes` activa la detección de
 * planos horizontales (suelos, para el anclaje) y verticales (paredes, para
 * las obstrucciones). Cada anchor que ARCore encuentra/actualiza/elimina se
 * refleja en `anchorsRef`y el plano horizontal más bajo se reporta como suelo (`onFloorFound`).
 */
export default function ARFurnitureScene(props) {
    const {
        objects,
        selectedId,
        floorY,
        mode,
        getModel,
        objectsRef,
        anchorsRef,
        registerSceneRef,
        onTrackingChange,
        onFloorFound,
        onSelect,
        onCommit,
        onObstruction,
    } = props.sceneNavigator.viroAppProps

    const [ floorAnchorId, setFloorAnchorId ] = useState()

    // Recalcula el anchor horizontal más bajo sobre los datos de
    // anchorsRef (no un mínimo histórico): así una lectura ruidosa que
    // ARCore corrige después, o un anchor que se fusiona/descarta, no dejan
    // un suelo incorrecto  siempre se elige el mejor candidato
    // actual entre los planos que siguen existiendo.
    const pickFloorAnchor = () => {
        let idOfLowest = null
        let lowestY = Infinity
        for (const [id, a] of anchorsRef.current) {
            if (a.alignment === 'Horizontal' && a.position[1] < lowestY) {
                lowestY = a.position[1]
                idOfLowest = id
            }
        }
        return idOfLowest
    }

    const trackAnchor = (anchor) => {
        if (anchor.type !== 'plane') return
        const alignment = String(anchor.alignment || '').startsWith('Horizontal')
            ? 'Horizontal'
            : 'Vertical'
        anchorsRef.current.set(anchor.anchorId, {
            alignment,
            position: anchor.position,
            rotationY: anchor.rotation ? anchor.rotation[1] : 0,
            width: anchor.width || 0,
            height: anchor.height || 0,
        })
        if (alignment === 'Horizontal') {
            const idOfLowest = pickFloorAnchor()
            setFloorAnchorId(idOfLowest)
            onFloorFound(anchorsRef.current.get(idOfLowest).position[1])
        }
    }

    const forgetAnchor = (anchor) => {
        anchorsRef.current.delete(anchor.anchorId)

        if (anchor.anchorId === floorAnchorId) {
            const idOfLowest = pickFloorAnchor()
            setFloorAnchorId(idOfLowest)
            const lowestAnchor = idOfLowest ? anchorsRef.current.get(idOfLowest) : null
            if (lowestAnchor) onFloorFound(lowestAnchor.position[1])
        }
    }

    const handleTracking = (state) => {
        onTrackingChange(state === ViroTrackingStateConstants.TRACKING_NORMAL)
    }

    return (
        <ViroARScene
            ref={registerSceneRef}
            anchorDetectionTypes={['PlanesHorizontal', 'PlanesVertical']}
            onTrackingUpdated={handleTracking}
            onAnchorFound={trackAnchor}
            onAnchorUpdated={trackAnchor}
            onAnchorRemoved={forgetAnchor}
            onClick={() => onSelect(null)}
        >
            <ViroAmbientLight color="#ffffff" intensity={400} />
            <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.4]} />

            {/* Feedback visual del anclaje: el primer suelo detectado se pinta
                con una malla translúcida */}
            <ViroARPlane alignment="Horizontal" anchorId={floorAnchorId}>
                <ViroQuad rotation={[-90, 0, 0]} width={4} height={4} materials={['floorIndicator']} />
            </ViroARPlane>

            {objects.map((object) => (
                <FurnitureModel
                    key={object.id}
                    object={object}
                    selected={object.id === selectedId}
                    floorY={floorY}
                    mode={mode}
                    getModel={getModel}
                    objectsRef={objectsRef}
                    anchorsRef={anchorsRef}
                    onSelect={onSelect}
                    onCommit={onCommit}
                    onObstruction={onObstruction}
                />
            ))}
        </ViroARScene>
    )
}
