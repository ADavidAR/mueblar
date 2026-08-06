import { request } from './authService'

export const fetchCollections = async (
    search = "",
    limit = undefined,
    page = 0
) => {
    const queryParams = []
    if (search)             queryParams.push(`search=${encodeURIComponent(search)}`)
    if (limit)              queryParams.push(`limit=${limit}`)
    if (page)               queryParams.push(`page=${page}`)
    return await request(`/api/collections?${queryParams.join("&")}`, {
        method: 'GET'
    })
    //return await mockFetchCollections()
}

export const fetchCollectionProduct = async (
    id_collection,
    limit = undefined,
    page = 0
) => {
    const queryParams = []
    if (limit)              queryParams.push(`limit=${limit}`)
    if (page)               queryParams.push(`page=${page}`)
    return await request(`/api/collections/${encodeURIComponent(id_collection)}?${queryParams.join("&")}`, {
        method: 'GET'
    })
    //return await mockFetchCollectionProduct(id_collection)
}

export const createCollection = async (title) =>
    await request(`/api/collections`, {
        method: 'POST',
        body: JSON.stringify({ title })
    })
    //await mockCreateCollection(title)

export const addProductToCollection = async (id_collection, id_product) =>
    await request(`/api/collections/${encodeURIComponent(id_collection)}`, {
        method: 'POST',
        body: JSON.stringify({ model: id_product })
    })
    //await mockAddProductToCollection(id_collection, id_product)

export const updateCollectionTitle = async (id_collection, title) =>
    await request(`/api/collections/${encodeURIComponent(id_collection)}`, {
        method: 'PUT',
        body: JSON.stringify({ title })
    })
    //await mockUpdateCollectionTitle(id_collection, title)

export const deleteCollection = async (id_collection) =>
    await request(`/api/collections/${encodeURIComponent(id_collection)}`, {
        method: 'DELETE'
    })
    //await mockDeleteCollection(id_collection)

export const deleteProductFromCollection = async (id_collection, id_product) =>
    await request(`/api/collections/${encodeURIComponent(id_collection)}/products/${encodeURIComponent(id_product)}`, {
        method: 'DELETE'
    })
    //await mockDeleteProductFromCollection(id_collection, id_product)
