import Component from '@react-native-segmented-control/segmented-control'
import { useStyles } from 'react-native-unistyles'

type Props = {
  active?: number
  items: Array<string>
  onChange?: (index: number) => void
}

export function SegmentedControl({ active, items, onChange }: Props) {
  const { theme } = useStyles()

  return (
    <Component
      activeFontStyle={{
        color: theme.colors.accent.contrast,
        fontSize: theme.typography[2].fontSize,
        fontWeight: 'bold',
      }}
      backgroundColor={theme.colors.gray.a3}
      fontStyle={{
        color: theme.colors.gray.contrast,
        fontFamily: 'regular',
        fontSize: theme.typography[2].fontSize,
      }}
      onChange={(event) => {
        onChange?.(event.nativeEvent.selectedSegmentIndex)
      }}
      selectedIndex={active}
      tintColor={theme.colors.accent.a9}
      values={items}
    />
  )
}
