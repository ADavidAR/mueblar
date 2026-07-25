import { useCallback, useContext } from "react"

import { FiltersContext } from "../context/FiltersContext"
import { PRODUCTS_FETCHING } from "../constants/products"
import { fetchProducts } from "../services/inventoryService"

import data from "../mocks/products.json"

export function useFilters() {
    const { filters, setFilters } = useContext(FiltersContext)
    
    const getFilteredProduucts = useCallback(
        async (page, limit = PRODUCTS_FETCHING.limit) => {

            const res =   await fetchProducts(
                filters.search,
                limit,
                page,
                filters.categories,
                filters.materials
            )
            
            const filteredProducts = await res.json()
            return filteredProducts
        }, [filters])

    return { filters, setFilters, getFilteredProduucts}
}