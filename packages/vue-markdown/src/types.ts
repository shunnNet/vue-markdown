import type { Options as DeepMergeOptions } from 'deepmerge'
import type { Element } from 'hast'
import type { Options as TRehypeOptions } from 'mdast-util-to-hast'
import type { Options } from 'rehype-sanitize'
import type { PluggableList } from 'unified'
import type {
  AllowedComponentProps,
  ComponentCustomProps,
  VNode,
  VNodeArrayChildren,
  VNodeProps,
} from 'vue'

export type Context = {
  listDepth: number
  listOrdered: boolean
  listItemIndex: number
  currentContext?: string
  svg: boolean
}
export type Attributes = Record<string, string>

type TTableProps = {
  /** whether it is in head */
  isHead: boolean
}

type THeadingProps = {
  /** heading level */
  level: number
}

type TListProps = {
  /** depth of the list */
  depth: number
  /** whether it is ordered list */
  ordered: boolean
}

type TCodeProps = {
  /** language name original @example 'language-js' */
  languageOriginal: string

  /** language name @example 'js' */
  language: string

  /** code content */
  content: string

  /** whether it is inline code */
  inline: boolean
}

// https://www.google.com/search?q=record%3Cstring,+any%3E+vs+record%3Cstring,+unknown%3E&sourceid=chrome&ie=UTF-8
export type CustomAttrsObjectResult = Record<string, unknown>

type CustomAttrsFunctionValue<T> = (
  /**
   * hast node
   *
   * Please refer to the source code at the following URL to understand the possible attributes for each element.
   *
   * @see https://github.com/syntax-tree/mdast-util-to-hast/tree/main/lib/handlers
   */
  node: Element,
  /**
   * Properties of the current element.
   *
   * Except for the basic properties provided from hast, it also includes custom properties such as `level`, `ordered`, `depth`, `index` etc.
   */
  combinedAttrs: T | Attributes
) => Record<string, unknown>

type CustomAttrsValue<T extends Record<string, unknown> = Record<string, unknown>>
  = CustomAttrsObjectResult | CustomAttrsFunctionValue<T>

type TBasicHTMLTagNames = keyof Omit<
  HTMLElementTagNameMap,
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'ul' | 'ol' | 'li' | 'code' | 'td' | 'th' | 'tr'
>
export type CustomAttrs = {
  [key in TBasicHTMLTagNames]?: CustomAttrsValue // << dynamic properties
} & {
  [key: string]: CustomAttrsValue
    | CustomAttrsValue<THeadingProps>
    | CustomAttrsValue<TListProps>
    | CustomAttrsValue<TCodeProps>
    | CustomAttrsValue<TTableProps>
    | undefined
  ['h1']?: CustomAttrsValue<THeadingProps> // << static properties
  ['h2']?: CustomAttrsValue<THeadingProps>
  ['h3']?: CustomAttrsValue<THeadingProps>
  ['h4']?: CustomAttrsValue<THeadingProps>
  ['h5']?: CustomAttrsValue<THeadingProps>
  ['h6']?: CustomAttrsValue<THeadingProps>
  ['heading']?: CustomAttrsValue<THeadingProps>
  ['ul']?: CustomAttrsValue<TListProps>
  ['ol']?: CustomAttrsValue<TListProps>
  ['list']?: CustomAttrsValue<TListProps>
  ['li']?: CustomAttrsValue<TListProps>
  ['list-item']?: CustomAttrsValue<TListProps>
  ['code']?: CustomAttrsValue<TCodeProps>
  ['inline-code']?: CustomAttrsValue<TCodeProps>
  ['block-code']?: CustomAttrsValue<TCodeProps>
  ['td']?: CustomAttrsValue<TTableProps>
  ['th']?: CustomAttrsValue<TTableProps>
  ['tr']?: CustomAttrsValue<TTableProps>
}

export type AliasList = string[]
export type TagList = AliasList

export type SanitizeOptions = {
  /**
   * Options for `rehype-sanitize`
   *
   * @see https://github.com/rehypejs/rehype-sanitize
   */
  sanitizeOptions?: Options
  /**
   * Options for `deepmerge`
   */
  mergeOptions?: DeepMergeOptions
}

export type TVueMarkdownProps = {
  /**
   * Markdown content
   *
   * @default '''
   */
  markdown: string
  /**
   * You can set custom attributes for each element, such as `href`, `target`, `rel`, `lazyload`, etc.
   *
   * The key is the HTML tag name, and the value can either be an object or a function that returns an object.
   *
   * The value will be passed to Vue's `h` function. You can refer to Vue's official documentation to learn how to configure `h`.
   *
   * @see https://vuejs.org/guide/extras/render-function.html#render-functions-jsx
   *
   * @default {}
   *
   * @example
   * ```ts
   * {
   *  a: { target: '_blank', rel: 'noopener' },
   *  img: { lazyload: true },
   *  h1: (node, combinedAttrs) => {
   *    return { class: ['title', 'mb-2'] }
   *  }
   * }
   * ```
   */
  customAttrs?: CustomAttrs
  /**
   * Remark plugins
   *
   * These plugins will be used between `remark-parse` and `remark-rehype`.
   *
   * @see https://github.com/remarkjs/remark?tab=readme-ov-file#plugins
   *
   * @default []
   */
  remarkPlugins?: PluggableList
  /**
   * rehype plugins
   *
   * These plugins will be used after `remark-rehype` but before `rehype-sanitize`.
   *
   * @see https://github.com/remarkjs/remark-rehype?tab=readme-ov-file#related
   *
   * @default []
   */
  rehypePlugins?: PluggableList
  /**
   * Whether to sanitize the HTML content. (use `rehype-sanitize`)
   *
   * You need disable this option if you want to render `<slot>` in markdown content.
   *
   * @default false
   */
  sanitize?: boolean
  /**
   * Options for `rehype-sanitize`
   *
   * @see https://github.com/rehypejs/rehype-sanitize?tab=readme-ov-file#options
   *
   * @default { allowDangerousHtml: true }
   */
  sanitizeOptions?: SanitizeOptions

  /**
   * Options for `rehype-parse`
   *
   * @see https://github.com/remarkjs/remark-rehype?tab=readme-ov-file#options
   *
   * @default {}
   */
  rehypeOptions?: Omit<TRehypeOptions, 'file'>
}

/**
 * Typed version of the `VueMarkdown` component.
 *
 * Copy from vue-router
 */
export type TVueMarkdown = {
  new(): {
    $props: AllowedComponentProps
      & ComponentCustomProps
      & VNodeProps
      & TVueMarkdownProps

    $slots: TBaseSlots & {
      /**
       * Customize `<h1>` tag
       * @scope `level` heading level
       * @scope `children` Functional component, child elements.
       */
      ['h1']?: THeadingSlot
      /**
       * Customize `<h2>` tag
       * @scope `level` heading level
       * @scope `children` Functional component, child elements.
       */
      ['h2']?: THeadingSlot
      /**
       * Customize `<h3>` tag
       * @scope `level` heading level
       * @scope `children` Functional component, child elements.
       */
      ['h3']?: THeadingSlot
      /**
       * Customize `<h4>` tag
       * @scope `level` heading level
       * @scope `children` Functional component, child elements.
       */
      ['h4']?: THeadingSlot
      /**
       * Customize `<h5>` tag
       * @scope `level` heading level
       * @scope `children` Functional component, child elements.
       */
      ['h5']?: THeadingSlot
      /**
       * Customize `<h6>` tag
       * @scope `level` heading level
       * @scope `children` Functional component, child elements.
       */
      ['h6']?: THeadingSlot
      /**
       * Customize `<h1>` ~ `<h6>`  tag
       * @scope `level` heading level
       * @scope `children` Functional component, child elements.
       */
      ['heading']?: THeadingSlot

      /**
       * Customize inline and block code.
       * @scope `languageOriginal` language name original
       * @scope `language` language name
       * @scope `content` code content
       * @scope `inline` whether it is inline code
       * @scope `children` Functional component, child elements.
       */
      ['code']?: TCodeSlot
      /**
       * Customize inline code.
       * @scope `languageOriginal` language name original
       * @scope `language` language name
       * @scope `content` code content
       * @scope `inline` whether it is inline code
       * @scope `children` Functional component, child elements.
       */
      ['inline-code']?: TCodeSlot
      /**
       * Customize block code.
       * @scope `languageOriginal` language name original
       * @scope `language` language name
       * @scope `content` code content
       * @scope `inline` whether it is inline code
       * @scope `children` Functional component, child elements.
       */
      ['block-code']?: TCodeSlot

      /**
       * Customize unordered list
       * @scope `depth` depth of the list
       * @scope `ordered` whether it is ordered list
       * @scope `children` Functional component, child elements.
       */
      ['ul']?: TListSlot

      /**
       * Customize ordered list
       * @scope `depth` depth of the list
       * @scope `ordered` whether it is ordered list
       * @scope `children` Functional component, child elements.
       */
      ['ol']?: TListSlot
      /**
       * Customize ordered and unordered list
       * @scope `depth` depth of the list
       * @scope `ordered` whether it is ordered list
       * @scope `children` Functional component, child elements.
       */
      ['list']?: TListSlot

      /**
       * Customize list item
       * @scope `depth` depth of the list
       * @scope `ordered` whether it is ordered list
       * @scope `index` index of the list item
       * @scope `children` Functional component, child elements.
       */
      ['li']?: TListSlot

      /**
       * Customize list item
       * @scope `depth` depth of the list
       * @scope `ordered` whether it is ordered list
       * @scope `index` index of the list item
       * @scope `children` Functional component, child elements.
       */
      ['list-item']?: TListSlot

      /**
       * Customize table element: td
       *
       * @scope `isHead` whether it is in head
       * @scope `children` Functional component, child elements.
       */
      ['td']?: TTableElementSlot

      /**
       * Customize table element: th
       *
       * @scope `isHead` whether it is in head
       * @scope `children` Functional component, child elements.
       */
      ['th']?: TTableElementSlot

      /**
       * Customize table element: tr
       *
       * @scope `isHead` whether it is in head
       * @scope `children` Functional component, child elements.
       */
      ['tr']?: TTableElementSlot
    }
  }
}

type TTableElementSlot = TCustomSlot<TTableProps>
type TListSlot = TCustomSlot<TListProps>
type THeadingSlot = TCustomSlot<THeadingProps>
type TCodeSlot = TCustomSlot<TCodeProps>

type HtmlTagNames = keyof HTMLElementTagNameMap
type TBaseSlots = {
  // An index signature parameter type cannot be a literal type or generic type. Consider using a mapped object type instead.ts(1337)
  // [key: HtmlTagNames]: (scope: Record<string, any>) => VNode[] | VNode
  [key in HtmlTagNames]?: (scope: TBaseSlotScope) => VNode[] | VNode
} & {
  [key: string]: (scope: TBaseSlotScope) => VNode[] | VNode
}

type TBaseSlotScope = TElementChild & Attributes
type TElementChild = {
  /** Functional component, child elements.  */
  children: () => VNodeArrayChildren
}

type TCustomSlot<T> = (
  scope: TBaseSlotScope & T
) => VNode[] | VNode
