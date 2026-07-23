/**
 * Detección de obstrucciones espaciales por AABB (cajas alineadas a ejes, Axis-Aligned Bounding Box).
 *
 * Cada mueble trae su `collisionBox` [ancho, alto, fondo] en metros (de
 * `instance_params` de la variación, resuelto por quien llama — este módulo
 * no conoce el catálogo). Como los muebles solo rotan sobre Y, la huella
 * rotada (rectángulo w×d girado B) se envuelve en su AABB exacta.
 */

const DEG_TO_RAD = Math.PI / 180
const WALL_THICKNESS = 0.05
// Extensión mínima que se asume para un plano vertical recién detectado,
// cuando ARCore aún reporta un parche pequeño de la pared real
const WALL_MIN_WIDTH = 0.5
const WALL_MIN_HEIGHT = 1.5

/** AABB {min, max} de una caja centrada en `center` y girada sobre Y. */
export function getAABBFromCenter(center, size, rotationYDeg = 0) {
    const [w, h, d] = size
    const th = rotationYDeg * DEG_TO_RAD
    const cos = Math.abs(Math.cos(th))
    const sin = Math.abs(Math.sin(th))
    const halfW = (w * cos + d * sin) / 2
    const halfD = (w * sin + d * cos) / 2
    const [x, y, z] = center
    return {
        min: [x - halfW, y - h / 2, z - halfD],
        max: [x + halfW, y + h / 2, z + halfD],
    }
}

/**
 * AABB de un mueble apoyado en `position` (la base del modelo toca ese punto,
 * como lo deja el anclaje al suelo).
 */
export function getAABB(position, collisionBox, rotationYDeg = 0) {
    const [x, y, z] = position
    const h = collisionBox[1]
    return getAABBFromCenter([x, y + h / 2, z], collisionBox, rotationYDeg)
}

/** true si las cajas se solapan en los tres ejes. */
export function aabbOverlap(a, b) {
    return (
        a.min[0] < b.max[0] &&
        a.max[0] > b.min[0] &&
        a.min[1] < b.max[1] &&
        a.max[1] > b.min[1] &&
        a.min[2] < b.max[2] &&
        a.max[2] > b.min[2]
    )
}

/**
 * true si un mueble con `collisionBox` colocado en `position` con giro
 * `rotationY` se superpondría con otro mueble de la escena o con una pared
 * detectada.
 *
 * - `objects`: array de objetos colocados ({ id, productId, sku, position,
 *   rotation }); se omite el propio `objectId`.
 * - `getCollisionBox(sku)`: resuelve el `collisionBox` de cada uno de esos
 *   `objects` (viene del catálogo de modelos, que este módulo no conoce).
 * - `anchors`: Map de planos detectados por ARCore ({ alignment, position,
 *   rotationY, width, height }); solo los verticales obstruyen — el suelo y
 *   las mesas no bloquean el deslizamiento.
 */
export function isObstructed({ position, rotationY, objectId, collisionBox, objects, anchors, getCollisionBox }) {
    if (!collisionBox) return false
    const candidate = getAABB(position, collisionBox, rotationY)

    for (const other of objects) {
        if (other.id === objectId) continue

        const otherBox = getCollisionBox(other.sku)
        if (!otherBox) continue

        const otherAABB = getAABB(other.position, otherBox, other.rotation[1])
        if (aabbOverlap(candidate, otherAABB)) return true
    }

    if (anchors) {
        for (const anchor of anchors.values()) {
            if (anchor.alignment !== 'Vertical') continue
            const wall = getAABBFromCenter(
                anchor.position,
                [
                    Math.max(anchor.width, WALL_MIN_WIDTH),
                    Math.max(anchor.height, WALL_MIN_HEIGHT),
                    WALL_THICKNESS,
                ],
                anchor.rotationY,
            )
            if (aabbOverlap(candidate, wall)) return true
        }
    }

    return false
}

/**
 * Punto libre más cercano a `position` para instanciar un mueble nuevo sin
 * superponerlo a los existentes: prueba el punto pedido y, si está ocupado,
 * anillos concéntricos cada vez más amplios. Devuelve null si no hay hueco
 * en un radio de 2 m.
 */
export function findFreeSpot({ position, collisionBox, objects, anchors, getCollisionBox }) {
    const RING_STEP = 0.4
    const MAX_RADIUS = 2
    const DIRECTIONS = 8

    const free = (candidate) =>
        !isObstructed({
            position: candidate,
            rotationY: 0,
            objectId: null,
            collisionBox,
            objects,
            anchors,
            getCollisionBox,
        })

    if (free(position)) return position

    for (let radius = RING_STEP; radius <= MAX_RADIUS; radius += RING_STEP) {
        for (let i = 0; i < DIRECTIONS; i++) {
            const angle = (i * 2 * Math.PI) / DIRECTIONS
            const candidate = [
                position[0] + radius * Math.cos(angle),
                position[1],
                position[2] + radius * Math.sin(angle),
            ]
            if (free(candidate)) return candidate
        }
    }
    return null
}
