import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'
import { ResponsiveGrid } from 'react-native-flexible-grid'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { useTranslations } from 'use-intl'

import { Pressable } from '~/components/common/pressable'
import { Text } from '~/components/common/text'
import { View } from '~/components/common/view'
import { useImagePlaceholder } from '~/hooks/image'
import { type PostMedia } from '~/types/post'

import { GalleryBlur } from './blur'

type Props = {
  images: Array<PostMedia>
  nsfw?: boolean
  onLongPress?: () => void
  onPress: (index: number) => void
  recyclingKey?: string
  spoiler?: boolean
  viewing?: boolean
}

export function ImageGrid({
  images,
  nsfw = false,
  onLongPress,
  onPress,
  recyclingKey,
  spoiler = false,
  viewing,
}: Props) {
  const t = useTranslations('component.posts.gallery')

  const { styles } = useStyles(stylesheet)

  const placeholder = useImagePlaceholder()

  if (images.length === 1) {
    const image = images[0]!

    return (
      <Pressable
        delayed
        onLongPress={onLongPress}
        onPress={() => {
          onPress(0)
        }}
        style={styles.one(image.width / image.height)}
      >
        <Image
          {...placeholder}
          priority={viewing ? 'high' : 'normal'}
          recyclingKey={recyclingKey}
          source={image.thumbnail}
          style={styles.image}
        />

        {nsfw || spoiler ? (
          <GalleryBlur label={t(spoiler ? 'spoiler' : 'nsfw')} />
        ) : null}

        {image.type === 'gif' ? (
          <View style={[styles.label, styles.gif]}>
            <Text contrast size="1" weight="medium">
              {t('gif')}
            </Text>
          </View>
        ) : null}
      </Pressable>
    )
  }

  const data = images.slice(0, 4)

  return (
    <>
      <ResponsiveGrid
        data={data.map((image, index) => ({
          ...image,
          widthRatio: data.length === 3 && index === 0 ? 2 : undefined,
        }))}
        keyExtractor={(item: PostMedia) => item.url}
        maxItemsPerColumn={2}
        renderItem={({ index, item }: { index: number; item: PostMedia }) => (
          <Pressable
            delayed
            onLongPress={onLongPress}
            onPress={() => {
              onPress(index)
            }}
            style={styles.image}
          >
            <Image
              {...placeholder}
              priority={viewing ? 'high' : 'normal'}
              recyclingKey={recyclingKey}
              source={item.thumbnail}
              style={styles.image}
            />

            {nsfw || spoiler ? (
              <GalleryBlur label={t(spoiler ? 'spoiler' : 'nsfw')} />
            ) : null}

            {item.type === 'gif' ? (
              <View style={[styles.label, styles.gif]}>
                <Text contrast size="1" weight="medium">
                  {t('gif')}
                </Text>
              </View>
            ) : null}
          </Pressable>
        )}
      />

      {images.length > 4 ? (
        <View style={[styles.label, styles.count]}>
          <Text contrast size="1" weight="medium">
            {t('items', {
              count: images.length,
            })}
          </Text>
        </View>
      ) : null}
    </>
  )
}

const stylesheet = createStyleSheet((theme) => ({
  blur: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    gap: theme.space[4],
    justifyContent: 'center',
  },
  count: {
    right: theme.space[2],
  },
  gif: {
    left: theme.space[2],
  },
  image: {
    flex: 1,
  },
  label: {
    backgroundColor: theme.colors.black.accentAlpha,
    borderCurve: 'continuous',
    borderRadius: theme.radius[2],
    bottom: theme.space[2],
    paddingHorizontal: theme.space[1],
    paddingVertical: theme.space[1] / 2,
    position: 'absolute',
  },
  more: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.black.accentAlpha,
  },
  one: (aspectRatio: number) => ({
    aspectRatio,
  }),
}))
