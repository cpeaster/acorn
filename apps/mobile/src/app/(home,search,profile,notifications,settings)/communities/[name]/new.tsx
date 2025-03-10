import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import {
  KeyboardAwareScrollView,
  KeyboardEvents,
} from 'react-native-keyboard-controller'
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { z } from 'zod'

import { IconButton } from '~/components/common/icon-button'
import { Loading } from '~/components/common/loading'
import { RefreshControl } from '~/components/common/refresh-control'
import { View } from '~/components/common/view'
import { SubmissionCommunityCard } from '~/components/submission/community'
import { SubmissionFlair } from '~/components/submission/flair'
import { SubmissionImage } from '~/components/submission/image'
import { SubmissionLink } from '~/components/submission/link'
import { SubmissionMeta } from '~/components/submission/meta'
import { SubmissionText } from '~/components/submission/text'
import { SubmissionTitle } from '~/components/submission/title'
import { SubmissionType } from '~/components/submission/type'
import { useLink } from '~/hooks/link'
import { useCreatePost } from '~/hooks/mutations/posts/create'
import { useSubmission } from '~/hooks/queries/communities/submission'
import { type Submission } from '~/types/submission'

const schema = z.object({
  name: z.string().catch('acornblue'),
})

export default function Screen() {
  const params = schema.parse(useLocalSearchParams())

  const { refetch, submission } = useSubmission(params.name)

  if (!submission) {
    return <Loading />
  }

  return <Content refetch={refetch} submission={submission} />
}

type Props = {
  refetch: () => Promise<unknown>
  submission: Submission
}

function Content({ refetch, submission }: Props) {
  const insets = useSafeAreaInsets()

  const router = useRouter()
  const navigation = useNavigation()

  const { styles } = useStyles(stylesheet)

  const { handleLink } = useLink()

  const { createPost, form, isPending } = useCreatePost(submission)

  const [visible, setVisible] = useState(false)

  const onSubmit = form.handleSubmit(async (data) => {
    if (isPending) {
      return
    }

    const response = await createPost(data)

    if ('id' in response) {
      router.replace({
        params: {
          id: response.id,
        },
        pathname: '/posts/[id]',
      })
    } else {
      void handleLink(response.url)
    }

    form.reset()
  })

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <IconButton
            icon={{
              name: 'PaperPlaneTilt',
            }}
            loading={isPending}
            onPress={() => {
              void onSubmit()
            }}
          />
        ),
      })
    }, [isPending, navigation, onSubmit]),
  )

  useEffect(() => {
    const show = KeyboardEvents.addListener('keyboardWillShow', () => {
      setVisible(true)
    })

    const hide = KeyboardEvents.addListener('keyboardDidHide', () => {
      setVisible(false)
    })

    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  return (
    <FormProvider {...form}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        extraKeyboardSpace={0 - insets.bottom - 80}
        keyboardDismissMode="interactive"
        refreshControl={<RefreshControl onRefresh={refetch} />}
        style={styles.main}
      >
        <View direction="row" gap="4" justify="between" mx="4">
          <SubmissionCommunityCard community={submission.community} />

          <SubmissionType submission={submission} />
        </View>

        <View flexGrow={1} my="4">
          <SubmissionTitle />

          <Controller
            control={form.control}
            name="type"
            render={({ field }) =>
              field.value === 'image' ? (
                <SubmissionImage />
              ) : field.value === 'link' ? (
                <SubmissionLink />
              ) : (
                <SubmissionText />
              )
            }
          />
        </View>

        {!visible ? (
          <Animated.View
            entering={SlideInDown}
            exiting={SlideOutDown}
            style={styles.footer}
          >
            <SubmissionFlair submission={submission} />

            <SubmissionMeta />
          </Animated.View>
        ) : null}
      </KeyboardAwareScrollView>
    </FormProvider>
  )
}

const stylesheet = createStyleSheet((theme, runtime) => ({
  content: {
    flexGrow: 1,
    paddingVertical: theme.space[4],
  },
  footer: {
    gap: theme.space[4],
    marginHorizontal: theme.space[4],
  },
  main: {
    flex: 1,
    marginBottom:
      runtime.insets.bottom + theme.space[8] + runtime.hairlineWidth,
    marginTop: runtime.insets.top + theme.space[8] + runtime.hairlineWidth,
  },
}))
