import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useRouter } from 'expo-router'

import { COLORS } from '../constants/theme'
import { isAuthenticated } from '../services/authService'


export default function Index() {
  const router = useRouter()

  useEffect(() => {
    let active = true
    ;(async () => {
      const authed = true// await isAuthenticated()
      if (!active) return
      router.replace(authed ? '/view/catalog' : '/view/login')
    })()
    return () => {
      active = false
    }
  }, [router])

  return (
    <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-surface">
      <ActivityIndicator size="large" color={COLORS.copper} />
    </View>
  )
}
