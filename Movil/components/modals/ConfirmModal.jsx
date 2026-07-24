import { View, Text } from 'react-native'

import CenterModal from './CenterModal'
import SerifText from '../ui/SerifText'
import PrimaryButton from '../ui/PrimaryButton'
import { TrashIcon } from '../Icons'

/**
 * Modal de confirmación reutilizable (mockup "Confirmar Cambio"). Ícono
 * circular, título serif, mensaje y acciones Confirmar / Cancelar.
 */
export default function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title = 'Confirmar Cambio',
  message = '¿Estás seguro de realizar este cambio? Esta acción es permanente y no podrá deshacerse.',
  confirmLabel = 'Confirmar',
  icon,
}) {
  return (
    <CenterModal visible={visible} onClose={onClose}>
      <View className="items-center">
        <View className="mb-5 h-14 w-14 items-center justify-center rounded-full bg-copper/15">
          {icon ?? <TrashIcon size={20} color="#b5745a" />}
        </View>
        <SerifText className="text-2xl text-stone-900 dark:text-stone-50">{title}</SerifText>
        <Text className="mb-7 mt-3 px-2 text-center text-sm leading-5 text-stone-500 dark:text-stone-400">
          {message}
        </Text>
        <PrimaryButton
          label={confirmLabel}
          onPress={() => {
            onConfirm?.()
            onClose?.()
          }}
        />
        <View className="mt-3 w-full">
          <PrimaryButton label="Cancelar" variant="outline" onPress={onClose} />
        </View>
      </View>
    </CenterModal>
  )
}
