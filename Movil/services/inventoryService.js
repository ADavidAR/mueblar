import { request } from './authService'

// Catálogo de productos: búsqueda paginada + detalle de producto/variación.
export const fetchProducts = async (
    search = "",
    limit = undefined, 
    page = 0,
    categories = [],
    materials = []
) => {
    const queryParams = []
    if (search)             queryParams.push(`search=${encodeURIComponent(search)}`) 
    if (limit)              queryParams.push(`limit=${limit}`) 
    if (page)               queryParams.push(`page=${page}`) 
    if (categories.length)  queryParams.push(`categories=${categories.map(c => encodeURIComponent(c)).join(",")}`) 
    if (materials.length)   queryParams.push(`materials=${materials.join(",")}`)  

    return await request(`/api/products/token?${queryParams.join("&")}`, {
        skipAuth: true,
        method: 'GET'
    })
}

export const fetchSingleProduct = async (model, simpleVariation = true) => 
    await request(`/api/products/${encodeURIComponent(model)}?simpleVariation=${simpleVariation}`, {
        skipAuth: true,
        method: 'GET'
    })

export const fetchSingleVariation = async (model, sku) =>
    await request(`/api/products/${encodeURIComponent(model)}/variations/${encodeURIComponent(sku)}`, {
        skipAuth: false,
        method: 'GET'
    })

export const fetchCategories = async () => 
    await request("/api/categories", {
        skipAuth: true,
        method: 'GET'
    })

export const fetchMaterials = async () => 
    await request("/api/attributes/MATERIAL", {
        skipAuth: true,
        method: 'GET'
    })
