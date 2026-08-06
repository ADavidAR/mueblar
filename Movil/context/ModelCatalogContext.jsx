import { createContext, useCallback, useRef, useState } from 'react'

import products from '../mocks/products.json'
import { fetchSingleProduct, fetchSingleVariation } from '../services/inventoryService'

export const ModelCatalogContext = createContext(null)

/**
 * Cache compartido de datos de modelo 3D por SKU (`{source, name,
 * description, thumbnail, price, scale, collisionBox}`).
 *
 * TEMPORAL: resuelve contra `mocks/products.json` en vez de la API
 * (`fetchSingleVariation`/`fetchSingleProduct`) mientras el backend no está
 * disponible.
 */
export function ModelCatalogProvider({ children }) {
    const cachedModels = useRef(new Map())
    const loadingRef = useRef(new Set())
    const [, setVersion] = useState(0)

    const resolve = useCallback((skus) => {
        const pending = skus.filter(
            ({ sku }) => sku && !cachedModels.current.has(sku) && !loadingRef.current.has(sku),
        )
        pending.forEach(async ({ model, sku }) => {
            loadingRef.current.add(sku)
            try {
                const variation = await fetchSingleVariation(model, sku)
                if (!variation) throw new Error(`Variación no encontrada: ${model} / ${sku}`)

                cachedModels.current.set(sku, {
                    source: { uri: variation.model_3d },
                    name: variation.name,
                    thumbnail: variation.thumbnail,
                    price: variation.price,
                    scale: variation.instance_params?.scale ?? [1, 1, 1],
                    collisionBox: variation.instance_params?.collisionBox,
                })
            } catch (e) {
                console.error('No se pudo cargar el modelo 3D', sku, e)
            } finally {
                loadingRef.current.delete(sku)
                setVersion((v) => v + 1)
            }
        })
    }, [])

    const getModel = useCallback((sku) => cachedModels.current.get(sku), [])

    return (
        <ModelCatalogContext.Provider value={{ resolve, getModel }}>
            {children}
        </ModelCatalogContext.Provider>
    )
}
