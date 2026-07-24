import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'

import { formatPrice } from '../../constants/catalogData'
import CenterModal from '../ui/CenterModal'
import SerifText from '../ui/SerifText'
import FieldLabel from '../ui/FieldLabel'
import PrimaryButton from '../ui/PrimaryButton'

const FABRICS = ['Cuero', 'Tela', 'Terciopelo']
const WOODS = ['Roble', 'Nogal']
const COLORS_OPTS = [
  { name: 'Negro', hex: '#1c1c1c' },
  { name: 'Azul', hex: '#1e2a78' },
  { name: 'Terracota', hex: '#b5745a' },
  { name: 'Blanco', hex: '#f5f3ee' },
]

/** Caja seleccionable para tela/madera. */
function OptionChip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-xl border px-5 py-3 active:opacity-70 ${
        selected ? 'border-copper bg-copper/10' : 'border-stone-300 dark:border-stone-700'
      }`}
    >
      <Text className={selected ? 'font-semibold text-copper' : 'text-stone-600 dark:text-stone-300'}>
        {label}
      </Text>
    </Pressable>
  )
}

/**
 * Modal "Variantes de Objeto": filtra telas, madera y color de una pieza.
 * El estado de selección es local; al confirmar, devuelve la selección.
 */
export default function VariantsModal({ visible, onClose, product, onConfirm }) {
  const [fabric, setFabric] = useState('Tela')
  const [wood, setWood] = useState('Nogal')
  const [color, setColor] = useState(COLORS_OPTS[2])

  const confirm = () => {
    onConfirm?.({ fabric, wood, color: color.name })
    onClose?.()
  }

  return (
    <CenterModal visible={visible} onClose={onClose}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <SerifText className="text-2xl text-stone-900 dark:text-stone-50">
            Variantes de Objeto
          </SerifText>
          <Text className="mt-1 text-xs text-stone-400">{product?.name}</Text>
        </View>
        <Text className="font-semibold text-copper">{formatPrice(product?.price ?? 0)}</Text>
      </View>

      <SerifText className="mb-4 mt-5 text-lg text-stone-800 dark:text-stone-100">
        Filtrar por:
      </SerifText>

      <FieldLabel>Telas</FieldLabel>
      <View className="mb-5 mt-1 flex-row flex-wrap gap-3">
        {FABRICS.map((f) => (
          <OptionChip key={f} label={f} selected={fabric === f} onPress={() => setFabric(f)} />
        ))}
      </View>

      <FieldLabel>Madera</FieldLabel>
      <View className="mb-5 mt-1 flex-row flex-wrap gap-3">
        {WOODS.map((w) => (
          <OptionChip key={w} label={w} selected={wood === w} onPress={() => setWood(w)} />
        ))}
      </View>

      <FieldLabel>Colores</FieldLabel>
      <View className="mb-1 mt-1 flex-row gap-4">
        {COLORS_OPTS.map((c) => {
          const selected = color.name === c.name
          return (
            <Pressable
              key={c.name}
              onPress={() => setColor(c)}
              className={`h-11 w-11 items-center justify-center rounded-full ${
                selected ? 'border-2 border-copper' : ''
              }`}
            >
              <View
                style={{ backgroundColor: c.hex }}
                className="h-9 w-9 rounded-full border border-black/10"
              />
            </Pressable>
          )
        })}
      </View>
      <Text className="mb-6 text-xs text-copper">{color.name}</Text>

      <PrimaryButton label="Confirmar Selección" onPress={confirm} />
    </CenterModal>
  )
}
