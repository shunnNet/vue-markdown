# @crazydos/vue-markdown
[繁體中文](./README.zh-tw.md)

This is a package that provide Vue 3+ component to render markdown content with `unified` pipeline.

And is referenced from [`react-markdown`](https://github.com/remarkjs/react-markdown).


- [@crazydos/vue-markdown](#crazydosvue-markdown)
  - [Feature](#feature)
  - [Install](#install)
  - [About unified plugins](#about-unified-plugins)
  - [Usages](#usages)
    - [Basic](#basic)
    - [Rendering `GFM`](#rendering-gfm)
    - [Custom attributes](#custom-attributes)
    - [Customize tag rendering with scoped slot](#customize-tag-rendering-with-scoped-slot)
      - [re-render issue](#re-render-issue)
    - [Use `<slot>` in markdown](#use-slot-in-markdown)
    - [Security](#security)
  - [doc: `scoped slot` and `custom attrs`](#doc-scoped-slot-and-custom-attrs)
  - [doc: attributes aliases](#doc-attributes-aliases)
  - [Reference](#reference)

## Feature
- Render markdown content
- Support unfied `remark` and `rehype` plugins for customization
- Can customize attributes of html tags (e.g: class, target, rel ....)
- Can use custom template for rendering tag by vue `scoped slot`
- Support `<slot>` in markdown content (need `rehype-raw`)
- Prevent unsafe html by `rehype-sanitize` (optional)



## Install
```sh
npm install @crazydos/vue-markdown
```

## About unified plugins
Recently, the unified ecosystem is undergoing updates for its plugins. This may result in version incompatibility issues, leading to unexpected runtime errors or problems with Typescript. `vue-markdown` uses `unified 10`, so please ensure that the unified plugin you intend to use corresponds to `unified 10`.

Here are the recommended versions for the plugins:

- rehype-raw: `6.1.1`
- remark-gfm: `3.0.1`
- others: not tested....

## Usages

### Basic
You can pass markdown content through the `markdown` prop.

```vue
<script setup>
import { ref } from 'vue'
import VueMarkdown from '@crazydos/vue-markdown'

const markdown = ref('## Hello World')
</script>

<template>
  <VueMarkdown :markdown="markdown" />
</template>
```

### Rendering `GFM`
This package uses the `unified` pipeline to render Markdown. By default, it only supports basic Markdown syntax (CommonMark). If you need support for other Markdown syntax, you'll need to insert the corresponding `unified` plugin.

For features like tables, footnotes, task lists, etc., you need to include the `remark-gfm` plugin. (If you need support for other Markdown syntax like math, please use plugins as well.)

You can use the `remark-plugins` prop to pass in remark plugins.
```sh
npm install remark-gfm@3.0.1
```

```vue
<script setup>
import { ref } from 'vue'
import VueMarkdown from '@crazydos/vue-markdown'
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
<script setup>
import { ref } from 'vue'
import VueMarkdown from '@crazydos/vue-markdown'

const markdown = ref(`
# Hello world

## Hello World 2

[Google](https://www.google.com)

`)

const customAttrs = {
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
const customAttrs = {
  h1: { 'class': ["heading"] },
  h2: { 'class': ["heading"] },
  a: (node, combinedAttrs) => { 
    if(node.properties.href.startsWith('https://www.google.com')){
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
const customAttrs = {
  h1: { 'class': ["heading"] },
  h2: { 'class': ["heading"] },
}
```

This is equivalent to:
```ts
const customAttrs = {
  heading: { class: ["heading"] }
}
```

It can also receive a function for configuration.
```ts
// will set 
// class="heading heading-1" for h1
// class="heading heading-2" for h2
// .......
const customAttrs = {
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
npm install rehype-raw@6.1.1
```

In the following example, we write Vue-like slot syntax in Markdown and can insert this slot from the parent component. At the same time, you can obtain slot props.

Currently, it does not support Vue template syntax like `v-bind` (supporting this would be a bit more challenging).

```vue
<script setup>
import { ref } from 'vue'
import VueMarkdown from '@crazydos/vue-markdown'
import remarkRaw from 'rehype-raw'

const markdown = ref(`
## Hello Slot

<slot name="custom" msg="Insert from vue component"></slot>
`)
</script>

<template>
  <!-- simple usage -->
  <VueMarkdown :markdown="markdown" :rehype-plugins="[remarkRaw]" :sanitize="false">
    <template #custom="{ msg }">
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
import VueMarkdown, { SanitizeOptions } from '@crazydos/vue-remark'

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

## doc: `scoped slot` and `custom attrs`
In both scoped slots and `customAttrs`, you can receive additional parameters. Besides the HTML attributes that can be set in Markdown, `vue-markdown` also provides additional parameters.

- `h1` ~ `h6`, `heading`: 
  - `level`: `number`，represent heading level

- `code`, `inline-code`, `block-code`:
  - `language`: `string`。represent language. e.g: `js`, `sh`, `md` ....
  - `languageOriginal`: `string`. It's typically in the form of `language-` followed by the language, for example, `language-js`, `language-sh`. Similar to the language parameter, but language provides a simpler representation.
  - `inline`: `boolean`，`inline-code` or `block-code`

- `th`, `td`, `tr`:
  - `isHead`: `boolean`。Is it in `thead`.

- `list`, `ol`, `ul`:
  - `ordered`: `ordered-list` or not
  - `depth`: In nested lists, it indicates the level at which the list is positioned. The first level is 0.

- `list-item`, `li`:
  - `ordered`: Is in `ordered-list` or not.
  - `depth`: In nested lists, it indicates the level at which the list is positioned. The first level is 0.
  - `index`: It represents the position of the list item within its current level. The first item at any level is considered 0.



## doc: attributes aliases
Attribute aliases can be used in the configuration of both `scoped slot` and `customAttrs`. Generally, if you are using aliases for configuration or inserting slots, the alias configuration will take precedence over its corresponding HTML tag.

- `heading`: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- `list`: `ol`, `ul`
- `list-item`: `li`
- `inline-code`: `code` which is inline
- `block-code`: `code` which is block code in `pre` tag


## Reference
[react-markdown](https://github.com/remarkjs/react-markdown).


