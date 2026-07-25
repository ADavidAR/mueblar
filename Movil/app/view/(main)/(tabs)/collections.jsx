import CollectionView from '../../../../components/collections/CollectionView'
import MainScreen from '../../../../components/main/MainScreen'

export default function CollectionsScreen() {

    return (
        <MainScreen
            showBrand
            showProfile
        >
            <CollectionView />
        </MainScreen>
    )
}
