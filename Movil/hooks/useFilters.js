import { useCallback, useContext } from "react"

import { FiltersContext } from "../context/FiltersContext"
import { PRODUCTS_FETCHING } from "../constants/products"
import { fetchProducts } from "../services/inventoryService"

import data from "../mocks/products.json"

// Filtros de catálogo compartidos (búsqueda/categorías/materiales) +
// la función que pide la página de productos correspondiente a esos filtros.
export function useFilters() {
    const { filters, setFilters } = useContext(FiltersContext)

    const getFilteredProduucts = useCallback(
        async (page, limit = PRODUCTS_FETCHING.limit)  => {
            const filteredProducts =   await fetchProducts(
                filters.search,
                limit,
                page,
                filters.categories,
                filters.materials
            )

            // devuelve el JSON parseado,
            return filteredProducts
        }, [filters])

    return { filters, setFilters, getFilteredProduucts}
}