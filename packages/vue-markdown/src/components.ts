import type { Root } from 'hast'
import type { Options as TRehypeOptions } from 'mdast-util-to-hast'
import type { PluggableList } from 'unified'
import type { PropType } from 'vue'

import type { CustomAttrs, SanitizeOptions, TVueMarkdown } from './types'
import {
  defineComponent,
  toRefs,
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

// export the public type for h/tsx inference
// also to avoid inline import() in generated d.ts files
export const VueMarkdown: TVueMarkdown = vueMarkdownImpl as any
