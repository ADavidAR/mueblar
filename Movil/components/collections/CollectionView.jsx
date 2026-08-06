import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import SerifText from "../ui/SerifText";
import { PlusIcon, SearchIcon } from "../Icons";
import CollectionSection from "./CollectionSection";
import NewCollectionModal from "../modals/NewCollectionModal";
import ConfirmModal from "../modals/ConfirmModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useCollections } from "../../hooks/useCollections";
import { useTheme } from "../../hooks/useTheme";
import { COLORS } from "../../constants/theme";
import { useMemo, useState } from "react";
import ErrorModal from "../modals/ErrorModal";
import { logoutUser } from "../../services/authService";

export default function CollectionView() {
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const { isDark } = useTheme()
    const { collections, deleteCollection, hasAuthError, toggleHasAuthError } = useCollections()
    const mutedColor = isDark ? COLORS.iconMuted : "#78716c"

    const [newOpen, setNewOpen] = useState(false)
    const [pendingDelete, setPendingDelete] = useState(null)
    const [search, setSearch] = useState("")

    const filteredCollections = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return collections
        return collections.filter((col) => col.name.toLowerCase().includes(query))
    }, [collections, search])

    return (
        <View className="flex-1 bg-stone-50 dark:bg-surface" style={{ paddingTop: insets.top }}>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
            >
                <SerifText className="pt-2 text-4xl text-stone-900 dark:text-stone-50">
                    Mi Colección
                </SerifText>
                <Text className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    Guarda tus colecciones para más tarde y probar diferentes conjuntos.
                </Text>

                <View className="mt-5 flex-row items-center rounded-xl border border-stone-300 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 h-12">
                    <SearchIcon color={mutedColor} size={18} />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Buscar colección..."
                        placeholderTextColor={mutedColor}
                        returnKeyType="search"
                        className="flex-1 ml-3 text-base text-stone-900 dark:text-stone-50"
                    />
                </View>

                <Pressable
                    onPress={() => setNewOpen(true)}
                    className="my-6 flex-row items-center justify-center gap-2 rounded-full bg-copper py-4 active:opacity-80"
                >
                    <PlusIcon size={16} color="#ffffff" />
                    <Text className="text-base font-semibold text-white">Nueva colección</Text>
                </Pressable>

                {filteredCollections.length ? (
                    filteredCollections.map((col) => (
                        <CollectionSection
                            key={col.id}
                            collection={col}
                            //onProbarAR={() => router.push('/ar')}
                            onDelete={() => setPendingDelete(col)}
                        />
                    ))
                ) : (
                    <Text className="mt-4 text-center text-sm text-stone-500 dark:text-stone-400">
                        {`Ninguna colección coincide con "${search}"`}
                    </Text>
                )}
            </ScrollView>

            <NewCollectionModal visible={newOpen} onClose={() => setNewOpen(false)} />
            <ConfirmModal
                visible={!!pendingDelete}
                onClose={() => setPendingDelete(null)}
                onConfirm={() => pendingDelete && deleteCollection(pendingDelete.id)}
                title="Eliminar Colección"
                message={`¿Seguro que deseas eliminar "${pendingDelete?.name}"? Esta acción no podrá deshacerse.`}
                confirmLabel="Eliminar"
            />

            <ErrorModal
                error={"La sesión a expirado. Vuelve a Iniciar sesión"}
                visible={hasAuthError}
                onClose={() => {
                    toggleHasAuthError()
                    logoutUser()
                    router.replace("/view/login")
                }} 
            />
            
        </View>
    )
}