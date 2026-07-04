import {request} from './authService'

export const fetchProducts = async (
    search = "",
    limit = undefined, 
    offset = 0,
    select = undefined,
    categories = undefined,
    materials = undefined
) => {
    const queryParams = []
    if (search)     queryParams.push(`search=${encodeURIComponent(search)}`) 
    if (limit)      queryParams.push(`limit=${limit}`) 
    if (offset)     queryParams.push(`offset=${offset}`) 
    if (select)     queryParams.push(`select=${select.join(",")}`) 
    if (categories) queryParams.push(`categories=${categories.map(c => encodeURIComponent(c)).join(",")}`) 
    if (materials)  queryParams.push(`materials=${materials.join(",")}`)  

    const data = await request(`/api/products/search?${queryParams.join("&")}`, {
        skipAuth: true,
        method: 'GET'
    })

    return JSON.parse(data)
}

export const fetchSingleProduct = async (model, simpleVariation = true) => {
    const data = await request(`/api/products/${encodeURIComponent(model)}?simpleVariation=${simpleVariation}`, {
        skipAuth: true,
        method: 'GET'
    })

    return JSON.parse(data)
}
