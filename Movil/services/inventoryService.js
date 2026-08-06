import { request } from './authService'

// Catálogo de productos: búsqueda paginada + detalle de producto/variación.
export const fetchProducts = async (
    search = "",
    limit = 10, 
    page = 0,
    categories = [],
    materials = []
) => {
    const queryParams = []
    if (search)             queryParams.push(`search=${encodeURIComponent(search)}`) 
    if (limit)              queryParams.push(`limit=${limit}`) 
    if (typeof page !== "undefined")               queryParams.push(`page=${page}`) 
    if (categories.length)  queryParams.push(`categories=${categories.map(c => encodeURIComponent(c)).join(",")}`) 
    if (materials.length)   queryParams.push(`materials=${materials.join(",")}`)  

    return await request(`/api/products/token?${queryParams.join("&")}`, {
        skipAuth: false,
        method: 'GET'
    })
}

export const fetchSingleProduct = async (model, simpleVariation = true) => 
    await request(`/api/products/${encodeURIComponent(model)}/token?simpleVariation=${simpleVariation}`, {
        skipAuth: false,
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

export const fetchMaterials = async () => {
    const mat = await request("/api/attributes?limit=150", {
        skipAuth: false,
        method: 'GET'
    })

    return mat.filter((m) => m.atribType.id === "MATERIAL")

}

