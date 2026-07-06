import { Platform } from 'react-native'

export const FONT_SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
})

export const COLORS = {
  copper: '#b5745a',
  copperLight: '#c89178',
  copperDark: '#9c5e46',
  // Superficies usadas por valores arbitrarios de Tailwind en las vistas.
  surfaceDark: '#161412',
  surfaceLessDark: '#1d1c1c',
  cardDark: '#1f1c19',
  placeholder: '#8a817b',
  iconMuted: '#a8a29e',
  stone100: '#f5f5f4',
  stone900: '#1c1917',
}

/** Clave de almacenamiento seguro para la preferencia de tema. */
export const THEME_STORAGE_KEY = 'mueblar_theme_pref'
