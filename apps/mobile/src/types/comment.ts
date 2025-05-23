import { type Nullable } from '.'
import { type Flair } from './flair'
import { type PostMediaMeta } from './post'

export type Comment =
  | {
      data: CommentReply
      type: 'reply'
    }
  | {
      data: CommentMore
      type: 'more'
    }

export type CommentReply = {
  body: string
  collapsed: boolean
  community: {
    id: string
    name: string
  }
  createdAt: Date
  depth: number
  edited: boolean
  flair: Array<Flair>
  id: string
  liked: Nullable<boolean>
  media: {
    meta: PostMediaMeta
  }
  op: boolean
  parentId?: string
  permalink: string
  post: {
    author?: string
    id: string
    permalink?: string
    title?: string
  }
  saved: boolean
  sticky: boolean
  user: {
    createdAt?: Date
    id?: string
    image?: string
    name: string
  }
  votes: number
}

export type CommentMore = {
  children: Array<string>
  count: number
  depth: number
  id: string
  parentId: string
}
