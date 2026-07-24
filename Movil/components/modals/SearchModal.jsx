import { FlatList, Pressable, Text, TextInput, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useCallback, useEffect, useState } from "react"
import Modal from "react-native-modal"

import cat from "../../mocks/categories.json"
import mat from "../../mocks/materials.json"

import {
    SearchIcon, CircleCheckIcon, ChevronDownIcon, ChevronUpIcon,
    CouchIcon, UtensilsIcon, TableIcon, BuildingIcon,
    ChairIcon, BedIcon, TreeIcon, LampIcon, BoxIcon,
} from "../Icons"
import { COLORS } from "../../constants/theme"
import { useTheme } from "../../hooks/useTheme"
import SerifText from "../ui/SerifText"
import Checkbox from "../ui/Checkbox"
import { useFilters } from "../../hooks/useFilters"

/** Elige un icono según el nombre de la categoría (con respaldo). */
function CategoryIcon({ name, color, size = 18 }) {
    const n = (name || "").toLowerCase()
    if (n.includes("sof") || n.includes("salón") || n.includes("salon") || n.includes("sala")) return <CouchIcon color={color} size={size} />
    if (n.includes("comedor")) return <UtensilsIcon color={color} size={size} />
    if (n.includes("mesa")) return <TableIcon color={color} size={size} />
    if (n.includes("oficina")) return <BuildingIcon color={color} size={size} />
    if (n.includes("silla")) return <ChairIcon color={color} size={size} />
    if (n.includes("dormitorio") || n.includes("cama")) return <BedIcon color={color} size={size} />
    if (n.includes("exterior") || n.includes("jard")) return <TreeIcon color={color} size={size} />
    if (n.includes("ilumin") || n.includes("luz") || n.includes("lamp")) return <LampIcon color={color} size={size} />
    return <BoxIcon color={color} size={size} />
}

export default function SearchModal({ visible, onHide, onSearch }) {
    const { filters, setFilters } = useFilters()
    const insets = useSafeAreaInsets()
    const { isDark } = useTheme()
    const [isAtEnd, setIsAtEnd] = useState(() => ({ categories: false, materials: false }))
    const [categories, setCategories] = useState([])
    const [materials, setMaterials] = useState([])

    useEffect(() => {
        const loadCategoriesMaterials = async () => {
            const newCats = cat //await fetchCategories()
            const newMats = mat //await fetchMaterials()
            setCategories(newCats)
            setMaterials(newMats)
        }
        loadCategoriesMaterials()
    }, [])

    const toggleCategory = useCallback((id) => {
        setFilters(prev => {
            const newCategories = prev.categories.includes(id)
                ? prev.categories.filter(i => i !== id)
                : [...prev.categories, id]
            return { ...prev, categories: newCategories }
        })
    }, [setFilters])

    const toggleMaterials = useCallback((id) => {
        setFilters(prev => {
            const newMaterials = prev.materials.includes(id)
                ? prev.materials.filter(i => i !== id)
                : [...prev.materials, id]
            return { ...prev, materials: newMaterials }
        })
    }, [setFilters])

    const handleSearchChange = (text) => {
        setFilters(prev => ({ ...prev, search: text }))
    }

    // Detecta si una lista llegó al final para alternar los indicadores de flecha.
    const handleScroll = (event, key) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
        const padding = 10
        const reachedEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - padding
        setIsAtEnd(prev => ({ ...prev, [key]: reachedEnd }))
    }

    const mutedColor = isDark ? COLORS.iconMuted : "#78716c"
    const arrowColor = isDark ? COLORS.copperLight : COLORS.copperDark

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onHide}
            onBackButtonPress={onHide}
            animationIn="slideInLeft"
            animationOut="slideOutLeft"
            swipeDirection="left"
            onSwipeComplete={onHide}
            useNativeDriverForBackdrop
            style={{ margin: 0 }}
            backdropTransitionOutTiming={200}
            backdropOpacity={0.5}
        >
            <View
                className="flex-1 absolute w-[80%] bg-sand-2 dark:bg-earth px-6 rounded-tr-[2rem] rounded-br-[2rem]"
                style={{
                    paddingTop: insets.top + 16,
                    top: 0,
                    bottom: 0,
                    paddingBottom: insets.bottom + 16,
                }}
            >
                <View className="flex-1">
                    <SerifText className="mb-5 text-3xl font-bold text-stone-900 dark:text-stone-50">
                        Filtrar Catálogo
                    </SerifText>

                    {/* Buscador */}
                    <View className="flex-row items-center rounded-xl border border-stone-300 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 h-12 mb-5">
                        <Pressable className="active:opacity-60 mr-3" onPress={onSearch} hitSlop={8}>
                            <SearchIcon color={mutedColor} size={18} />
                        </Pressable>
                        <TextInput
                            onChangeText={handleSearchChange}
                            value={filters.search}
                            placeholder="Buscar muebles..."
                            placeholderTextColor={mutedColor}
                            returnKeyType="search"
                            onSubmitEditing={onSearch}
                            className="flex-1 text-base text-stone-900 dark:text-stone-50"
                        />
                    </View>

                    {/* Categorías */}
                    <Text className="mb-1 text-xs font-semibold uppercase tracking-[2px] text-stone-500 dark:text-stone-400">
                        Categorías
                    </Text>
                    <View className="items-center h-4">
                        {isAtEnd.categories ? <ChevronUpIcon color={arrowColor} size={14} /> : null}
                    </View>
                    <View className="h-[34%] border-y border-stone-300 dark:border-white/10">
                        <FlatList
                            data={categories}
                            keyExtractor={(c) => String(c.id)}
                            onScroll={(e) => handleScroll(e, "categories")}
                            scrollEventThrottle={16}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isSelected = filters.categories.includes(item.id)
                                const iconColor = isSelected ? COLORS.copper : mutedColor
                                return (
                                    <Pressable
                                        onPress={() => toggleCategory(item.id)}
                                        className={`flex-row items-center justify-between rounded-xl px-4 py-3 my-0.5 active:opacity-80 ${isSelected ? "bg-copper/15" : ""}`}
                                    >
                                        <View className="flex-row items-center gap-x-3">
                                            <CategoryIcon name={item.name} color={iconColor} />
                                            <Text className={`text-base ${isSelected ? "font-semibold text-copper-dark dark:text-copper-light" : "text-stone-800 dark:text-stone-200"}`}>
                                                {item.name}
                                            </Text>
                                        </View>
                                        {isSelected ? <CircleCheckIcon color={COLORS.copper} size={16} /> : null}
                                    </Pressable>
                                )
                            }}
                        />
                    </View>
                    <View className="items-center h-4">
                        {isAtEnd.categories ? null : <ChevronDownIcon color={arrowColor} size={14} />}
                    </View>

                    {/* Materiales */}
                    <Text className="mt-3 mb-1 text-xs font-semibold uppercase tracking-[2px] text-stone-500 dark:text-stone-400">
                        Materiales
                    </Text>
                    <View className="items-center h-4">
                        {isAtEnd.materials ? <ChevronUpIcon color={arrowColor} size={14} /> : null}
                    </View>
                    <View className="h-[26%] border-y border-stone-300 dark:border-white/10 py-2">
                        <FlatList
                            data={materials}
                            keyExtractor={(m) => m.id}
                            onScroll={(e) => handleScroll(e, "materials")}
                            scrollEventThrottle={16}
                            showsVerticalScrollIndicator={false}
                            numColumns={2}
                            columnWrapperStyle={{ justifyContent: "space-between" }}
                            contentContainerStyle={{ gap: 10 }}
                            renderItem={({ item }) => {
                                const isSelected = filters.materials.includes(item.id)
                                return (
                                    <Pressable
                                        onPress={() => toggleMaterials(item.id)}
                                        className={`w-[48%] flex-row items-center gap-x-3 rounded-xl border px-3 py-3 active:opacity-80 ${isSelected ? "border-copper bg-copper/10" : "border-stone-300 dark:border-white/10"}`}
                                    >
                                        <Checkbox checked={isSelected} />
                                        <Text className={`text-sm ${isSelected ? "font-semibold text-copper-dark dark:text-copper-light" : "text-stone-800 dark:text-stone-200"}`}>
                                            {item.id}
                                        </Text>
                                    </Pressable>
                                )
                            }}
                        />
                    </View>
                    <View className="items-center h-4">
                        {isAtEnd.materials ? null : <ChevronDownIcon color={arrowColor} size={14} />}
                    </View>

                    {/* Indicador de swipe */}
                    <View
                        className="absolute right-[-1.4rem] top-1/2 -translate-y-1/2 w-1.5 h-[10rem] dark:bg-stone-400 bg-stone-500 rounded-full opacity-50"
                        pointerEvents="none"
                    />
                </View>
            </View>
        </Modal>
    )
}
