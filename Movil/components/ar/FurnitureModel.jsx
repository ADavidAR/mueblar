import { useRef } from 'react'
import { Viro3DObject, ViroNode } from '@reactvision/react-viro'

import { AR_MODELS } from '../../mocks/arModels'
import { isObstructed } from './collision'

// Estados de gesto de Viro (onRotate): 1 = inicio, 2 = en curso, 3 = fin
const GESTURE_BEGIN = 1
const GESTURE_END = 3
// Estados de onClickState: 1 = dedo abajo, 2 = dedo arriba, 3 = tap completo
const CLICK_UP = 2
const CLICK_TAP = 3

/**
 * Un mueble instanciado en la escena AR, con transformación de doble registro:
 *
 * - `object.position` / `object.rotation` transformación CONFIRMADA. Viro la aplica como prop, de modo que los
 *   muebles NO seleccionados quedan bloqueados en su posición absoluta.
 * - Durante un gesto el nodo se mueve en el lado nativo (el drag de Viro no
 *   pasa por React en cada frame). Cada evento se valida contra la lógica de
 *   colisiones AABB: si el punto está libre se registra en `lastValid`; si
 *   está ocupado, el nodo se re-fija con setNativeProps a la última
 *   transformación libre — el mueble no puede atravesar otro modelo ni una
 *   pared detectada.
 * - Al soltar (CLICK_UP tras drag, o fin del gesto de rotación) se confirma
 *   `lastValid` al estado del padre, que lo persiste.
 *
 * Traslación: dragType="FixedToPlane" restringe el arrastre al plano del
 * suelo detectado (planeNormal Y), cumpliendo "trasladar sobre el plano
 * horizontal". Rotación: gesto de dos dedos (twist) sobre el eje Y propio.
 *
 * Escala: fija en la del modelo (metros reales). No se implementa onPinch a
 * propósito — escalar rompería la promesa 1:1 del catálogo.
 */
export default function FurnitureModel({
  object,
  selected,
  floorY,
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

  const model = AR_MODELS[object.productId]
  if (!model) return null

  const obstructed = (position, rotationY) =>
    isObstructed({
      position,
      rotationY,
      objectId: object.id,
      modelId: object.productId,
      objects: objectsRef.current,
      anchors: anchorsRef.current,
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
    // El twist no rota el nodo por sí solo: se aplica manualmente si el
    // volumen rotado no invade otro objeto
    const candidateY = gestureBaseY.current - rotationFactor
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
      onDrag={selected ? handleDrag : undefined}
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
