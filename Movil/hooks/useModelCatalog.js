import { useEffect, useRef, useState } from 'react'
import { fetchSingleProduct, fetchSingleVariation } from '../services/inventoryService'

import products from '../mocks/products.json'
/**
 * Cache en memoria de datos de modelo 3D por SKU, resuelto contra
 * `fetchSingleVariation(model, sku)`. Se completa la primera vez que un SKU
 * aparece en `skus` y a partir de ahí se lee de forma síncrona (colisiones,
 * render) sin volver a pedirlo a la API.
 */
export function useModelCatalog(skus) {
    const cacheRef = useRef(new Map())
    const loadingRef = useRef(new Set())
    const [, setRerenderKey] = useState(0)

    useEffect(() => {
        const pending = skus.filter(
            ({ sku }) => sku && !cacheRef.current.has(sku) && !loadingRef.current.has(sku),
        )
        pending.forEach(async ({ model, sku }) => {
            loadingRef.current.add(sku)
            try {
                // const variation = await fetchSingleVariation(model, sku)
                // const { description } = await fetchSingleProduct(model)
                const product = products.find((p) => p.model === model)
                const variation = product?.variations.find((v) => v.sku === sku)
                const { description } = product 
                if (!variation) throw new Error(`Variación no encontrada: ${model} / ${sku}`)
                cacheRef.current.set(sku, {
                    source: { uri: variation.model_3d },
                    name: variation.name,
                    description: description,
                    thumbnail: variation.thumbnail,
                    price: variation.price,
                    scale: variation.instance_params?.scale ?? [1, 1, 1],
                    collisionBox: variation.instance_params?.collisionBox,
                })
            } catch (e) {
                console.error('No se pudo cargar el modelo 3D', sku, e)
            } finally {
                loadingRef.current.delete(sku)
                setRerenderKey((v) => v + 1)
            }
        })
    }, [skus])

    return (sku) => cacheRef.current.get(sku)
}
