import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'
import { useCallback } from 'react'
import { useStyles } from 'react-native-unistyles'
import { z } from 'zod'

import { PostList } from '~/components/posts/list'
import { SortIntervalMenu } from '~/components/posts/sort-interval'
import { useList } from '~/hooks/list'
import { useSorting } from '~/hooks/sorting'
import { iPad } from '~/lib/common'
import { useDefaults } from '~/stores/defaults'
import { FeedType } from '~/types/sort'

const schema = z.object({
  feed: z.string().optional(),
  type: z.enum(FeedType).catch(useDefaults.getState().feedType),
})

export type HomeParams = z.infer<typeof schema>

export default function Screen() {
  const navigation = useNavigation()
  const params = schema.parse(useLocalSearchParams())

  const { theme } = useStyles()

  const listProps = useList({
    padding: iPad ? theme.space[4] : undefined,
  })

  const type = params.type === 'home' ? 'feed' : 'community'

  const { sorting, update: updateSorting } = useSorting(
    type,
    params.feed ?? params.type,
  )

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <SortIntervalMenu
            interval={sorting.interval}
            onChange={(next) => {
              updateSorting(next)
            }}
            sort={sorting.sort}
            type={type}
          />
        ),
      })
    }, [navigation, sorting.interval, sorting.sort, type, updateSorting]),
  )

  return (
    <PostList
      community={params.type === 'home' ? undefined : params.type}
      feed={params.feed}
      interval={sorting.interval}
      label="subreddit"
      listProps={listProps}
      sort={sorting.sort}
    />
  )
}
