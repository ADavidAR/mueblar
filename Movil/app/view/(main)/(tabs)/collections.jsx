import CollectionView from '../../../../components/collections/CollectionView'
import MainScreen from '../../../../components/main/MainScreen'

// CollectionsProvider ya envuelve toda la app desde app/_layout.js
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
