import { FlatList, Pressable, Text, TextInput, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useCallback, useEffect, useState } from "react"
import Modal from "react-native-modal"

import cat from "../../mocks/categories.json"
import mat from "../../mocks/materials.json"

import { ChevronDownIcon, ChevronUpIcon, CircleCheckIcon, SearchIcon } from "../Icons"
import { COLORS } from "../../constants/theme"
import { useTheme } from "../../context/ThemeContext"
import Checkbox from "../ui/Checkbox"
import { useFilters } from "../../hooks/useFilters"
import { fetchCategories, fetchMaterials } from "../../services/inventoryService"

export default function SearchModal({
    visible,
    onHide,
    onSearch
}) {
    const { filters, setFilters } = useFilters()
    const insets = useSafeAreaInsets()
    const { isDark } = useTheme()
    const [ isAtEnd, setIsAtEnd ] = useState (() => ({categories: false, materials: false}) )
    const [ categories, setCategories ] = useState([])
    const [ materials, setMaterials ] = useState([])
    useEffect(() =>{
        const loadCategoriesMaterials =async () => {
            const newCats = cat//await fetchCategories()
            const newMats = mat//await fetchMaterials()
            setCategories(newCats)
            setMaterials(newMats)
        }
        loadCategoriesMaterials()
    }, [])

    const toggleCategory = useCallback(
        (id) => {
            setFilters( prev => {
                const newCategories = prev.categories.includes(id) 
                                ? prev.categories.filter(i => i !== id) 
                                : [...prev.categories, id]
                return {...prev, categories: newCategories}
            })
        }, [setFilters]
    )

    const toggleMaterials = useCallback(
        (id) => {
            setFilters( prev => {
                
                const newMaterials = prev.materials.includes(id) 
                                ? prev.materials.filter(i => i !== id)
                                : [...prev.materials, id]
                return { ...prev, materials: newMaterials}
            })
        }, [setFilters]
    )
    
    const handleSearchChange =(text) => {
        setFilters( prev => ({...prev, search: text }))
    }

    const handleScroll = (event, key) => {
        const {
            layoutMeasurement,
            contentOffset,
            contentSize,
        } = event.nativeEvent

        const padding = 10
        const reachedEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - padding
        
        setIsAtEnd(prev => ({...prev, [key]: reachedEnd}))
    }
    
    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onHide}
            onBackButtonPress={onHide}
            animationIn="slideInLeft"
            animationOut="slideOutLeft"
            swipeDirection="left"
            onSwipeComplete={onHide}
            style={{
                margin: 0
            }}
            backdropTransitionOutTiming={500}
        >   
            <View 
                className="flex-1 absolute w-[75%] bg-stone-100 dark:bg-earth px-8 rounded-tr-[2rem] rounded-br-[2rem]"
                style={{
                    paddingTop: insets.top + 12,
                    top: 0,
                    bottom: insets.bottom,
                    paddingBottom: 24
                }}
            >

                <View
                    className="flex-1"
                >
                    <Text 
                        className="text-stone-900  dark:text-stone-100 font-bold text-4xl mb-4"
                    >
                        Filtrar Cátalogo
                    </Text>
                    <View
                        className="flex-row items-center rounded-t-md border dark:bg-earth-light/80 bg-earth-light/10 border-stone-700 px-3 mb-3"
                    >
                        <Pressable 
                            className="active:opacity-60 mr-3"
                            onPress={onSearch}
                        >
                            <SearchIcon color={isDark ? COLORS.stone100 : COLORS.stone900}/>
                        </Pressable>
                        <TextInput
                            onChangeText={handleSearchChange}
                            value={filters.search}
                            autoFocus={true}
                            className="text-stone-900 dark:text-stone-50 flex-1"
                        />
                    </View>
                    <Text 
                        className="mb-4 text-stone-900 stone- dark:text-stone-100 text-sm font-semibold uppercase tracking-[2px]"
                    >
                        Categorías
                    </Text>
                    <View className="items-center h-5" style={{ transform: [{ scaleX: 3 }] }}>
                        {isAtEnd.categories ? <ChevronUpIcon color={isDark ? COLORS.copperLight : COLORS.copperDark} size={20} /> : null}
                    </View>
                    <View className="h-[35%] border-y border-solid dark:white/5 border-stone-700">
                        <FlatList
                            data={categories}
                            keyExtractor={(c) => c.id}
                            onScroll={(e) => handleScroll(e, "categories")}
                            scrollEventThrottle={16}

                            renderItem={({item}) => {
                                const isSelected = filters.categories.includes(item.id)

                                return (
                                    <Pressable 
                                        onPress={() => toggleCategory(item.id)}
                                        className={`py-5 px-4 flex-row justify-between items-center ${isSelected ? "bg-earth-light/20 dar:bg-earth-light/80" : ""}`} 
                                    >
                                        <Text 
                                            className={`text-xl ${isSelected ? "text-copper" : "text-stone-900 dark:text-stone-100"}`}
                                        >
                                            {item.name}
                                        </Text>
                                        { isSelected ? ( <CircleCheckIcon color={COLORS.copper} size={18} />) : null }
                                    </Pressable>
                                )
                            }}

                        />
                    </View>
                    <View className=" items-center h-8" style={{ transform: [{ scaleX: 3 }] }}>
                        {isAtEnd.categories ? null : <ChevronDownIcon color={isDark ? COLORS.copperLight : COLORS.copperDark} size={20} />}
                    </View>

                    <Text
                        className="mt-5 mb-4 text-stone-900 stone- dark:text-stone-100 text-sm font-semibold uppercase tracking-[2px]"
                    >
                        Materiales
                    </Text>
                    <View className="items-center h-5" style={{ transform: [{ scaleX: 3 }] }}>
                        {isAtEnd.materials ? <ChevronUpIcon color={isDark ? COLORS.copperLight : COLORS.copperDark} size={20} /> : null}
                    </View>
                    <View className=" h-[30%] border-y py-2 dark:border-white/5 border-stone-700">
                        <FlatList
                            data={materials}
                            keyExtractor={(m) => m.id}
                            onScroll={(e) => handleScroll(e, "materials")}
                            scrollEventThrottle={16}
                            numColumns={2}
                            columnWrapperStyle={{justifyContent: "space-between" }}
                            contentContainerStyle={{gap: 10}}
                            renderItem={({item}) => {
                                const isSelected = filters.materials.includes(item.id)

                                return (
                                    <Pressable 
                                        onPress={() => toggleMaterials(item.id)}
                                        className={`py-5 px-4 w-[48%] border rounded-lg dark:border-white/5 border-stone-700 ${isSelected ? "bg-earth-light/20 dar:bg-earth-light/80" : ""}`} 
                                    >
                                        <View className=" flex-row gap-4 items-center">
                                            <Checkbox checked={isSelected}/>
                                            <Text 
                                                className={`text-lg ${isSelected ? "text-copper" : "text-stone-900 dark:text-stone-100"}`}
                                            >
                                                {item.id}
                                            </Text>
                                        </View>
                                    </Pressable>
                                )
                            }}

                        />
                    </View>
                    <View className=" items-center h-8" style={{ transform: [{ scaleX: 3 }] }}>
                        {isAtEnd.materials ? null : <ChevronDownIcon color={isDark ? COLORS.copperLight : COLORS.copperDark} size={20} />}
                    </View>

                    <View 
                        className="absolute right-[-1.4rem] top-1/2 -translate-y-1/2 w-1.5 h-[10rem] dark:bg-stone-400 bg-earth rounded-full opacity-60" 
                        pointerEvents="none"
                    />

                </View>
            </View>
        </Modal>
    )
}