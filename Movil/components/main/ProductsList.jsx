import { ActivityIndicator, FlatList, Text, View } from "react-native"
import { useCallback, useEffect, useState } from "react"

import ProductCard from "../ui/ProductCard"
import data from "../../mocks/products.json"
import { fetchProducts } from "../../services/productsService"
import { PRODUCTS_FETCHING } from "../../constants/products"
import { COLORS } from "../../constants/theme"

export default function ProductsList({ 
    search = "",
    categories = undefined,
    materials = undefined 
}) {
    const [products, setProducts] = useState([])
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const loadMoreItems = useCallback(  async () => {
        if (loading || !hasMore) return
        setLoading(true)
        try {
            const newItems = data.slice(page * PRODUCTS_FETCHING.limit, (page + 1) * PRODUCTS_FETCHING.limit ) /*await fetchProducts(
                search,
                PRODUCTS_FETCHING.limit,
                page * PRODUCTS_FETCHING.limit,
                PRODUCTS_FETCHING.select,
                categories,
                materials
            ) */
            if (newItems.length === 0) {
                setHasMore(false)
            } else {
                setProducts(prevData => [...prevData, ...newItems])
                setPage(prevPage => prevPage + 1)
            }
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }, [hasMore, loading, page,/* search, categories, materials, data*/])

    useEffect(() => {
        const initialLoad = async () => {
            try {
                const newItems = data.slice(0, PRODUCTS_FETCHING.limit)/*await fetchProducts(
                    search,
                    PRODUCTS_FETCHING.limit,
                    0,
                    PRODUCTS_FETCHING.select,
                    categories,
                    materials
                ) */
                if (newItems.length === 0) {
                    setHasMore(false)
                } else {
                    setProducts(prevData => [...prevData, ...newItems])
                    setPage(prevPage => prevPage + 1)
                }
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setLoading(false)
            }
        }

        initialLoad()
    },[ /*search, categories, materials*/]) 

    const renderFooter = () => {
        if (!loading) return null
        console.log("footer rendered")
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={COLORS.copper} />
            </View>
        )
    }

    return (
        <View className="z-0 bg-stone-50 dark:bg-surface">
            
            <FlatList
                onEndReachedThreshold={0.5}
                onEndReached={loadMoreItems}

                ListHeaderComponent={() => (
                    <View className="z-0 bg-stone-50 dark:bg-surface items-center">
                        <Text className="color-slate-50 my-5" >Catalogo</Text>
                        <Text className="color-slate-50 my-5">
                            Siluetas escultóricas y materiales orgánicos
                            para el santuario moderno. Experimenta el
                            diseño en tu espacio.
                        </Text>
                    </View>
                )}
                ListFooterComponent={renderFooter}
                data={products}
                keyExtractor={(item) => item.model}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ gap: 16 }}
                renderItem={({ item }) => {
                    const topVariation = item.variations.find(v => v.top)
                    return (
                        <ProductCard item={item} topVariation={topVariation}/>
                    )
                }}
            />
        </View>
    )
}