import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'
import { useVideoPlayer, type VideoSource, VideoView } from 'expo-video'
import { useEffect, useRef, useState } from 'react'
import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { useTranslations } from 'use-intl'

import { Text } from '~/components/common/text'
import { View } from '~/components/common/view'
import { useHistory } from '~/hooks/history'
import { usePreferences } from '~/stores/preferences'
import { type PostMedia } from '~/types/post'

import { Icon } from '../../common/icon'
import { Pressable } from '../../common/pressable'

type Props = {
  compact?: boolean
  crossPost?: boolean
  large?: boolean
  nsfw?: boolean
  onLongPress?: () => void
  recyclingKey?: string
  source: VideoSource
  style?: StyleProp<ViewStyle>
  video: PostMedia
  viewing: boolean
}

export function VideoPlayer({
  compact,
  crossPost,
  large,
  nsfw,
  onLongPress,
  recyclingKey,
  source,
  style,
  video,
  viewing,
}: Props) {
  const t = useTranslations('component.posts.video')

  const { blurNsfw, feedMuted, seenOnMedia, unmuteFullscreen } =
    usePreferences()
  const { addPost } = useHistory()

  const { styles, theme } = useStyles(stylesheet)

  const ref = useRef<VideoView>(null)

  const previousMuted = useRef(feedMuted)

  const [visible, setVisible] = useState(false)
  const [muted, setMuted] = useState(feedMuted)

  const player = useVideoPlayer(source, (instance) => {
    instance.muted = true
    instance.loop = true
    instance.audioMixingMode = 'mixWithOthers'

    if (viewing) {
      instance.play()
    }
  })

  useEffect(() => {
    player.muted = muted

    if (visible || viewing) {
      player.play()
    } else {
      player.pause()
    }
  }, [blurNsfw, muted, nsfw, player, viewing, visible])

  if (compact) {
    return (
      <Pressable
        onLongPress={onLongPress}
        onPress={() => {
          void ref.current?.enterFullscreen()

          if (recyclingKey && seenOnMedia) {
            addPost({
              id: recyclingKey,
            })
          }
        }}
        style={styles.compact(large)}
      >
        <Image source={video.thumbnail} style={styles.compactImage} />

        <View align="center" justify="center" style={styles.compactIcon}>
          <Icon color={theme.colors.accent.a9} name="Play" weight="fill" />
        </View>

        <VideoView
          contentFit="cover"
          onFullscreenEnter={() => {
            previousMuted.current = muted

            if (unmuteFullscreen && muted) {
              setMuted(false)
            }

            setVisible(true)
          }}
          onFullscreenExit={() => {
            setMuted(previousMuted.current)

            setVisible(false)
          }}
          player={player}
          pointerEvents="none"
          ref={ref}
          style={styles.compactVideo}
        />

        {nsfw && blurNsfw ? (
          <BlurView intensity={100} pointerEvents="none" style={styles.blur}>
            <Icon
              color={theme.colors.accent.a9}
              name="Warning"
              size={theme.space[5]}
              weight="fill"
            />
          </BlurView>
        ) : null}
      </Pressable>
    )
  }

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={() => {
        void ref.current?.enterFullscreen()

        if (recyclingKey && seenOnMedia) {
          addPost({
            id: recyclingKey,
          })
        }
      }}
      style={[styles.main(crossPost), style]}
    >
      <VideoView
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        allowsVideoFrameAnalysis={false}
        contentFit="cover"
        onFullscreenEnter={() => {
          previousMuted.current = muted

          if (unmuteFullscreen && muted) {
            setMuted(false)
          }

          setVisible(true)
        }}
        onFullscreenExit={() => {
          setMuted(previousMuted.current)

          setVisible(false)
        }}
        player={player}
        ref={ref}
        style={styles.video(video.width / video.height)}
      />

      {nsfw && blurNsfw ? (
        <BlurView intensity={100} pointerEvents="none" style={styles.blur}>
          <Icon
            color={theme.colors.gray.a12}
            name="Warning"
            size={theme.space[6]}
            weight="fill"
          />

          <Text weight="medium">{t('nsfw')}</Text>
        </BlurView>
      ) : (
        <Pressable
          hitSlop={theme.space[2]}
          onPress={() => {
            setMuted(() => !muted)
          }}
          p="2"
          style={styles.volume}
        >
          <Icon
            color={theme.colors.gray.contrast}
            name={muted ? 'SpeakerSimpleX' : 'SpeakerSimpleHigh'}
            size={theme.space[4]}
          />
        </Pressable>
      )}
    </Pressable>
  )
}

const stylesheet = createStyleSheet((theme, runtime) => ({
  blur: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    gap: theme.space[4],
    justifyContent: 'center',
  },
  compact: (large?: boolean) => ({
    backgroundColor: theme.colors.gray.a3,
    borderCurve: 'continuous',
    borderRadius: theme.space[large ? 2 : 1],
    height: theme.space[8] * (large ? 2 : 1),
    overflow: 'hidden',
    width: theme.space[8] * (large ? 2 : 1),
  }),
  compactIcon: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.black.a9,
  },
  compactImage: {
    flex: 1,
  },
  compactVideo: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  main: (crossPost?: boolean) => ({
    justifyContent: 'center',
    maxHeight: runtime.screen.height * (crossPost ? 0.4 : 0.8),
    overflow: 'hidden',
  }),
  video: (aspectRatio: number) => ({
    aspectRatio,
  }),
  volume: {
    backgroundColor: theme.colors.black.a9,
    borderCurve: 'continuous',
    borderRadius: theme.space[4],
    bottom: theme.space[2],
    position: 'absolute',
    right: theme.space[2],
  },
}))
