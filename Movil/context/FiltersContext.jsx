import { createContext, useState } from "react"

export const FiltersContext = createContext()

export function FiltersProvider({ children })  {
    const [filters, setFilters] = useState(() => ({
        search: "",
        categories: [],
        materials: []
    }))

    

    return (
        <FiltersContext.Provider value={{
            filters,
            setFilters
        }}>
            {children}
        </FiltersContext.Provider>
    )
}