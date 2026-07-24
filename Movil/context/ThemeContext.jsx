import { createContext, useEffect, useState, useCallback } from 'react'
import { useColorScheme } from 'nativewind'
import * as SecureStore from 'expo-secure-store'

import { THEME_STORAGE_KEY } from '../constants/theme'

export const ThemeContext = createContext(null)

/**
 * Proveedor global del tema claro/oscuro.
 *
 * Envuelve el `useColorScheme` de NativeWind (que activa/desactiva la variante
 * `dark:` en toda la app) y le agrega persistencia con expo-secure-store.
 * Por defecto arranca en oscuro, que es el tema principal de los mockups.
 */
export function ThemeProvider({ children }) {
  const { setColorScheme } = useColorScheme()
  // Fuente de verdad propia: NativeWind v4 puede devolver `colorScheme`
  // undefined o siguiendo al SO, así que no dependemos de su lectura para
  // decidir el toggle; solo le empujamos el valor con setColorScheme.
  const [theme, setThemeState] = useState('dark')
  const [hydrated, setHydrated] = useState(false)
  const setTheme = useCallback(
    (next) => {
      setThemeState(next)
      setColorScheme(next)
      SecureStore.setItemAsync(THEME_STORAGE_KEY, next).catch(() => {})
    },
    [setColorScheme],
  )

  // Cargar la preferencia guardada una sola vez al montar.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY)
        const next = saved === 'light' ? 'light' : 'dark'
        if (active) {
          setThemeState(next)
          setColorScheme(next)
        }
      } catch {
        if (active) {
          setThemeState('dark')
          setColorScheme('dark')
        }
      } finally {
        if (active) setHydrated(true)
      }
    })()
    return () => {
      active = false
    }
  }, [setColorScheme])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const value = {
    theme,
    isDark: theme === 'dark',
    hydrated,
    setTheme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
