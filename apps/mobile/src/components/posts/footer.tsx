import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { useFormatter } from 'use-intl'

import { type FeedType, type TopInterval } from '~/hooks/queries/posts/posts'
import { type Post } from '~/types/post'

import { Icon, type IconName } from '../common/icon'
import { Pressable } from '../common/pressable'
import { Text } from '../common/text'
import { PostSaveCard } from './save'
import { PostShareCard } from './share'
import { PostVoteCard } from './vote'

type Props = {
  feedType?: FeedType
  interval?: TopInterval
  post: Post
  subreddit?: string
}

export function PostFooterCard({ feedType, interval, post, subreddit }: Props) {
  const router = useRouter()

  const f = useFormatter()

  const { styles, theme } = useStyles(stylesheet)

  const items = [
    {
      icon: 'ThumbsUp' satisfies IconName,
      key: 'votes',
      label: f.number(post.votes, {
        notation: 'compact',
      }),
    },
    {
      icon: 'ChatCircleText' satisfies IconName,
      key: 'comments',
      label: f.number(post.comments, {
        notation: 'compact',
      }),
    },
    {
      icon: 'Clock' satisfies IconName,
      key: 'created',
      label: f.relativeTime(post.createdAt, {
        style: 'narrow',
      }),
    },
  ] as const

  return (
    <Pressable
      onPress={() => {
        router.navigate(`/posts/${post.id}`)
      }}
      style={styles.main}
    >
      <View style={styles.meta}>
        <Pressable
          hitSlop={theme.space[4]}
          onPress={() => {
            router.navigate(`/communities/${post.subreddit}`)
          }}
        >
          <Text highContrast={false} lines={1} size="2" weight="medium">
            {post.subreddit}
          </Text>
        </Pressable>

        <View style={styles.items}>
          {items.map((item) => (
            <View key={item.key} style={styles.item}>
              <Icon
                color={theme.colors.gray[post.read ? 'a11' : 'a12']}
                name={item.icon}
                size={theme.typography[2].fontSize}
              />

              <Text highContrast={!post.read} size="2" tabular>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <PostVoteCard
          feedType={feedType}
          interval={interval}
          post={post}
          subreddit={subreddit}
        />

        <PostShareCard post={post} />

        <PostSaveCard
          feedType={feedType}
          interval={interval}
          post={post}
          subreddit={subreddit}
        />
      </View>
    </Pressable>
  )
}

const stylesheet = createStyleSheet((theme) => ({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space[2],
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space[1],
  },
  items: {
    flexDirection: 'row',
    gap: theme.space[2],
  },
  main: {
    flexDirection: 'row',
    gap: theme.space[4],
    padding: theme.space[3],
  },
  meta: {
    alignItems: 'flex-start',
    flex: 1,
    gap: theme.space[2],
  },
}))
