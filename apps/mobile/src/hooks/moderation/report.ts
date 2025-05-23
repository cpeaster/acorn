import { createId } from '@paralleldrive/cuid2'
import { useMutation } from '@tanstack/react-query'

import { db } from '~/db'
import { updatePost } from '~/hooks/queries/posts/post'
import { updatePosts } from '~/hooks/queries/posts/posts'
import { isPost } from '~/lib/guards'
import { addPrefix } from '~/lib/reddit'
import { reddit } from '~/reddit/api'

export type ReportReason =
  | 'community'
  | 'HARASSMENT'
  | 'VIOLENCE'
  | 'HATE_CONTENT'
  | 'MINOR_ABUSE_OR_SEXUALIZATION'
  | 'PII'
  | 'INVOLUNTARY_PORN'
  | 'PROHIBITED_SALES'
  | 'IMPERSONATION'
  | 'COPYRIGHT'
  | 'TRADEMARK'
  | 'SELF_HARM'
  | 'SPAM'
  | 'CONTRIBUTOR_PROGRAM'

type Variables = {
  id: string
  reason: ReportReason
} & (
  | {
      postId: string
      type: 'comment'
    }
  | {
      type: 'post'
    }
)

export function useReport() {
  const { isPending, mutate } = useMutation<unknown, Error, Variables>({
    async mutationFn(variables) {
      const body = new FormData()

      body.append('api_type', 'json')
      body.append(
        'thing_id',
        addPrefix(
          variables.id,
          variables.type === 'comment' ? 'comment' : 'link',
        ),
      )

      await reddit({
        body,
        method: 'post',
        url: '/api/report',
      })
    },
    async onMutate(variables) {
      if (variables.type === 'comment') {
        updatePost(variables.postId, (draft) => {
          const index = draft.comments.findIndex(
            (comment) => comment.data.id === variables.id,
          )

          draft.comments.splice(index, 1)
        })
      }

      if (variables.type === 'post') {
        updatePosts(
          variables.id,
          (draft) => {
            if (isPost(draft)) {
              draft.hidden = true
            }
          },
          true,
        )

        await db.insert(db.schema.filters).values({
          id: createId(),
          type: variables.type,
          value: variables.id,
        })
      }
    },
  })

  return {
    isPending,
    report: mutate,
  }
}
