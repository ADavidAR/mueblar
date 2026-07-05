import { useEffect, useState } from 'react'
import { Animated, View } from 'react-native'

import { CheckIcon } from '../Icons'

export default function Checkbox({ checked }) {
  
  const [scale] = useState(() => new Animated.Value(checked ? 1 : 0))
  useEffect(() => {

    Animated.spring(scale, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start()
  }, [checked, scale])


  return (
      <View
        className={`h-5 w-5 items-center justify-center rounded  ${
          checked ? 'bg-copper' : 'dark:bg-[#44403C] dark:border-0 border border-stone-400'
        }`}
      >
        <Animated.View style={{ transform: [{ scale }], opacity: scale }}>
          <CheckIcon />
        </Animated.View>
      </View>
  )
}
