import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query'

import { REDDIT_URI, redditApi } from '~/lib/reddit'
import { PostsSchema } from '~/schemas/reddit/posts'
import { useAuth } from '~/stores/auth'
import { transformPost } from '~/transformers/post'
import { type Post } from '~/types/post'
import { type FeedSort, type TopInterval } from '~/types/sort'

type Param = string | undefined | null

type Page = {
  cursor: Param
  posts: Array<Post>
}

export type PostsQueryKey = [
  'posts',
  {
    community?: string
    interval?: TopInterval
    sort?: FeedSort
  },
]

export type PostsQueryData = InfiniteData<Page, Param>

export type PostsProps = {
  community?: string
  interval?: TopInterval
  sort: FeedSort
}

export function usePosts({ community, interval, sort }: PostsProps) {
  const { accessToken, expired } = useAuth()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery<Page, Error, PostsQueryData, PostsQueryKey, Param>({
    enabled: !expired,
    getNextPageParam(page) {
      return page.cursor
    },
    initialPageParam: null,
    async queryFn({ pageParam }) {
      const path = community ? `/r/${community}` : `/${sort}`

      const url = new URL(path, REDDIT_URI)

      url.searchParams.set('limit', '25')

      if (pageParam) {
        url.searchParams.set('after', pageParam)
      }

      if (interval) {
        url.searchParams.set('t', interval)
      }

      const payload = await redditApi({
        accessToken,
        url,
      })

      const response = PostsSchema.parse(payload)

      return {
        cursor: response.data.after,
        posts: response.data.children.map((item) => transformPost(item.data)),
      }
    },
    queryKey: [
      'posts',
      {
        community,
        interval,
        sort,
      },
    ],
  })

  return {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    posts: data?.pages.flatMap((page) => page.posts) ?? [],
    refetch,
  }
}
