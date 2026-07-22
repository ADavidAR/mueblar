import { useContext, useEffect } from 'react'

import { ModelCatalogContext } from '../context/ModelCatalogContext'

/** Pide que se resuelvan `skus` ({model, sku}[]) y devuelve `getModel(sku)` síncrono. */
export function useModelCatalog(skus) {
    const ctx = useContext(ModelCatalogContext)
    if (!ctx) throw new Error('useModelCatalog debe usarse dentro de <ModelCatalogProvider>')

    useEffect(() => {
        ctx.resolve(skus)
    }, [skus, ctx])

    return ctx.getModel
}
