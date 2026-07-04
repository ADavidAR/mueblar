import { useState } from "react"

import MainScreen from "../../../components/main/MainScreen"
import ProductsList from "../../../components/main/ProductsList"
import SearchModal from "../../../components/main/SearchModal"

export default function Catalog() {
    const [ search ] = useState("")
    const [ showSearchModal, toggleSearchModal] = useState(false)

    return (

        <>
        <SearchModal 
            visible={showSearchModal}
            onRequestClose={() => toggleSearchModal(false)}
        />        
        <MainScreen 
            showBrand 
            showProfile 
            showSearch
            onSearchPress={() => toggleSearchModal(true)}
            scrollEnabled={false}
        >
            <ProductsList search={search} />
        </MainScreen>
        </>
    )
}