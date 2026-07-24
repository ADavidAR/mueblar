import { CollectionsProvider } from '../../../../context/CollectionsContext'
import CollectionView from '../../../../components/collections/CollectionView'
import MainScreen from '../../../../components/main/MainScreen'

export default function CollectionsScreen() {

    return (
        <CollectionsProvider>
            <MainScreen
                showBrand
                showProfile
            >
                <CollectionView />
            </MainScreen>
        </CollectionsProvider>
    )
}
