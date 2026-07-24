import { useState } from 'react'
import { View, TextInput } from 'react-native'

import { COLORS } from '../../constants/theme'
import { useCollections } from '../../hooks/useCollections'
import CenterModal from './CenterModal'
import SerifText from '../ui/SerifText'
import FieldLabel from '../ui/FieldLabel'
import PrimaryButton from '../ui/PrimaryButton'
import { PlusIcon } from '../Icons'

/**
 * Modal "Nueva Colección": nombre + Crear / Cancelar. Crea la colección en
 * CollectionsContext y limpia el campo al cerrar.
 */
export default function NewCollectionModal({ visible, onClose }) {
  const { createCollection } = useCollections()
  const [name, setName] = useState('')

  const close = () => {
    setName('')
    onClose?.()
  }

  const onCreate = () => {
    if (!name.trim()) return
    createCollection(name)
    close()
  }

  return (
    <CenterModal visible={visible} onClose={close}>
      <View className="mb-5 flex-row items-center gap-3">
        <SerifText className="text-2xl text-stone-900 dark:text-stone-50">Nueva Colección</SerifText>
        <PlusIcon />
      </View>

      <FieldLabel>Nombre de la nueva colección</FieldLabel>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="verano"
        placeholderTextColor={COLORS.placeholder}
        autoFocus
        className="mb-6 rounded-xl border border-stone-300 px-4 py-3 text-base text-stone-900 dark:border-stone-700 dark:text-stone-100"
      />

      <PrimaryButton label="Crear" onPress={onCreate} />
      <View className="mt-3">
        <PrimaryButton label="Cancelar" variant="outline" onPress={close} />
      </View>
    </CenterModal>
  )
}
