import type { Root } from 'hast'
import type { Options as TRehypeOptions } from 'mdast-util-to-hast'
import type { PluggableList } from 'unified'
import type { PropType } from 'vue'

import type { CustomAttrs, SanitizeOptions, TVueMarkdown } from './types'
import {
  defineComponent,
  shallowRef,
  toRefs,
  watch,
} from 'vue'
import { render } from './hast-to-vnode'
import { useMarkdownProcessor } from './useProcessor'

export type { CustomAttrs, SanitizeOptions, TVueMarkdown }

const sharedProps = {
  markdown: {
    type: String as PropType<string>,
    default: '',
  },
  customAttrs: {
    type: Object as PropType<CustomAttrs>,
    default: () => ({}),
  },
  remarkPlugins: {
    type: Array as PropType<PluggableList>,
    default: () => [],
  },
  rehypePlugins: {
    type: Array as PropType<PluggableList>,
    default: () => [],
  },
  rehypeOptions: {
    type: Object as PropType<Omit<TRehypeOptions, 'file'>>,
    default: () => ({}),
  },
  sanitize: {
    type: Boolean,
    default: false,
  },
  sanitizeOptions: {
    type: Object as PropType<SanitizeOptions>,
    default: () => ({}),
  },
}
const vueMarkdownImpl = defineComponent({
  name: 'VueMarkdown',
  props: sharedProps,
  setup(props, { slots, attrs }) {
    const { markdown, remarkPlugins, rehypePlugins, rehypeOptions, sanitize, sanitizeOptions, customAttrs } = toRefs(props)
    const { processor } = useMarkdownProcessor({
      remarkPlugins,
      rehypePlugins,
      rehypeOptions,
      sanitize,
      sanitizeOptions,
    })

    return () => {
      const mdast = processor.value.parse(markdown.value)
      const hast = processor.value.runSync(mdast) as Root
      return render(hast, attrs, slots, customAttrs.value)
    }
  },
})

const vueMarkdownAsyncImpl = defineComponent({
  name: 'VueMarkdownAsync',
  props: sharedProps,
  async setup(props, { slots, attrs }) {
    const { markdown, remarkPlugins, rehypePlugins, rehypeOptions, sanitize, sanitizeOptions, customAttrs } = toRefs(props)
    const { processor } = useMarkdownProcessor({
      remarkPlugins,
      rehypePlugins,
      rehypeOptions,
      sanitize,
      sanitizeOptions,
    })

    const hast = shallowRef<Root | null>(null)
    const process = async (): Promise<void> => {
      const mdast = processor.value.parse(markdown.value)
      hast.value = await processor.value.run(mdast) as Root
    }

    watch(() => [markdown.value, processor.value], process, { flush: 'sync' })

    await process()

    return () => {
      return hast.value ? render(hast.value, attrs, slots, customAttrs.value) : null
    }
  },
})

// export the public type for h/tsx inference
// also to avoid inline import() in generated d.ts files
export const VueMarkdown: TVueMarkdown = vueMarkdownImpl as any

// export the public type for h/tsx inference
// also to avoid inline import() in generated d.ts files
export const VueMarkdownAsync: TVueMarkdown = vueMarkdownAsyncImpl as any
