import { useContext } from 'react'

import { CollectionsContext } from '../context/CollectionsContext'

export function useCollections() {
    const ctx = useContext(CollectionsContext)
    if (!ctx) throw new Error('useCollections debe usarse dentro de <CollectionsProvider>')
    return ctx
}
