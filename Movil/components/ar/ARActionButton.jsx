import { View, Text, Pressable } from 'react-native'

/**
 * Botón circular de acción para la vista AR (Rotar / Trasladar / Eliminar),
 * con ícono arriba y etiqueta debajo.
 */
export default function ARActionButton({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} className="items-center gap-2 active:opacity-70">
      <View className="h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10">
        {icon}
      </View>
      <Text className="text-[10px] uppercase tracking-[1px] text-white/80">{label}</Text>
    </Pressable>
  )
}
