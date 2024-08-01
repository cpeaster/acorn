import { type ConfigContext, type ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  android: {
    adaptiveIcon: {
      backgroundColor: '#101211',
      foregroundImage: './assets/artwork/adaptive-icon.png',
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: '8d7d5acc-3688-4cd2-b93f-52391f665348',
    },
    router: {
      origin: false,
    },
  },
  ios: {
    bundleIdentifier: 'blue.acorn',
    config: {
      usesNonExemptEncryption: false,
    },
    icon: './assets/artwork/icon.png',
  },
  name: 'Acorn',
  orientation: 'portrait',
  plugins: [
    'expo-router',
    'expo-font',
    'expo-localization',
    'expo-secure-store',
    'expo-video',
    [
      '@sentry/react-native/expo',
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
    ],
  ],
  runtimeVersion: {
    policy: 'appVersion',
  },
  scheme: 'acorn',
  slug: 'acorn',
  splash: {
    backgroundColor: '#101211',
    image: './assets/artwork/splash.png',
    resizeMode: 'contain',
  },
  updates: {
    url: 'https://u.expo.dev/edf2549b-dfeb-447c-8d58-77a5f6c52174',
  },
  userInterfaceStyle: 'automatic',
  version: '1.0.0',
})
