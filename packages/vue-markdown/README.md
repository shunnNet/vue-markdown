# @crazydos/vue-markdown
[![npm version](https://img.shields.io/npm/v/@crazydos/vue-markdown.svg)](https://www.npmjs.com/package/@crazydos/vue-markdown)
[![npm downloads](https://img.shields.io/npm/dm/@crazydos/vue-markdown.svg)](https://www.npmjs.com/package/@crazydos/vue-markdown)
[![License](https://img.shields.io/github/license/nuxt/nuxt.svg)](https://github.com/shunnNet/vue-markdown/blob/main/LICENSE)

This is a package that provide Vue 3+ component to render markdown content with [`unified`](https://github.com/unifiedjs/unified) pipeline.

And is referenced from [`react-markdown`](https://github.com/remarkjs/react-markdown).

- [@crazydos/vue-markdown](#crazydosvue-markdown)
  - [Features](#features)
  - [Online example \& playground](#online-example--playground)
  - [Migration: for `v0.x` users:](#migration-for-v0x-users)
    - [Use named import](#use-named-import)
    - [Slot prefix](#slot-prefix)
  - [Install](#install)
  - [Unified plugins version](#unified-plugins-version)
  - [Usages](#usages)
    - [Basic](#basic)
    - [Rendering `GFM`](#rendering-gfm)
    - [Custom attributes](#custom-attributes)
    - [Customize tag rendering with scoped slot](#customize-tag-rendering-with-scoped-slot)
      - [re-render issue](#re-render-issue)
    - [Use `<slot>` in markdown](#use-slot-in-markdown)
    - [Security](#security)
  - [Documentation](#documentation)
    - [`<VueMarkdown>` Props](#vuemarkdown-props)
    - [`scoped slot` and `custom attrs`](#scoped-slot-and-custom-attrs)
    - [Attributes aliases](#attributes-aliases)
    - [Code content example](#code-content-example)
  - [Reference](#reference)
  - [License](#license)

## Features
- 🌴 Use [unified](https://github.com/unifiedjs/unified) to render Markdown (CommonMark)
- 🪑 Supports rendering of additional elements (i.e: GFM: `tables`, `footnotes`, `task lists` etc.) through [remark](https://github.com/remarkjs/remark) and [rehype](https://github.com/rehypejs/rehype) plugins.
- :hammer_and_wrench: Allows customization of tag attributes for markdown elements. (i.e: `class`, `target`, `rel` etc.)
- 🛃 Enables customization of markdown element rendering through Vue `scoped slot`.
- 🚀 Support rendering Vue component in markdown (need `rehype-raw`) 
- 🛡️ Safely renders markdown to prevent harmful content by `rehype-sanitize` 
- 📝 Fully typed with TypeScript for better developer experience and type safety.

> [!TIP]
> If this package has been helpful to you, feel free to [support me on Buy Me a Coffee](https://buymeacoffee.com/shunnnet) ~

<a href="https://buymeacoffee.com/shunnnet" target="_blank" rel="noopener noreferrer">
  <img width="150" src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png" alt="Buy Me A Coffee" />
</a>

## Online example & playground
For more usage examples and detailed plugin configuration, please refer to the [usage examples on Stackblitz](https://stackblitz.com/edit/nuxt-starter-xvieezcs?file=pages%2Findex.vue).

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/nuxt-starter-xvieezcs?file=pages%2Findex.vue)

## Migration: for `v0.x` users:
Thank you to the users of `v0.x` for motivating me to continue this project.

It is now recommended to upgrade to version `v1.x`. There are no significant differences between `v1.x` and `v0.x`, but `v1.x` has upgraded `unified` and enhanced TypeScript support.

To migrate to v1.x, please make the following adjustments:

### Use named import
v0.x:
```ts
import VueMarkdown from "@crazydos/vue-markdown"
```

v1.x
```ts
import { VueMarkdown } from "@crazydos/vue-markdown"
```

### Slot prefix
The syntax for the `<slot>` tag has changed. 

Slot name now need add prefix `s-` as follows: 

v0.x:
```html
<!-- in Markdown -->
<slot slot-name="header" />

<!-- Customize in Vue -->
<template #header>
  <CusomHeader></CusomHeader>
</header>
```

v1.x:
```html
<!-- in Markdown -->
<slot slot-name="header" />

<!-- Customize in Vue -->
<template #s-header>
  <CusomHeader></CusomHeader>
</header>
```



## Install
```sh
npm install @crazydos/vue-markdown
```

## Unified plugins version
`vue-markdown` uses `unified 11`. so please ensure that the unified plugin you intend to use corresponds to `unified 11`.

Here are the recommended versions for the plugins:

- `rehype-raw`: `^7.0.0`
- `remark-gfm`: `^4.0.0`
- `remark-math`: `^6.0.0`
- `rehype-katex`: `^7.0.1`
- `remark-toc`: `^9.0.0`
- ...

## Usages

### Basic
You can pass markdown content through the `markdown` prop.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueMarkdown } from '@crazydos/vue-markdown'

const markdown = ref('## Hello World')
</script>

<template>
  <VueMarkdown :markdown="markdown" />
</template>
```

### Rendering `GFM`
By default, `vue-markdown` only supports basic Markdown syntax (CommonMark). If you need support for other Markdown syntax, you'll need to insert the corresponding `unified` plugin.

For features like `tables`, `footnotes`, `task lists`, etc., you need to include the `remark-gfm` plugin. (If you need support for other Markdown syntax like math, please use plugins as well.)

You can use the `remark-plugins` prop to pass in remark plugins.

```sh
npm install remark-gfm
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueMarkdown } from '@crazydos/vue-markdown'
import remarkGfm from 'remark-gfm'

const markdown = ref(`## Hello World

- [x] Add some task
- [ ] Do some task
`)
</script>

<template>
  <!-- simple usage -->
  <VueMarkdown :markdown="markdown" :remark-plugins="[remarkGfm]" />
</template>
```


### Custom attributes
You can customize tags for individual HTML elements, for example, by adding default classes or setting attributes like `target`, `rel`, `lazyload`, etc. The customAttrs will be passed into Vue's `h` function, so it will have the same effect as passing attributes to a `h`. Please refer to [Vue's official documentation](https://vuejs.org/guide/extras/render-function.html) to understand the effects of different data types when passed to the `h` function.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueMarkdown, { type CustomAttrs } } from '@crazydos/vue-markdown'

const markdown = ref(`
# Hello world

## Hello World 2

[Google](https://www.google.com)

`)

const customAttrs: CustomAttrs = {
  // use html tag name as key 
  h1: { 'class': ["heading"] },
  h2: { 'class': ["heading"] },
  a: { target: '_blank', rel: "noopener noreferrer" }
}
</script>

<template>
  <VueMarkdown :markdown="markdown" :custom-attrs="customAttrs" />
</template>
```

`customAttrs` provides some advanced functionalities: pass in a function for more flexible configurations.

```ts
const customAttrs: CustomAttrs = {
  h1: { 'class': ["heading"] },
  h2: { 'class': ["heading"] },
  a: (node, combinedAttrs) => { 
    if (
      typeof node.properties.href === 'string' &&
      node.properties.href.startsWith('https://www.google.com')
    ){
      return { target: '_blank', rel: "noopener noreferrer"}
    } else {
      return {}
    }
  }
}
```

- Some tags also have aliases, for example, the `heading` alias can be used for `h1` through `h6` tags.

For example, if we want to configure it as follows:

```ts
const customAttrs: CustomAttrs = {
  h1: { 'class': ["heading"] },
  h2: { 'class': ["heading"] },
}
```

This is equivalent to:
```ts
const customAttrs: CustomAttrs = {
  heading: { class: ["heading"] }
}
```

It can also receive a function for configuration.
```ts
// will set 
// class="heading heading-1" for h1
// class="heading heading-2" for h2
// .......
const customAttrs: CustomAttrs = {
  heading: (node, combinedAttrs) => {
    return { class: ["heading", `heading-${combinedAttrs.level}`] }
  }
}
```

Please refer to the [doc](#doc-scoped-slot-and-custom-attrs), check parameter the function can accept. 

### Customize tag rendering with scoped slot
This feature is a bit more cumbersome in `Vue`. If `customAttrs` doesn't meet your needs, you can customize tags through a `scoped slot`.

```html
<VueMarkdown
  markdown="## hello world"
>
  <template #h2="{ children, ...props }">
    <h1 v-bind="props">
      <Component :is="children" />
    </h1>
  </template>

</VueMarkdown>
```

If you want to display the text "hello world" in the example, you need to render the `children`. You can obtain the `children` from slot props, and it represents the `children` of the `h1`. Since I've turned it into a functional component, you must render it using `<Component>`. You can also render `children` wherever you want.

The parameters received by the scoped slot are essentially the same. However, some slots may receive special parameters; for example, in the `ul` element, it might receive `depth`, indicating the nesting level in a list and specifying which level it is.

```html
<VueMarkdown
  :markdown="`## title
  
- list 1
  - list 2
    - list 3
`"
>
  <template #ul="{ children, depth, ...props }">
    <ul :class="['unordered-list', `list-depth-${depth}`]">
      <Component :is="children" />
    </ul>
  </template>

</VueMarkdown>
```

Additionally, similarly, the scoped slot also provides the same HTML tag alias as `customAttrs`. You can use the alias to insert into the slot.

```vue
<template>
  <VueMarkdown
    :markdown="`
  # hello world

  ## hello world

  ### hello world

  #### hello world

  ##### hello world

  ###### hello world
  `"
  >
    <template #heading="{ children, level, key, ...props }">
      <MyCustomHeading :level="level" :key="key">
        <Component :is="children" />
      </MyCustomHeading>
    </template>
  </VueMarkdown>
</template>
```

For more, please refer to [scoped slot](#doc-scoped-slot-and-custom-attrs) 

#### re-render issue
I would recommend keeping the state in the parent component and then passing it down to the Custom Component. When your Markdown changes, especially when implementing an editor feature, the position of elements in the tree nodes can frequently change, causing the components within to be remounted intermittently, resetting their states (even with keys added).

### Use `<slot>` in markdown
You can use the `<slot>` syntax in Markdown, but you need to configure the following:

1. setup `rehype-raw` plugins
2. set `:sanitize="false"`


```sh
npm install rehype-raw
```

In the following example, we write Vue-like slot syntax in Markdown and can insert this slot from the parent component. At the same time, you can obtain slot props.

Currently, it does not support Vue template syntax like `v-bind` (supporting this would be a bit more challenging).

> [!WARNING] 
> Before `v0.2.0`,please use `<slot name="custom" />` to specify slot name

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueMarkdown } from '@crazydos/vue-markdown'
import remarkRaw from 'rehype-raw'

const markdown = ref(`
## Hello Slot

<slot slot-name="custom" msg="Insert from vue component"></slot>
`)
</script>

<template>
  <!-- simple usage -->
  <VueMarkdown :markdown="markdown" :rehype-plugins="[remarkRaw]" :sanitize="false">
    
    <!-- use 's-' + 'slot-name' -->
    <template #s-custom="{ msg }">
      <span> {{ msg }} </span>
    </template>

  </VueMarkdown>
</template>
```

### Security
To defend against various attacks (e.g., XSS), we use the `rehype-sanitize` unified plugin internally. To enable it, please add `:sanitize="true"`.

Refer to the [`rehype-sanitize`](https://github.com/rehypejs/rehype-sanitize) documentation for configuration details.

Here's an example configuration that prevents the rendering of all HTML tags, displaying only text:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import VueMarkdown, { SanitizeOptions } from '@crazydos/vue-markdown'

const sanitizeOption: SanitizeOptions = {
  // Please pass the parameters of rehype-sanitize into the sanitizeOptions:
  sanitizeOptions: {
    tagNames: [],
  },
  
  // mergeOptions: Optional. Internally, we use the `deepmerge` package to combine `defaultSchema` and `sanitizeOptions`. You can adjust the merging behavior in `mergeOptions`.
  mergeOptions: {
    arrayMerge: (target, source) => {
      return source
    },
  },
}
</script>
<template>
  <VueMarkdown
    :markdown="content"
    :custom-attrs="customAttrs"
    :remark-plugins="[remarkGfm]"
    :rehype-plugins="[rehypeRaw]"
    :sanitize-options="sanitizeOption"
    sanitize
  ></VueMarkdown>
</template>
```

## Documentation
### `<VueMarkdown>` Props

| Prop              | Description                                                                                                                                                                                                                                                                                                                              | Type                           | Default                        | Example                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `markdown`        | Markdown content                                                                                                                                                                                                                                                                                                                         | `string`                       | `''`                           |                                                                                                                             |
| `customAttrs`     | You can set custom attributes for each element, such as `href`, `target`, `rel`, `lazyload`, etc. The key is the HTML tag name, and the value can either be an object or a function that returns an object. The value will be passed to Vue's `h` function. You can refer to Vue's official documentation to learn how to configure `h`. | `CustomAttrs`                  | `{}`                           | ``` { img: { lazyload: true } } ```<br /> <br /> `{ h1: (node, combinedAttrs) => { return { class: ['title', 'mb-2'] } }} ` |
| `remarkPlugins`   | Remark plugins. These plugins will be used between `remark-parse` and `remark-rehype`. See https://github.com/remarkjs/remark?tab=readme-ov-file#plugins                                                                                                                                                                                 | `PluggableList`                | `[]`                           |                                                                                                                             |
| `rehypePlugins`   | rehype plugins. These plugins will be used after `remark-rehype` but before `rehype-sanitize`. See https://github.com/remarkjs/remark-rehype?tab=readme-ov-file#related                                                                                                                                                                  | ` PluggableList`               | `[]`                           |                                                                                                                             |
| `sanitize`        | Whether to sanitize the HTML content. (use `rehype-sanitize`). You need to disable this option if you want to render `<slot>` in markdown content.                                                                                                                                                                                       | `boolean`                      | `false`                        |                                                                                                                             |
| `sanitizeOptions` | Options for `rehype-sanitize`. see: https://github.com/syntax-tree/hast-util-sanitize#schema                                                                                                                                                                                                                                             | `SanitizeOptions`              | `{ allowDangerousHtml: true }` |                                                                                                                             |
| `rehypeOptions`   | Options for `rehype-parse`. see: https://github.com/remarkjs/remark-rehype?tab=readme-ov-file#options                                                                                                                                                                                                                                    | `Omit<TRehypeOptions, 'file'>` | `{}`                           |                                                                                                                             |



### `scoped slot` and `custom attrs`
In both scoped slots and `customAttrs`, you can receive additional parameters. Besides the HTML attributes that can be set in Markdown, `vue-markdown` also provides additional parameters.

| Tag                                 | Parameter                          | Type      | Description                                                                                                                                                                                  |
| ----------------------------------- | ---------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All Elements                        | Any HTML attributes on the element | string    | `alt`, `title`, etc...                                                                                                                                                                       |
| `h1` ~ `h6`, `heading`              | `level`                            | `number`  | Represents heading level                                                                                                                                                                     |
| `h1` ~ `h6`, `heading`              | `level`                            | `number`  | Represents heading level                                                                                                                                                                     |
| `code`, `inline-code`, `block-code` | `language`                         | `string`  | Represents language. e.g: `js`, `sh`, `md` ....                                                                                                                                              |
|                                     | `languageOriginal`                 | `string`  | Typically in the form of `language-` followed by the language, for example, `language-js`, `language-sh`. Similar to the language parameter, but language provides a simpler representation. |
|                                     | `inline`                           | `boolean` | inline code or block code                                                                                                                                                                    |
|                                     | `content`                          | `string`  | A string which is text content of the code. (**v0.3.0+**). [see code example](#doc-code-content-example)                                                                                     |
| `th`, `td`, `tr`                    | `isHead`                           | `boolean` | Indicates if it is in `thead`.                                                                                                                                                               |
| `list`, `ol`, `ul`                  | `ordered`                          | `boolean` | Indicates if it is an `ordered-list` or not.                                                                                                                                                 |
|                                     | `depth`                            | `number`  | In nested lists, it indicates the level at which the list is positioned. The first level is 0.                                                                                               |
| `list-item`, `li`                   | `ordered`                          | `boolean` | Indicates if it is in an `ordered-list` or not.                                                                                                                                              |
|                                     | `depth`                            | `number`  | In nested lists, it indicates the level at which the list is positioned. The first level is 0.                                                                                               |
|                                     | `index`                            | `number`  | Represents the position of the list item within its current level. The first item at any level is considered 0.                                                                              |

### Attributes aliases
Attribute aliases can be used in the configuration of both `scoped slot` and `customAttrs`. Generally, if you are using aliases for configuration or inserting slots, the alias configuration will take precedence over its corresponding HTML tag.

| Alias         | HTML Tags                          |
| ------------- | ---------------------------------- |
| `heading`     | `h1`, `h2`, `h3`, `h4`, `h5`, `h6` |
| `list`        | `ol`, `ul`                         |
| `list-item`   | `li`                               |
| `inline-code` | `code` (inline)                    |
| `block-code`  | `code` (block in `pre` tag)        |


### Code content example
```vue
<!-- For example -->
<template>
   <VueMarkdown :markdown="markdown">
     <template #code="{ children, ...props}">
       <MyCustomCodeBlock :code="props.content" :lang="props.language" />
       <!-- Or -->
       <code>
         <component :is="children" />
       </code>
     </template>
   </VueMarkdown>
</template>
```

## Reference
[react-markdown](https://github.com/remarkjs/react-markdown).

## License
MIT 


