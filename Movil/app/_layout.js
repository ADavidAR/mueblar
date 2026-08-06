import "../global.css"

import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from "react-native-gesture-handler"

import { ThemeProvider } from '../context/ThemeContext'
import { CollectionsProvider } from '../context/CollectionsContext'
import { useTheme } from '../hooks/useTheme'


function ThemedStatusBar() {
  const { isDark } = useTheme()
  return <StatusBar style={isDark ? 'light' : 'dark'} />
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <ThemeProvider>
          {/* Un solo CollectionsProvider para toda la app — catálogo,
              detalle de producto y la pestaña de colecciones necesitan leer
              y escribir el mismo estado de favoritos/colecciones. */}
          <CollectionsProvider>
            <ThemedStatusBar />
            <Slot />
          </CollectionsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
