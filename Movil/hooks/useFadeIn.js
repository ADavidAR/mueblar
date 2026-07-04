import { useState, useEffect } from 'react'
import { Animated } from 'react-native'

export function useFadeIn({ duration = 450, distance = 16, delay = 0 } = {}) {
  const [opacity] = useState(() => new Animated.Value(0))
  const [translateY] = useState(() => new Animated.Value(distance))

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration, delay, useNativeDriver: true }),
    ]).start()
  }, [opacity, translateY, duration, delay])

  return { opacity, transform: [{ translateY }] }
}
