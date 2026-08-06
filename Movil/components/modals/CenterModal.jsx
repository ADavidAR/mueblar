import { useEffect, useState } from 'react'
import { Modal, Pressable, Animated, View } from 'react-native'

/**
 * Contenedor de modal centrado con backdrop y animación de entrada (escala +
 * desvanecido, Animated nativo). Cierra al tocar fuera. El contenido se pasa
 * como children; cada modal específico decide qué renderiza dentro.
 */
export default function CenterModal({ visible, onClose, children }) {
  const [opacity] = useState(() => new Animated.Value(0))
  const [scale] = useState(() => new Animated.Value(0.92))

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 6 }),
      ]).start()
    } else {
      opacity.setValue(0)
      scale.setValue(0.92)
    }
  }, [visible, opacity, scale])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-black/60 px-7">
        <Animated.View style={{ opacity, transform: [{ scale }], width: '100%' }}>
          {/* Pressable interno evita que el toque dentro del card cierre el modal */}
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="rounded-3xl bg-white p-6 dark:bg-card">{children}</View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}
