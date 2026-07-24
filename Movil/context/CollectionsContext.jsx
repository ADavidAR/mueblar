import { createContext, useState, useEffect, useCallback, useMemo } from 'react'

import {
    fetchCollections,
    createCollection as createCollectionRequest,
    addProductToCollection,
    deleteProductFromCollection,
    deleteCollection as deleteCollectionRequest,
} from '../services/collectionsService'

/**
 * Estado global de colecciones y favoritos.
 *
 * Se carga una vez desde /api/collections y se mantiene en memoria: los
 * corazones de favorito y los modales de "Guardar en colección" se muestran
 * en muchos lugares a la vez, así que necesitan un estado compartido (no
 * refetch por componente) con actualización optimista para que tocar el
 * corazón se sienta instantáneo. Si la mutación falla, se recarga desde el
 * server para no quedar desincronizados.
 */

export const CollectionsContext = createContext(null)

// La API devuelve {id, title, products: [{model}], borrable}; se adapta
// a la forma que  usan los componentes ({id, name, productIds, removable}).
const normalize = (raw) => ({
    id: raw.id,
    name: raw.title,
    removable: raw.borrable,
    productIds: raw.products.map((p) => p.model),
})

export function CollectionsProvider({ children }) {
    const [collections, setCollections] = useState([])

    const reload = useCallback(() => {
        fetchCollections()
            .then((raw) => setCollections(raw.map(normalize)))
            .catch((e) => console.error('No se pudieron cargar las colecciones', e))
    }, [])

    useEffect(() => {
        reload()
    }, [reload])

    const favorites = useMemo(() => collections.find((c) => c.removable === false), [collections])

    const isFavorite = useCallback(
        (productId) => !!favorites?.productIds.includes(productId),
        [favorites]
    )

    const toggleFavorite = useCallback(
        (productId) => {
            if (!favorites) return
            const has = favorites.productIds.includes(productId)

            setCollections((prev) =>
                prev.map((c) =>
                    c.id !== favorites.id
                        ? c
                        : {
                            ...c,
                            productIds: has
                                ? c.productIds.filter((id) => id !== productId)
                                : [...c.productIds, productId],
                    }
                )
            )

            const request = has
                ? deleteProductFromCollection(favorites.id, productId)
                : addProductToCollection(favorites.id, productId)
            request.catch((e) => {
                console.error('No se pudo actualizar Favoritos', e)
                reload()
            })
        },
        [favorites, reload]
    )

    const addToCollection = useCallback(
        (collectionId, productId) => {
            setCollections((prev) =>
                prev.map((c) =>
                    c.id === collectionId && !c.productIds.includes(productId)
                        ? { ...c, productIds: [...c.productIds, productId] }
                        : c,
                ),
            )
            addProductToCollection(collectionId, productId).catch((e) => {
                console.error('No se pudo agregar a la colección', e)
                reload()
            })
        },
        [reload]
    )

    const removeFromCollection = useCallback(
        (collectionId, productId) => {
            setCollections((prev) =>
                prev.map((c) =>
                    c.id === collectionId
                        ? { ...c, productIds: c.productIds.filter((id) => id !== productId) }
                        : c,
                ),
            )
            deleteProductFromCollection(collectionId, productId).catch((e) => {
                console.error('No se pudo quitar de la colección', e)
                reload()
            })
        },
        [reload]
    )

    const createCollection = useCallback(
        (name) => {
            const trimmed = name.trim()
            if (!trimmed) return
            createCollectionRequest(trimmed)
                .then(reload)
                .catch((e) => console.error('No se pudo crear la colección', e))
        },
        [reload]
    )

    const deleteCollection = useCallback(
        (collectionId) => {
            setCollections((prev) =>
                prev.filter((c) => c.id !== collectionId || c.removable === false),
            )
            deleteCollectionRequest(collectionId).catch((e) => {
                console.error('No se pudo eliminar la colección', e)
                reload()
            })
        },
        [reload]
    )

    const value = useMemo(
        () => ({
            collections,
            isFavorite,
            toggleFavorite,
            addToCollection,
            removeFromCollection,
            createCollection,
            deleteCollection,
        }),
        [
            collections,
            isFavorite,
            toggleFavorite,
            addToCollection,
            removeFromCollection,
            createCollection,
            deleteCollection,
        ]
    )

    return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>
}
