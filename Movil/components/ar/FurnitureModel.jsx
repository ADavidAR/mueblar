import { useEffect, useRef } from 'react'
import { Viro3DObject, ViroBox, ViroNode, ViroMaterials, ViroAnimations } from '@reactvision/react-viro'

import { isObstructed } from '../../utils/collision'

// Estados de gesto de Viro (onRotate): 1 = inicio, 2 = en curso, 3 = fin
const GESTURE_BEGIN = 1
const GESTURE_END = 3
// Estados de onClickState: 1 = dedo abajo, 2 = dedo arriba, 3 = tap completo
const CLICK_UP = 2
const CLICK_TAP = 3

// Placeholder mientras getModel(sku) todavía no resolvió (con la API real,
// a diferencia del mock, esto puede tardar): un cubo girando en el mismo
// punto donde va a aparecer el mueble.
const LOADING_CUBE_SIZE = 0.3
ViroMaterials.createMaterials({
    furnitureLoading: { diffuseColor: 'rgba(181, 116, 90, 0.55)' },
})
ViroAnimations.registerAnimations({
    furnitureLoadingSpin: {
        properties: { rotateY: '+=360' },
        duration: 2200,
    },
})

/**
 * Un mueble instanciado en la escena AR, con transformación de doble registro:
 *
 * - `object.position` / `object.rotation` transformación CONFIRMADA. Viro la aplica como prop, de modo que los
 *   muebles NO seleccionados quedan bloqueados en su posición absoluta.
 * - Durante un gesto el nodo se mueve en el lado nativo (el drag de Viro nopasa por React 
 *   en cada frame). Cada evento se valida contra la lógica de colisiones AABB: si el punto está 
 *   libre se registra en `lastValid`; si está ocupado, el nodo se re-fija con setNativeProps a la última
 *   transformación libre.
 * - Al soltar (CLICK_UP tras drag, o fin del gesto de rotación) se confirma
 *   `lastValid` al estado del padre, que lo persiste.
 *
 * Traslación: dragType="FixedToPlane" restringe el arrastre al plano del
 * suelo detectado (planeNormal Y), cumpliendo "trasladar sobre el plano
 * horizontal". Solo activo en modo "move": en modo "rotate" el giro se
 * maneja fuera de este componente (swipe de pantalla en ARFurnitureView, que
 * escribe `object.rotation` directo) para no depender del raycast de Viro.
 * Rotación con las manos sobre el objeto: gesto de dos dedos (twist) sobre
 * el eje Y propio, disponible en cualquier modo.
 */
export default function FurnitureModel({
    object,
    selected,
    floorY,
    mode,
    getModel,
    objectsRef,
    anchorsRef,
    onSelect,
    onCommit,
    onObstruction,
}) {
    const nodeRef = useRef(null)
    // Última transformación libre de colisiones; a ella se revierte el nodo
    const lastValid = useRef({
        position: object.position,
        rotationY: object.rotation[1],
    })
    // Rotación Y confirmada al iniciar el gesto de twist en curso
    const gestureBaseY = useRef(0)
    // El giro por swipe de pantalla (modo "rotate") escribe object.rotation
    // desde afuera, sin pasar por commit(); hay que mantener lastValid al día
    // o un gesto posterior (mover, o incluso soltar el tap) lo pisaría.
    useEffect(() => {
        lastValid.current = { position: object.position, rotationY: object.rotation[1] }
    }, [object.position, object.rotation])
    const model = getModel(object.sku)

    if (!model) {
        // Todavía no llegó el modelo real, se muestra el cubo girando
        // apoyado en el mismo punto (`object.position`) donde después va a
        // aparecer el mueble, sin gestos habilitados.
        return (
            <ViroNode position={object.position} rotation={object.rotation}>
                <ViroBox
                    position={[0, LOADING_CUBE_SIZE / 2, 0]}
                    width={LOADING_CUBE_SIZE}
                    height={LOADING_CUBE_SIZE}
                    length={LOADING_CUBE_SIZE}
                    materials={['furnitureLoading']}
                    animation={{ name: 'furnitureLoadingSpin', run: true, loop: true }}
                />
            </ViroNode>
        )
    }

    const obstructed = (position, rotationY) =>
        isObstructed({
            position,
            rotationY,
            objectId: object.id,
            collisionBox: model.collisionBox,
            objects: objectsRef.current,
            anchors: anchorsRef.current,
            getCollisionBox: (sku) => getModel(sku)?.collisionBox,
        })

    const commit = () => {
        nodeRef.current?.setNativeProps({
            position: lastValid.current.position,
            rotation: [0, lastValid.current.rotationY, 0],
        })
        onCommit(object.id, {
            position: lastValid.current.position,
            rotation: [0, lastValid.current.rotationY, 0],
        })
    }

    const handleClickState = (state) => {
        if (state === CLICK_TAP) onSelect(object.id)
        // Fin de cualquier interacción táctil sobre el objeto seleccionado:
        // confirmar la última transformación válida
        if (state === CLICK_UP && selected) commit()
    }

    const handleDrag = (dragToPos) => {
        if (obstructed(dragToPos, lastValid.current.rotationY)) {
            nodeRef.current?.setNativeProps({ position: lastValid.current.position })
            onObstruction()
        } else {
            lastValid.current.position = dragToPos
        }
    }

    const handleRotate = (rotateState, rotationFactor) => {
        if (rotateState === GESTURE_BEGIN) {
            gestureBaseY.current = lastValid.current.rotationY
            return
        }
        if (rotateState === GESTURE_END) {
            commit()
            return
        }
        const candidateY = gestureBaseY.current + rotationFactor
        if (obstructed(lastValid.current.position, candidateY)) {
            onObstruction()
        } else {
            lastValid.current.rotationY = candidateY
            nodeRef.current?.setNativeProps({ rotation: [0, candidateY, 0] })
        }
    }

    return (
        <ViroNode
            ref={nodeRef}
            position={object.position}
            rotation={object.rotation}
            onClickState={handleClickState}
            onDrag={selected && mode === 'move' ? handleDrag : undefined}
            dragType="FixedToPlane"
            dragPlane={{
                planePoint: [0, floorY, 0],
                planeNormal: [0, 1, 0],
                maxDistance: 8,
            }}
            onRotate={selected ? handleRotate : undefined}
        >
            <Viro3DObject
                source={model.source}
                type="GLB"
                scale={model.scale}
                opacity={selected ? 0.85 : 1}
            />
        </ViroNode>
    )
}
