import { useEffect, useState } from 'react'
import { View, Text, Image, Pressable } from 'react-native'
import { useRouter } from 'expo-router'

import SerifText from '../ui/SerifText'
import { CouchIcon, HeartSolidIcon, TrashIcon, PlusIcon } from '../Icons'
import { fetchCollectionProduct } from '../../services/collectionsService'

/**
 * `CollectionsContext` solo trae `productIds` (refs livianas, sin datos de
 * catálogo) para pintar el thumbnail hay que pedir los productos de ESTA
 * colección puntual contra `fetchCollectionProduct`, que resuelve cada uno a
 * su variación top.
 */
export default function CollectionSection({ collection, onProbarAR, onDelete }) {
    const router = useRouter()
    const [ items, setItems ] = useState([])
    const isFavorites = collection.removable === false

    useEffect(() => {
        let cancelled = false
        fetchCollectionProduct(collection.id)
            .then((resolved) => {
                if (!cancelled) setItems(resolved.slice(0, 3))
            })
            .catch((e) => console.error('No se pudieron cargar los productos de la colección', e))
        return () => {
            cancelled = true
        }
    }, [collection.id, collection.productIds])

    return (
        <View className="mb-9">
            <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                    <View className="h-5 w-1 rounded-full bg-copper" />
                        {isFavorites ? <HeartSolidIcon size={16} /> : <CouchIcon size={16} />}
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
                    <Image source={{ uri: p.thumbnail }} className="h-full w-full" resizeMode="cover" />
                </Pressable>
                ))}
                {/* Hueco para añadir más piezas */}
                <Pressable
                    onPress={() => router.push('/catalog')}
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
                onPress={onProbarAR}
                className="flex-row items-center justify-center gap-2 rounded-full bg-copper py-3.5 active:opacity-80"
            >
                <CouchIcon size={14} color="#ffffff" />
                <Text className="text-sm font-semibold uppercase tracking-[1px] text-white">
                    Probar en AR
                </Text>
            </Pressable>
        </View>
    )
}
