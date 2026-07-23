import { useState } from "react"

import MainScreen from "../../../../components/main/MainScreen"
import ProductsList from "../../../../components/main/ProductsList"
import SearchModal from "../../../../components/main/SearchModal"
import { FiltersProvider } from "../../../../context/FiltersContext"

export default function Catalog() {
    const [ showSearchModal, toggleSearchModal ] = useState(false)
    const [ loadKey, setLoadKey ] = useState(0)
    
    return (
        <FiltersProvider>
            <SearchModal 
                visible={showSearchModal}
                onHide={() => toggleSearchModal(false)}
                onSearch={() => {
                    setLoadKey(prev => prev + 1)
                    toggleSearchModal(false)
                }}
            />
            <MainScreen 
                showBrand 
                showProfile 
                showSearch
                onSearchPress={() => toggleSearchModal(true)}
                scrollEnabled={false}
            >
                <ProductsList 
                    loadKey={loadKey}
                />
            </MainScreen>
        </FiltersProvider>
    )
}