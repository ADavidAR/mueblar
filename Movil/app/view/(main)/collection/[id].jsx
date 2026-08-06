import { useLocalSearchParams } from "expo-router"

import MainScreen from "../../../../components/main/MainScreen"
import CollectionDetail from "../../../../components/collections/CollectionDetail"

export default function CollectionDetailView() {
    const { id, name } = useLocalSearchParams()

    return (
        <MainScreen showBack backLabel={name || "Colección"}>
            <CollectionDetail collectionId={id} />
        </MainScreen>
    )
}
