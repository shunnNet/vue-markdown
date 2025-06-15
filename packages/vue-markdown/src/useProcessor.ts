import type { Root } from 'hast'
import type { Root as MdastRoot } from 'mdast'
import type { Options as TRehypeOptions } from 'mdast-util-to-hast'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { SanitizeOptions } from './types'
import deepmerge from 'deepmerge'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { type PluggableList, type Processor, unified } from 'unified'
import { computed, toValue } from 'vue'

export type TUseMarkdownProcessorOptions = {
  remarkPlugins?: MaybeRefOrGetter<PluggableList>
  rehypePlugins?: MaybeRefOrGetter<PluggableList>
  rehypeOptions?: MaybeRefOrGetter<Omit<TRehypeOptions, 'file'>>
  sanitize?: MaybeRefOrGetter<boolean>
  sanitizeOptions?: MaybeRefOrGetter<SanitizeOptions>
}
export function useMarkdownProcessor(options?: TUseMarkdownProcessorOptions): { processor: ComputedRef<Processor<MdastRoot, MdastRoot, Root, undefined, undefined>> } {
  const processor = computed(() => {
    return createProcessor({
      prePlugins: [remarkParse, ...(toValue(options?.remarkPlugins) ?? [])],
      rehypePlugins: toValue(options?.rehypePlugins),
      rehypeOptions: toValue(options?.rehypeOptions),
      sanitize: toValue(options?.sanitize),
      sanitizeOptions: toValue(options?.sanitizeOptions),
    })
  })
  return { processor }
}

export function createProcessor(options?: {
  prePlugins?: PluggableList
  rehypePlugins?: PluggableList
  rehypeOptions?: Omit<TRehypeOptions, 'file'>
  sanitize?: boolean
  sanitizeOptions?: SanitizeOptions
  // TODO: fix types
}): Processor<any, any, any, any, any> {
  return unified()
    .use(options?.prePlugins ?? [])
    .use(remarkRehype, { allowDangerousHtml: true, ...(options?.rehypeOptions || {}) })
    .use(options?.rehypePlugins ?? [])
    .use(
      options?.sanitize
        ? [
            [
              rehypeSanitize,
              deepmerge(
                defaultSchema,
                options?.sanitizeOptions?.sanitizeOptions || {},
                options?.sanitizeOptions?.mergeOptions || {},
              ),
            ],
          ]
        : [],
    )
}
