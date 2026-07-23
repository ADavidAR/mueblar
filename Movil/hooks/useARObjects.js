import { useCallback, useEffect, useRef, useState } from 'react'
import * as SecureStore from 'expo-secure-store'

const STORAGE_KEY = 'ar.scene'
const SAVE_DELAY_MS = 800

let nextId = 1

/**
 * Estado de la escena AR: lista de muebles colocados con su transformación
 * (posición [x, y, z] y rotación [rx, ry, rz] en el mundo) y el objeto
 * seleccionado. Solo el objeto seleccionado acepta gestos, lo que limita la
 * manipulación a un modelo a la vez.
 *
 * Persistencia: la escena se guarda (con debounce) en SecureStore y se
 * restaura al montar, de modo que las coordenadas sobreviven entre sesiones.
 * Nota: los anclajes de ARCore no persisten entre sesiones, así que las
 * posiciones restauradas son relativas al origen de la sesión nueva.
 */
export function useARObjects() {
    const [objects, setObjects] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const saveTimer = useRef(null)

    const persist = useCallback((next) => {
        clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
            SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next)).catch(() => {})
        }, SAVE_DELAY_MS)
    }, [])

    useEffect(() => {
        let cancelled = false
        SecureStore.getItemAsync(STORAGE_KEY).then((raw) => {
            if (cancelled || !raw) return
            try {
                const saved = JSON.parse(raw)
                const migrated = saved.filter((o) => !!o.sku)
                if (migrated.length !== saved.length) persist(migrated)

                nextId = migrated.reduce((max, o) => Math.max(max, o.id), 0) + 1
                setObjects(migrated)
            } catch {
                // Estado corrupto: se descarta y la escena arranca vacía
            }
        })
        return () => {
            cancelled = true
        }
    }, [persist])

    const addObject = useCallback(
        (productId, sku , position) => {
            setObjects((prev) => {
                const obj = { id: nextId++, productId, sku, position, rotation: [0, 0, 0] }
                const next = [...prev, obj]
                persist(next)
                setSelectedId(obj.id)
                return next
            })
        },
        [persist],
    )
    
    const updateTransform = useCallback(
        (id, transform) => {
            setObjects((prev) => {
                const next = prev.map((o) => (o.id === id ? { ...o, ...transform } : o))
                persist(next)
                return next
            })
        },
        [persist],
    )

    const removeObject = useCallback(
        (id) => {
            setObjects((prev) => {
                const next = prev.filter((o) => o.id !== id)
                persist(next)
                return next
            })
            setSelectedId((sel) => (sel === id ? null : sel))
        },
        [persist],
    )

    const clearScene = useCallback(() => {
        setObjects([])
        setSelectedId(null)
        persist([])
    }, [persist])

    return {
        objects,
        selectedId,
        selectObject: setSelectedId,
        addObject,
        updateTransform,
        removeObject,
        clearScene,
    }
}
