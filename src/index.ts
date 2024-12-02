import { defineComponent, VNodeArrayChildren, h, PropType } from 'vue'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema, Options } from 'rehype-sanitize'
import { RootContent, Root, Element, Text } from 'hast'
import { html, find } from 'property-information'
import deepmerge, { Options as DeepMergeOptions } from 'deepmerge'

type Context = {
  listDepth: number
  listOrdered: boolean
  listItemIndex: number
  currentContext?: string
}
type Attributes = Record<string, any>
type CustomAttrsValue = Record<string, any>
type CustomAttrsFunctionValue = (node: Element, combinedAttrs: Attributes) => Record<string, CustomAttrsValue>
export type CustomAttrs = Record<string, CustomAttrsValue | CustomAttrsFunctionValue>
type AliasList = string[]

export type SanitizeOptions = {
  sanitizeOptions?: Options
  mergeOptions?: DeepMergeOptions
}

export default defineComponent({
  name: 'VueMarkdown',
  props: {
    markdown: {
      type: String,
      default: '',
    },
    customAttrs: {
      type: Object as PropType<CustomAttrs>,
      default: () => ({}),
    },
    remarkPlugins: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    rehypePlugins: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    sanitize: {
      type: Boolean,
      default: false,
    },
    sanitizeOptions: {
      type: Object as PropType<SanitizeOptions>,
      default: () => ({}),
    },
  },
  setup(props, { slots, attrs }) {
    const processor = unified()
      .use(remarkParse)
      .use(props.remarkPlugins)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(props.rehypePlugins)
      .use(
        props.sanitize
          ? [
              [
                rehypeSanitize,
                deepmerge(
                  defaultSchema,
                  props.sanitizeOptions.sanitizeOptions || {},
                  props.sanitizeOptions.mergeOptions || {}
                ),
              ],
            ]
          : []
      )

    const computeCustomAttrs = (node: Element, aliasList: AliasList, combinedAttrs: Attributes) => {
      for (let i = aliasList.length - 1; i >= 0; i--) {
        const name = aliasList[i]
        if (name in props.customAttrs) {
          const customAttrs = props.customAttrs[name]

          return typeof customAttrs === 'function' ? customAttrs(node, combinedAttrs) : customAttrs
        }
      }
      return {}
    }

    const parseChildren = (nodeList: RootContent[], context: Context, parent: Element | Root): VNodeArrayChildren => {
      const keyCounter: {
        [key: string]: number
      } = {}

      return nodeList.map((node) => {
        const aliasList: AliasList = []
        let attrs = {}
        const props: Attributes = {}
        const thisContext = { ...context }

        switch (node.type) {
          case 'text':
            return [node.value]

          case 'element':
            aliasList.push(node.tagName)
            keyCounter[node.tagName] = node.tagName in keyCounter ? keyCounter[node.tagName] + 1 : 0
            props.key = `${node.tagName}-${keyCounter[node.tagName]}`
            node.properties = node.properties || {}

            attrs = Object.entries(node.properties).reduce<Attributes>((acc, [hastKey, value]) => {
              const attrInfo = find(html, hastKey)
              acc[attrInfo.attribute] = value

              return acc
            }, {})

            switch (node.tagName) {
              case 'h1':
              case 'h2':
              case 'h3':
              case 'h4':
              case 'h5':
              case 'h6':
                props.level = parseFloat(node.tagName.slice(1))
                aliasList.push('heading')
                break
              // TODO: maybe use <pre> instead for customizing from <pre> not <code> ?
              case 'code':
                props.languageOriginal = Array.isArray(props['class'])
                  ? props['class'].find((cls) => cls.startsWith('language-'))
                  : ''
                props.language = props.languageOriginal ? props.languageOriginal.replace('language-', '') : ''
                props.inline = 'tagName' in parent && parent.tagName !== 'pre'
                
                // when tagName is code, it definitely has children and the first child is text
                // https://github.com/syntax-tree/mdast-util-to-hast/blob/main/lib/handlers/code.js
                props.content = (node.children[0] as Text).value

                aliasList.push(props.inline ? 'inline-code' : 'block-code')
                break
              case 'thead':
              case 'tbody':
                thisContext.currentContext = node.tagName
                break
              case 'td':
              case 'th':
              case 'tr':
                props.isHead = context.currentContext === 'thead'
                break

              case 'ul':
              case 'ol':
                thisContext.listDepth = context.listDepth + 1
                thisContext.listOrdered = node.tagName === 'ol'
                thisContext.listItemIndex = -1
                props.ordered = thisContext.listOrdered
                props.depth = thisContext.listDepth

                aliasList.push('list')
                break

              case 'li':
                thisContext.listItemIndex++

                props.ordered = thisContext.listOrdered
                props.depth = thisContext.listDepth
                props.index = thisContext.listItemIndex
                aliasList.push('list-item')

                break
              case 'slot':
                if (typeof node.properties['slot-name'] === 'string') {
                  aliasList.push(node.properties['slot-name'])
                  delete node.properties['slot-name']
                }
                break

              // NOTE: I think slot is enough
              // case 'component':
              //   if (node.properties.is && typeof node.properties.is === 'string') {
              //     props.key = `${node.properties.is}-${keyCounter[node.tagName]}`
              //     aliasList.push('component')
              //   }
              //   break
              default:
                break
            }
            break

          default:
            return null
        }

        attrs = {
          ...attrs,
          ...computeCustomAttrs(node, aliasList, { ...attrs, ...props }),
        }

        for (let i = aliasList.length - 1; i >= 0; i--) {
          const targetSlot = slots[aliasList[i]]
          const targetSlotRender = typeof targetSlot === 'function' ? targetSlot : null
          if (targetSlotRender) {
            return targetSlotRender({
              ...attrs,
              ...props,
              children: () => parseChildren(node.children, thisContext, node),
            })
          }
        }

        return h(node.tagName, attrs, parseChildren(node.children, thisContext, node))
      })
    }

    return () => {
      const mdast = processor.parse(props.markdown)
      const hast = processor.runSync(mdast) as Root

      return h(
        'div',
        attrs,
        parseChildren(hast.children, { listDepth: -1, listOrdered: false, listItemIndex: -1 }, hast)
      )
    }
  },
})
