import { ActivityIndicator, FlatList, Text, View, RefreshControl } from "react-native"
import { useCallback, useEffect, useRef, useState } from "react"

import { AnimatedProductCard } from "../ui/ProductCard"
import { PRODUCTS_FETCHING } from "../../constants/products"
import { COLORS } from "../../constants/theme"
import { useFilters } from "../../hooks/useFilters"
import SerifText from "../ui/SerifText"

export default function ProductsList({ loadKey }) {
    const { getFilteredProduucts } = useFilters()
    const [products, setProducts] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    //const [shouldReset, setShouldReset] = useState(false)
    const [ resetKey, setResetKey ] = useState(0)
    const flatListRef = useRef(null)
    
    const loadMoreItems = useCallback(  async () => {
        if (loading || !hasMore) return
        setLoading(true)
        try {
            const newItems = await getFilteredProduucts(page) 
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
    }, [hasMore, loading, page, getFilteredProduucts])

    const handleRefresh = useCallback( async () => {
        setResetKey(prev => prev + 1)
        setRefreshing(true)
        setHasMore(true)
        try {
            const freshItems = await getFilteredProduucts(0)
            if (freshItems.length === 0) {
                setHasMore(false)
            } else {
                setProducts(freshItems)
            }
        } catch (error) {
            console.error("Error reloading data:", error)
        } finally {
            setRefreshing(false)
            setPage(1)
        }
    }, [getFilteredProduucts, resetKey, loadKey])

    useEffect(() => {
        const initialLoad = async () => {
            flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,

            })
            setResetKey(prev => prev + 1)
            setHasMore(true)
            try {
                const newItems = await getFilteredProduucts(0)
                if (newItems.length === 0) {
                    setHasMore(false)
                } else {
                    setProducts(newItems)
                }
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setLoading(false)
                setPage(1)
            }
        }
        initialLoad()
    },[loadKey, getFilteredProduucts]) 

    const renderFooter = () => {
        if (!loading) return null
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={COLORS.copper} />
            </View>
        )
    }

    return (
        <View className="z-0 flex-1 bg-sand dark:bg-surface">

            <FlatList
                ref={flatListRef}
                onEndReachedThreshold={0.5}
                onEndReached={loadMoreItems}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={["#b5745a"]}
                        tintColor={"#b5745a"}

                    />
                }

                ListHeaderComponent={() => (
                    <View className="bg-sand dark:bg-surface pt-4 pb-6">
                        <SerifText className="text-6xl font-bold text-stone-900 dark:text-stone-50">
                            Catálogo
                        </SerifText>
                        <Text className="mt-3 text-base leading-6 text-stone-500 dark:text-stone-400">
                            Siluetas escultóricas y materiales orgánicos
                            para el santuario moderno. Experimenta el
                            diseño en tu espacio.
                        </Text>
                    </View>
                )}
                ListFooterComponent={renderFooter}
                data={products}
                extraData={products}
                keyExtractor={(item) => item.model}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ gap: 20, paddingBottom: 110 }}
                renderItem={({ item, index }) => {
                    const topVariation = item.variations.find(v => v.top)
                    return (
                        <AnimatedProductCard 
                            index={index % 10}
                            resetKey={resetKey}
                            item={item}
                            topVariation={topVariation}
                        />
                    )
                }}
            />
        </View>
    )
}