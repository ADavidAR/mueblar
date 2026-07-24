import { View, Text, Pressable } from 'react-native'

import { useCollections } from '../../hooks/useCollections'
import CenterModal from '../ui/CenterModal'
import SerifText from '../ui/SerifText'
import PrimaryButton from '../ui/PrimaryButton'
import { PlusIcon, CheckCircleIcon } from '../Icons'

/**
 * Modal "Guardar en Colección": lista las colecciones y permite añadir el
 * producto a cualquiera (toca el +). Marca con check las que ya lo contienen.
 */
export default function SaveToCollectionModal({ visible, onClose, productId }) {
  const { collections, addToCollection } = useCollections()

  return (
    <CenterModal visible={visible} onClose={onClose}>
      <SerifText className="mb-5 text-3xl text-stone-900 dark:text-stone-50">Colecciones</SerifText>

      <View className="mb-6">
        {collections.map((col) => {
          const added = productId ? col.productIds.includes(productId) : false
          return (
            <Pressable
              key={col.id}
              onPress={() => productId && addToCollection(col.id, productId)}
              disabled={added}
              className="flex-row items-center justify-between border-b border-stone-200 py-4 active:opacity-70 dark:border-stone-800"
            >
              <Text className="text-base text-stone-800 dark:text-stone-100">{col.name}</Text>
              {added ? <CheckCircleIcon size={20} /> : <PlusIcon size={18} color="#a8a29e" />}
            </Pressable>
          )
        })}
      </View>

      <PrimaryButton label="Guardar" onPress={onClose} />
    </CenterModal>
  )
}
