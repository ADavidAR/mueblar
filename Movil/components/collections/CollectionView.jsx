import { Pressable, ScrollView, Text, View } from "react-native";
import SerifText from "../ui/SerifText";
import { PlusIcon } from "../Icons";
import CollectionSection from "./CollectionSection";
import NewCollectionModal from "../modals/NewCollectionModal";
import ConfirmModal from "../modals/ConfirmModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useCollections } from "../../hooks/useCollections";
import { useState } from "react";


export default function CollectionView() {
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const { collections, deleteCollection } = useCollections()

    const [newOpen, setNewOpen] = useState(false)
    const [pendingDelete, setPendingDelete] = useState(null)

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

                <Pressable
                    onPress={() => setNewOpen(true)}
                    className="my-6 flex-row items-center justify-center gap-2 rounded-full bg-copper py-4 active:opacity-80"
                >
                    <PlusIcon size={16} color="#ffffff" />
                    <Text className="text-base font-semibold text-white">Nueva colección</Text>
                </Pressable>

                {collections.map((col) => (
                    <CollectionSection
                        key={col.id}
                        collection={col}
                        onProbarAR={() => router.push('/ar')}
                        onDelete={() => setPendingDelete(col)}
                    />
                ))}
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
        </View>
    )
}