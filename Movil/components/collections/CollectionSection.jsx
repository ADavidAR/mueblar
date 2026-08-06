import { useEffect, useState } from 'react'
import { View, Text, Image, Pressable } from 'react-native'
import { useRouter } from 'expo-router'

import SerifText from '../ui/SerifText'
import { CouchIcon, TrashIcon, PlusIcon, FilledHeartIcon, XIcon } from '../Icons'
import { fetchCollectionProduct } from '../../services/collectionsService'
import { useCollections } from '../../hooks/useCollections'
import { mapCollectionError } from '../../constants/authErrors'
import ErrorModal from '../modals/ErrorModal'
import { logoutUser } from '../../services/authService'

// Cuántos productos se piden para la preview — a propósito NO "todos" (ver
// CollectionDetail.jsx para eso, con paginación real).
const PREVIEW_LIMIT = 4

// Mismo resguardo que ProductsList.jsx: si la API devuelve algo que no es
// un array plano, se degrada a "sin resultados" en vez de crashear al mapear.
const toProductArray = (value) => {
    if (Array.isArray(value)) return value
    console.error('Se esperaba un array de productos de colección y llegó otra cosa:', value)
    return []
}

/**
 * `CollectionsContext` solo trae `productIds` (refs livianas, sin datos de
 * catálogo) para pintar el thumbnail hay que pedir los productos de ESTA
 * colección puntual contra `fetchCollectionProduct`, que resuelve cada uno a
 * su variación top. Acá solo se pide una preview chica (`PREVIEW_LIMIT`);
 * para ver la colección completa está el botón "Ver toda la colección" →
 * CollectionDetail.jsx, que sí pagina.
 */
export default function CollectionSection({ collection, onDelete }) {
    const router = useRouter()
    const { removeFromCollection } = useCollections()
    const [ items, setItems ] = useState([])
    const isFavorites = collection.removable === false
    const [showErrorModal, setShowErrorModal ] = useState(false)
    const [ isAuthError, setIsAuthError ] = useState(false)
    const [errorMessage, setErrorMessage ] = useState("")

    useEffect(() => {
        let cancelled = false
        fetchCollectionProduct(collection.id, PREVIEW_LIMIT, 0)
            .then((resolved) => {
                if (!cancelled) setItems(toProductArray(resolved))
            })
            .catch((e) => {
                console.error('No se pudieron cargar los productos de la colección', e)
                if ( e.status === 401 ) {
                    setIsAuthError(true)
                }
                setErrorMessage(mapCollectionError(e))
                setShowErrorModal(true)
            })
        return () => {
            cancelled = true
        }
    }, [collection.id, collection.productIds])

    return (
        <>
        <View className="mb-9">
            <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                    <View className="h-5 w-1 rounded-full bg-copper" />

                        {isFavorites ? <FilledHeartIcon size={16} /> : <CouchIcon size={16} />}
                    <Text className="text-sm font-semibold uppercase tracking-[1.5px] text-copper">
                        {isFavorites ? 'Favoritos' : 'Colección'}
                    </Text>
                </View>
                {collection.removable ? (
                    <Pressable
                        onPress={onDelete}
                        hitSlop={8}
                        className="h-8 w-8 items-center justify-center rounded-full bg-red-500/10 active:opacity-70"
                    >
                        <TrashIcon size={14} />
                    </Pressable>
                ) : null}
            </View>

            <View className="flex-row flex-wrap gap-3">
                {items.map((p) => (
                    <Pressable
                        key={p.model}
                        onPress={() => router.push(`/view/product-details/${p.model}`)}
                        className="h-28 overflow-hidden rounded-2xl bg-stone-200 dark:bg-stone-800"
                        style={{ width: '47%' }}
                    >
                        <Image source={{ uri: p?.variations?.find(v => v.top)?.thumbnail }} className="h-full w-full" resizeMode="cover" />
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation()
                                removeFromCollection(collection.id, p.model)
                            }}
                            hitSlop={8}
                            className="absolute top-1.6 right-1.5 h-8 w-8 mt-1 ml-1  items-center justify-center rounded-full shadow-sm shadow-black/40 active:opacity-70"
                            style={{ backgroundColor: '#ef4444' }}
                        >
                            <XIcon color="#ffffff" size={16} />
                        </Pressable>
                    </Pressable>
                ))}
                {/* Hueco para añadir más piezas */}
                <Pressable
                    onPress={() => router.push('/view/catalog')}
                    className="h-28 items-center justify-center rounded-2xl border border-dashed border-stone-300 active:opacity-70 dark:border-stone-700"
                    style={{ width: '47%' }}
                >
                    <PlusIcon size={20} color="#a8a29e" />
                </Pressable>
            </View>

            <Text className="mt-4 text-[10px] uppercase tracking-[2px] text-stone-400">Colección:</Text>
            <SerifText className="mb-3 text-2xl text-stone-900 dark:text-stone-50">
                {collection.name}
            </SerifText>

            <Pressable
                onPress={() =>
                    router.push({
                        pathname: `/view/collection/${collection.id}`,
                        params: { name: collection.name },
                    })
                }
                className="mb-10 flex-row items-center justify-center gap-2 rounded-full border border-copper py-3 active:opacity-70"
            >
                <Text className="text-sm font-semibold uppercase tracking-[1px] text-copper">
                    Ver toda la colección
                </Text>
            </Pressable>

            {/* <Pressable
                onPress={onProbarAR}
                className="flex-row items-center justify-center gap-2 rounded-full bg-copper py-3.5 active:opacity-80"
            >
                <CouchIcon size={14} color="#ffffff" />
                <Text className="text-sm font-semibold uppercase tracking-[1px] text-white">
                    Probar en AR
                </Text>
            </Pressable> */}
        </View>
        <ErrorModal
            error={errorMessage}
            visible={showErrorModal}
            onClose={() => {
                setErrorMessage("")
                setShowErrorModal(false)
                if(isAuthError) {
                    logoutUser()
                    router.replace("/view/login")
                }
            }} 
        />
        </>
    )
}
