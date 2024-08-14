import { default as Constants } from 'expo-constants'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { useTranslations } from 'use-intl'

import { Text } from '~/components/common/text'
import { SettingsMenu } from '~/components/settings/menu'
import { useAuth } from '~/stores/auth'
import { usePreferences } from '~/stores/preferences'

export default function Screen() {
  const t = useTranslations('tab.settings')

  const { clearCache } = useAuth()
  const { browser, muted, nsfw, update } = usePreferences()

  const { styles } = useStyles(stylesheet)

  return (
    <SettingsMenu
      footer={
        <Text
          highContrast={false}
          size="1"
          style={styles.version}
          variant="mono"
        >
          v{Constants.expoConfig?.version ?? 0}
        </Text>
      }
      insets={['top', 'bottom', 'header', 'tabBar']}
      items={[
        t('menu.general.title'),
        {
          icon: 'SpeakerSimpleX',
          label: t('menu.general.muted'),
          onSelect(value) {
            update({
              muted: value,
            })
          },
          type: 'switch',
          value: muted,
        },
        {
          icon: 'Drop',
          label: t('menu.general.nsfw'),
          onSelect(value) {
            update({
              nsfw: !value,
            })
          },
          type: 'switch',
          value: !nsfw,
        },
        {
          icon: 'Browser',
          label: t('menu.general.browser'),
          onSelect(value) {
            update({
              browser: value,
            })
          },
          type: 'switch',
          value: browser,
        },
        t('menu.cache.title'),
        {
          icon: 'HardDrives',
          label: t('menu.cache.query'),
          onPress() {
            clearCache()
          },
        },
      ]}
    />
  )
}

const stylesheet = createStyleSheet((theme) => ({
  version: {
    margin: theme.space[4],
  },
}))
