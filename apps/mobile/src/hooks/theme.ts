import { type Theme } from '@react-navigation/native'
import { useColorScheme } from 'react-native'
import { useStyles } from 'react-native-unistyles'

export function useTheme() {
  const scheme = useColorScheme()

  const { theme } = useStyles()

  return {
    colors: {
      background: theme.colors.gray[1],
      border: theme.colors.grayA[6],
      card: theme.colors.gray[2],
      notification: theme.colors.accentA[9],
      primary: theme.colors.accentA[9],
      text: theme.colors.grayA[11],
    },
    dark: scheme === 'dark',
  } satisfies Theme
}
