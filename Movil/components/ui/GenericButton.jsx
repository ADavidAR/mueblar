import { useState } from 'react'
import { Animated, Pressable, Text, ActivityIndicator, View } from 'react-native'

/**
 * Variantes:
 *  - "solid"   → relleno cobre.
 *  - "outline" → solo borde.
 */
export default function GenericButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'solid',
  icon = null,
  className = '',
  textColor,
  containerBase,
  containerStyle,
}) {
  const [scale] = useState(() => new Animated.Value(1))
  const isDisabled = disabled || loading

  const animateTo = (toValue) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start()
  const isSolid = variant === 'solid'
  return (
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        disabled={isDisabled}
        style={containerStyle}
        className={`h-16 w-full flex-row items-center justify-center rounded-full ${containerBase} ${
          isDisabled ? 'opacity-50' : ''
        } ${className}`}
      >
        {loading ? (
          <ActivityIndicator color={isSolid ? '#ffffff' : '#b5745a'} />
        ) : (
          <>
            {icon ? <View className="mr-3">{icon}</View> : null}
            <Text className={`text-sm font-semibold uppercase tracking-[2px] ${textColor}`}>
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  )
}
