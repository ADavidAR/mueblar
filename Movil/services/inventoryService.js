import {request} from './authService'

export const fetchProducts = async (
    search = "",
    limit = undefined, 
    offset = 0,
    select = [],
    categories = [],
    materials = []
) => {
    const queryParams = []
    if (search)             queryParams.push(`search=${encodeURIComponent(search)}`) 
    if (limit)              queryParams.push(`limit=${limit}`) 
    if (offset)             queryParams.push(`offset=${offset}`) 
    if (select.length)      queryParams.push(`select=${select.join(",")}`) 
    if (categories.length)  queryParams.push(`categories=${categories.map(c => encodeURIComponent(c)).join(",")}`) 
    if (materials.length)   queryParams.push(`materials=${materials.join(",")}`)  

    return await request(`/api/products/search?${queryParams.join("&")}`, {
        skipAuth: true,
        method: 'GET'
    })
}

export const fetchSingleProduct = async (model, simpleVariation = true) => 
    await request(`/api/products/${encodeURIComponent(model)}?simpleVariation=${simpleVariation}`, {
        skipAuth: true,
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
