/**
 * Registro de modelos 3D para la vista AR, indexado por el `id` del producto
 * en catalogData. Las fuentes remotas son placeholders (glTF Sample Models de
 * Khronos); al tener los modelos reales, cambiar `source` por
 * require('../assets/models/<archivo>.glb') y añadir 'glb' a
 * `resolver.assetExts` en metro.config.js.
 *
 * Escala 1:1: ARCore trabaja en METROS. Los .glb deben exportarse con
 * unidades en metros para que `scale: [1, 1, 1]` sea tamaño real; solo se
 * ajusta si el modelo viene en otra unidad 
 *
 * `collisionBox` es la caja de colisión [ancho, alto, fondo] en metros que usa
 * el motor de física para detectar obstrucciones; debe aproximar el volumen
 * real del mueble.
 */
export const AR_MODELS = {
  'sillon-siena': {
    source: {
      uri: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/SheenChair/glTF-Binary/SheenChair.glb',
    },
    scale: [1, 1, 1],
    collisionBox: [0.8, 0.95, 0.85],
  },
  'lounge-sienna': {
    source: {
      uri: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/SheenChair/glTF-Binary/SheenChair.glb',
    },
    scale: [1, 1, 1],
    collisionBox: [0.9, 0.9, 0.9],
  },
  'sillon-contour': {
    source: {
      uri: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/SheenChair/glTF-Binary/SheenChair.glb',
    },
    scale: [1, 1, 1],
    collisionBox: [0.85, 0.9, 0.85],
  },
}

/**
 * Distancia (m) frente a la cámara donde aparece un mueble como respaldo
 * cuando el hit test no intersecta ningún plano detectado.
 */
export const SPAWN_DISTANCE = 1.5
