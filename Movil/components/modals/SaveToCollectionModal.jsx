import { View, Text, Pressable } from 'react-native'

import { useCollections } from '../../hooks/useCollections'
import CenterModal from './CenterModal'
import SerifText from '../ui/SerifText'
import PrimaryButton from '../ui/PrimaryButton'
import { PlusIcon, CircleCheckIcon } from '../Icons'
import { useEffect, useState } from 'react'
import { COLORS } from '../../constants/theme'

/**
 * Modal "Guardar en Colección": lista las colecciones y permite añadir el
 * producto a cualquiera (toca el +). Marca con check las que ya lo contienen.
 */
export default function SaveToCollectionModal({ visible, onClose, productId }) {
    const { collections, toggleSave, loading } = useCollections()
    const [ pendingCollectionsChanges, setPendingCollectionsChanges ] = useState({ add: [], delete: [] })
    useEffect(() => {
        const resetStates = async () => {
            setPendingCollectionsChanges({ add: [], delete: [] })
        }
        resetStates()
    }, [visible])
    
    const handlePress = (collectionId, added) => {
        setPendingCollectionsChanges( prev => {
            if ( added ) {
                if ( prev.delete.includes(collectionId))
                    return { 
                        ...prev, 
                        delete: prev.delete.filter((id) => id !== collectionId) 
                    }
    
                return { 
                    ...prev, 
                    delete: [ ...prev.delete, collectionId ] 
                }
            }

            if ( !prev.add.includes(collectionId) )
                return { 
                    ...prev,
                    add: [ ...prev.add, collectionId ],
                }

            return {
                ...prev,
                add: prev.add.filter ((id) => id !== collectionId),
            } 
        })
    }
    
    const handleSave = () => {
        toggleSave(productId, pendingCollectionsChanges.add, pendingCollectionsChanges.delete)
        onClose()
    }


    return (
        <CenterModal visible={visible} onClose={onClose}>
            <SerifText className="mb-5 text-3xl text-stone-900 dark:text-stone-50">Colecciones</SerifText>
            
            <View className="mb-6">
                {collections.map((col) => {
                    const added = productId ? col.productIds.includes(productId) : false
                    const selected = added 
                                        && !pendingCollectionsChanges.delete.includes(col.id)
                                        || pendingCollectionsChanges.add.includes(col.id)
                    return (
                        <Pressable
                            key={col.id}
                            onPress={() => handlePress(col.id, added)}
                            className="flex-row items-center justify-between border-b border-stone-200 py-4 active:opacity-70 dark:border-stone-800"
                        >
                            <Text className="text-base text-stone-800 dark:text-stone-100">{col.name}</Text>
                            {selected ? <CircleCheckIcon color={COLORS.copper} size={20} /> : <PlusIcon size={18} color="#a8a29e" />}
                        </Pressable>
                    )
                })}
            </View>

            <PrimaryButton label="Guardar" onPress={handleSave} loading={loading} />
        </CenterModal>
    )
}
