import { ActivityIndicator, FlatList, Text, View } from "react-native"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "expo-router"

import { AnimatedProductCard } from "../ui/ProductCard"
import { COLORS } from "../../constants/theme"
import { fetchCollectionProduct } from "../../services/collectionsService"
import { mapCollectionError } from "../../constants/authErrors"
import ErrorModal from "../modals/ErrorModal"
import { logoutUser } from "../../services/authService"

const PAGE_SIZE = 10

// Mismo resguardo que ProductsList.jsx: si la API devuelve algo que no es
// un array plano, se degrada a "sin resultados" en vez de crashear al
// spread/mapear.
const toProductArray = (value) => {
    if (Array.isArray(value)) return value
    console.error('Se esperaba un array de productos de colección y llegó otra cosa:', value)
    return []
}

/**
 * Grilla paginada con TODOS los productos de una colección. A diferencia de
 * la preview de CollectionSection (que pide unos pocos sin querer scrollear
 * infinito ahí mismo), esta pantalla sí pagina con scroll infinito para
 * poder recorrer colecciones grandes completas.
 */
export default function CollectionDetail({ collectionId }) {
    const router = useRouter()
    const [products, setProducts] = useState([])
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [isAuthError, setIsAuthError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const loadPage = useCallback(
        async (targetPage) => {
            setLoading(true)
            try {
                const items = toProductArray(
                    await fetchCollectionProduct(collectionId, PAGE_SIZE, targetPage),
                )
                setProducts((prev) => (targetPage === 0 ? items : [...prev, ...items]))
                setHasMore(items.length === PAGE_SIZE)
                setPage(targetPage)
            } catch (e) {
                console.error('No se pudieron cargar los productos de la colección', e)
                if (e.status === 401) setIsAuthError(true)
                setErrorMessage(mapCollectionError(e))
                setShowErrorModal(true)
            } finally {
                setLoading(false)
            }
        },
        [collectionId],
    )

    useEffect(() => {
        loadPage(0)
    }, [loadPage])

    const loadMore = () => {
        if (loading || !hasMore) return
        loadPage(page + 1)
    }

    return (
        <>
            <FlatList
                data={products}
                keyExtractor={(item) => item.model}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ gap: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                onEndReachedThreshold={0.5}
                onEndReached={loadMore}
                ListFooterComponent={() =>
                    loading ? (
                        <View className="items-center justify-center py-6">
                            <ActivityIndicator size="large" color={COLORS.copper} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={() =>
                    !loading ? (
                        <Text className="mt-4 text-center text-sm text-stone-500 dark:text-stone-400">
                            Todavía no hay productos en esta colección.
                        </Text>
                    ) : null
                }
                renderItem={({ item, index }) => (
                    <AnimatedProductCard
                        index={index % 10}
                        resetKey={0}
                        item={item}
                        topVariation={item.variations?.find((v) => v.top)}
                    />
                )}
            />
            <ErrorModal
                error={errorMessage}
                visible={showErrorModal}
                onClose={() => {
                    setShowErrorModal(false)
                    if (isAuthError) {
                        logoutUser()
                        router.replace("/view/login")
                    }
                }}
            />
        </>
    )
}
