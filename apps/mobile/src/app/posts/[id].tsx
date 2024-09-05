import { useIsFocused } from '@react-navigation/native'
import { FlashList } from '@shopify/flash-list'
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router'
import { useRef, useState } from 'react'
import { type TextInput } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { useTranslations } from 'use-intl'
import { z } from 'zod'

import { CommentCard } from '~/components/comments/card'
import { CommentMoreCard } from '~/components/comments/more'
import { CommentsSortMenu } from '~/components/comments/sort'
import { Empty } from '~/components/common/empty'
import { Loading } from '~/components/common/loading'
import { Pressable } from '~/components/common/pressable'
import { RefreshControl } from '~/components/common/refresh-control'
import { Spinner } from '~/components/common/spinner'
import { Text } from '~/components/common/text'
import { View } from '~/components/common/view'
import { HeaderButton } from '~/components/navigation/header-button'
import { PostCard } from '~/components/posts/card'
import { PostReplyCard } from '~/components/posts/reply'
import { usePost } from '~/hooks/queries/posts/post'
import { listProps } from '~/lib/common'
import { isUser, removePrefix } from '~/lib/reddit'
import { usePreferences } from '~/stores/preferences'
import { type Comment } from '~/types/comment'
import { type Post } from '~/types/post'

const schema = z.object({
  commentId: z.string().min(0).optional().catch(undefined),
  id: z.string().catch('17jkixh'),
})

export default function Screen() {
  const router = useRouter()
  const navigation = useNavigation()

  const params = schema.parse(useLocalSearchParams())

  const focused = useIsFocused()

  const t = useTranslations('screen.posts.post')

  const { postCommentSort } = usePreferences()

  const { styles } = useStyles(stylesheet)

  const list = useRef<FlashList<Post | Comment | null | undefined>>(null)
  const reply = useRef<TextInput>(null)

  const [sort, setSort] = useState(postCommentSort)
  const [commentId, setCommentId] = useState<string>()
  const [user, setUser] = useState<string>()

  const { collapse, collapsed, comments, isFetching, post, refetch } = usePost({
    commentId: params.commentId,
    id: params.id,
    sort,
  })

  useFocusEffect(() => {
    navigation.setOptions({
      headerTitle: () =>
        post ? (
          <Pressable
            height="8"
            justify="center"
            onPress={() => {
              if (isUser(post.subreddit)) {
                router.navigate({
                  params: {
                    name: removePrefix(post.subreddit),
                  },
                  pathname: '/users/[name]',
                })
              } else {
                router.navigate({
                  params: {
                    name: removePrefix(post.subreddit),
                  },
                  pathname: '/communities/[name]',
                })
              }
            }}
            px="3"
          >
            <Text weight="bold">{post.subreddit}</Text>
          </Pressable>
        ) : null,
    })
  })

  return (
    <>
      <FlashList
        {...listProps}
        ItemSeparatorComponent={() => <View height="2" />}
        ListEmptyComponent={
          isFetching ? post ? <Spinner m="4" /> : <Loading /> : <Empty />
        }
        data={[post, null, ...comments]}
        estimatedItemSize={72}
        extraData={{
          commentId: params.commentId,
        }}
        getItemType={(item) => {
          if (item === null) {
            return 'sticky'
          }

          if (item?.type === 'more' || item?.type === 'reply') {
            return 'comment'
          }

          return 'post'
        }}
        keyExtractor={(item) => {
          if (item === null) {
            return 'sticky'
          }

          if (item?.type === 'more' || item?.type === 'reply') {
            return item.data.id
          }

          return 'post'
        }}
        keyboardDismissMode="on-drag"
        ref={list}
        refreshControl={<RefreshControl onRefresh={refetch} />}
        renderItem={({ item }) => {
          if (item === null) {
            return (
              <View align="center" direction="row" style={styles.header}>
                {params.commentId ? (
                  <HeaderButton
                    icon="ArrowLeft"
                    onPress={() => {
                      list.current?.scrollToIndex({
                        animated: true,
                        index: 1,
                      })

                      router.setParams({
                        commentId: '',
                      })
                    }}
                  />
                ) : null}

                <Text ml={params.commentId ? undefined : '4'} weight="bold">
                  {t('comments')}
                </Text>

                <CommentsSortMenu
                  onChange={setSort}
                  style={styles.menu}
                  value={sort}
                />
              </View>
            )
          }

          if (!item) {
            return null
          }

          if (item.type === 'reply') {
            const hidden = collapsed.includes(item.data.id)

            return (
              <CommentCard
                collapsed={hidden}
                comment={item.data}
                onPress={() => {
                  if (params.commentId) {
                    return
                  }

                  collapse({
                    commentId: item.data.id,
                    hide: !hidden,
                  })
                }}
                onReply={() => {
                  setCommentId(item.data.id)
                  setUser(item.data.user.name)

                  reply.current?.focus()
                }}
              />
            )
          }

          if (item.type === 'more') {
            return (
              <CommentMoreCard
                comment={item.data}
                onThread={(id) => {
                  list.current?.scrollToIndex({
                    animated: true,
                    index: 0,
                  })

                  router.setParams({
                    commentId: id,
                  })
                }}
                post={post}
              />
            )
          }

          return (
            <PostCard expanded label="user" post={item} viewing={focused} />
          )
        }}
        stickyHeaderIndices={[1]}
      />

      <PostReplyCard
        commentId={commentId}
        onReset={() => {
          if (!post) {
            return
          }

          setCommentId(undefined)
          setUser(undefined)
        }}
        postId={post?.id}
        ref={reply}
        user={user}
      />
    </>
  )
}

const stylesheet = createStyleSheet((theme) => ({
  header: {
    backgroundColor: theme.colors.gray[2],
  },
  menu: {
    marginLeft: 'auto',
  },
}))
