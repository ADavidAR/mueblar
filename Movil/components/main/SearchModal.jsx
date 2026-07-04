import { Animated, FlatList, Pressable, Text, TextInput, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useState } from "react"
import { Mod } from "react-native-reanimated-modal"

import categories from "../../mocks/categories.json"

import { SearchIcon } from "../Icons"
import { COLORS } from "../../constants/theme"
import { useTheme } from "../../context/ThemeContext"

export default function SearchModal({
    visible,
    onRequestClose
}) {
    const insets = useSafeAreaInsets()
    const { isDark } = useTheme()
    const [ search, setSearch ] = useState()
    const [translateX ] = useState(() => new Animated.Value(0)) 

    
    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onRequestClose}
        >
                    <View 
                        className="absolute w-[75%] bg-creamy dark:bg-earth px-8 rounded-tr-[2rem] rounded-br-[2rem]"
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
                                className="text-stone-900 stone- dark:text-stone-100 font-bold text-4xl mb-4"
                            >
                                    {`Filtrar Cátalogo ${visible ? "true" : "false"}`}
                            </Text>
                            <View
                                className="flex-row items-center border-2 dark:border-stone-100 border-stone-700 px-3 mb-3"
                            >
                                <SearchIcon color={isDark ? COLORS.stone100 : COLORS.stone900}/>
                                <TextInput
                                    onChangeText={setSearch}
                                    value={search}
                                    autoFocus={true}
                                />
                            </View>
                            <Text 
                                className="mb-6 text-stone-900 stone- dark:text-stone-100 text-sm font-semibold uppercase tracking-[2px]"
                            >
                                Categorías
                            </Text>
                            <FlatList
                                data={categories}
                                key={(c) => c.id}
                                renderItem={({item: c}) => {
                                    return (
                                        <Pressable 
                                            className=""
                                        >
                                            <Text 
                                                className="text-stone-900 stone- dark:text-stone-100 text-2xl"
                                            >
                                                {c.name}
                                            </Text>
                                        </Pressable>
                                    )
                                }}
                            />
                        </View>
                    </View>
        </Modal>
    )
}