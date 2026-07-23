import { useEffect, useState } from 'react'
import { View, Text, Animated, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { PRODUCTS } from '../../mocks/catalogData'
import { useScanProgress } from '../../hooks/useScanProgress'
import Brand from '../ui/Brand'
import ARActionButton from './ARActionButton'
import {
  CouchIcon,
  CheckCircleIcon,
  RotateIcon,
  MoveIcon,
  XIcon,
} from '../Icons'

const SELECTED = PRODUCTS[1]

/**
 * Vista AR SIMULADA (sin motor AR): overlay de escaneo, pieza seleccionada y
 * controles sobre un fondo oscuro tipo cámara. El progreso lo simula
 * useScanProgress. Se conserva como respaldo para builds sin Viro (p. ej.
 * el dev client del emulador, donde el módulo nativo de AR no existe):
 * renderízala desde app/(main)/(tabs)/ar.jsx en lugar de ARFurnitureView.
 */
export default function ARSimulatedView() {
  const insets = useSafeAreaInsets()
  const percent = useScanProgress()
  const ready = percent >= 84
  const [pulse] = useState(() => new Animated.Value(0.4))

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 1100, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [pulse])

  return (
    <View className="flex-1 bg-[#36322e]" style={{ paddingTop: insets.top + 8 }}>
      {/* Cabecera */}
      <View className="flex-row items-center justify-between px-6">
        <Brand className="text-white" />
      </View>

      {/* Estado de escaneo */}
      <View className="mt-4 px-6">
        <View className="flex-row items-center justify-between rounded-2xl bg-black/45 px-4 py-3">
          <Text className="text-sm text-white/90">
            {ready ? 'Habitación lista' : 'Escaneando habitación...'}
          </Text>
          <Text className="text-sm font-semibold text-copper">{percent}%</Text>
        </View>
        <View className="mt-2 h-1 overflow-hidden rounded-full bg-white/15">
          <View className="h-full rounded-full bg-copper" style={{ width: `${percent}%` }} />
        </View>
        <View className="mt-3 flex-row items-center gap-2">
          <CheckCircleIcon size={14} color="#7fae73" />
          <Text className="text-xs text-white/70">Estado de seguimiento: Bueno</Text>
        </View>
      </View>

      {/* Objeto fantasma */}
      <View className="flex-1 items-center justify-center">
        <Animated.View style={{ opacity: pulse }} className="items-center">
          <View className="h-44 w-60 items-center justify-center rounded-3xl border-2 border-dashed border-copper/70 bg-copper/10">
            <CouchIcon size={56} color="#c89178" />
          </View>
        </Animated.View>
      </View>

      {/* Panel inferior */}
      <View className="px-6" style={{ paddingBottom: insets.bottom + 8 }}>
        <View className="rounded-2xl bg-black/45 p-4">
          <Text className="text-[10px] uppercase tracking-[2px] text-copper">Pieza seleccionada</Text>
          <Text className="mt-1 text-lg font-semibold text-white">{SELECTED.name}</Text>
          <Text className="text-xs text-white/60">{SELECTED.specs.Material} acabado a mano</Text>
          <View className="mt-2 flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-copper" />
            <Text className="text-[11px] uppercase tracking-[1px] text-copper">Superficie fijada</Text>
          </View>
        </View>

        <View className="mt-5 flex-row justify-center gap-10">
          <ARActionButton icon={<RotateIcon />} label="Rotar" onPress={() => {}} />
          <ARActionButton icon={<MoveIcon />} label="Trasladar" onPress={() => {}} />
          <ARActionButton icon={<XIcon />} label="Eliminar" onPress={() => {}} />
        </View>

        <Pressable className="mt-5 items-center rounded-full bg-copper py-4 active:opacity-80">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-white">
            Colocar objeto
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
