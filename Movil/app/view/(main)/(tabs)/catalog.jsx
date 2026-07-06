import { useState } from "react"

import MainScreen from "../../../../components/main/MainScreen"
import ProductsList from "../../../../components/main/ProductsList"
import SearchModal from "../../../../components/main/SearchModal"
import { FiltersProvider } from "../../../../context/FiltersContext"

export default function Catalog() {
    const [ showSearchModal, toggleSearchModal ] = useState(false)
    const [ shouldLoad, toggleShouldLoad ] = useState(true)
    
    return (
        <FiltersProvider>
            <SearchModal 
                visible={showSearchModal}
                onHide={() => toggleSearchModal(false)}
                onSearch={() => {
                    toggleShouldLoad(true)
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
                    shouldReload={shouldLoad}
                    stopReloading={() => toggleShouldLoad(false)}
                />
            </MainScreen>
        </FiltersProvider>
    )
}