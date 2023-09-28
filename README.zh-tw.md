# @crazydos/vue-markdown
這個套件提供 vue 3+ markdown 渲染元件，使用的是 unified。

主要是參考 [`react-markdown`](https://github.com/remarkjs/react-markdown).


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
- 渲染 markdown
- 支援插入 unfied `remark` 以及 `rehype` plugins
- 可以客製化各個 html 標籤  (e.g: class, target, rel ....)
- 透過 vue `scoped slot`，可以客製化每個標籤的模板
- 可以在 markdown 中使用 `<slot>` ，讓父元件可以插入內容 (需要 `rehype-raw`)
- 透過 `rehype-sanitize` 提供 XSS 等防禦 (optional)



## Install
```sh
npm install @crazydos/vue-markdown
```

## About unified plugins
最近剛好遇到 `unified` 正在更新生態中的 plugins。這可能導致版本不相容的問題，可能造成意外的 runtime 錯誤，或是 Typescript 的問題。 `vue-markdown` 使用 `unified 10`，請確認你要使用的 unified plugin 對應的是 `unified 10`。

以下是建議的 plugins 版本：

- rehype-raw: `6.1.1`
- remark-gfm: `3.0.1`
- others: not tested....

## Usages

### Basic
可以透過 props `markdown` 接收 markdown 內容

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
這個套件使用 unified pipeline 渲染 markdown，他預設只支援基礎的 markdown 語法 (CommonMark)，如果需要支援其他 markdown 語法，你需要插入對應的 unified plugin。

像是 `table`, `footnote`, `task-list` 等等需要加上 [`remark-gfm`](https://github.com/remarkjs/remark-gfm) plugin 才可以支援。（如果需要支援像是 math 之類的其他 markdown 語法，也請使用 plugin ）

可以使用 `remark-plugins` props 傳入 remark plugins

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
你可以為各個 html tag 加上客製化的標籤。例如加上預設 class，或是設定 `target`, `rel`, `lazyload` ...。 `customAttrs` 會傳入 vue `h`，所以會跟對 `h` 傳入標籤的效果相同，所以請參考 vue 的[官方文件](https://vuejs.org/guide/extras/render-function.html)，以了解各種資料型別會帶來的效果，

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

`customAttrs` 提供一些進階用法：
- 可以傳入 function 做更彈性的設定

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

- 一些標籤則有提供別名，像是 `heading` 可以套用 `h1`~`h6` 標籤。

比如我們想要設定成下面這樣：
```ts
const customAttrs = {
  h1: { 'class': ["heading"] },
  h2: { 'class': ["heading"] },
}
```

這可以等同於：
```ts
const customAttrs = {
  heading: { class: ["heading"] }
}
```

他同樣可以接收 `function` 進行設定
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

function 可接收的參數請參考 [doc](#doc-scoped-slot-and-custom-attrs)

### Customize tag rendering with scoped slot
這個功能對於 `vue` 比較麻煩一點。
如果 `customAttrs` 無法滿足你的需求，你可以透過 scoped slot 對標籤做客製化。

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

如果要顯示範例中 `hello world` 的文字，你需要渲染 children。你可以從 slot props 得到 `children`，他就是 `h1` 的 children。因為我把他做成 `functional component` 所以必須用 `<Component>` 渲染他。你也可以在你想要的位置渲染 `children`

`scoped slot` 接收的參數基本上是相同的。但有些的 slot 可能會接收特殊的參數，比如在 `ul` 可以接收到 `depth`，表示這是在巢狀 list 中，他位於第幾層。


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

此外，同樣的，`scoped slot` 也提供與 `customeAttrs` 相同的 html tag `alias`，你可以用 `alias` 插入 slot。


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

更多請參考文件 [scoped slot](#doc-scoped-slot-and-custom-attrs) 的文件

#### re-render issue
建議你將 state 保留在父元件層，然後傳入 Custom Component。除非你的 markdown 內容不會變更。
當你的 markdown 變更，舉例來說，尤其是製作編輯器功能時，元素在樹節點的位置會經常改變，導致在其中的 Component 會不定時重新 mount，從而導致元件的狀態被重設。（就算加上 key 也一樣）

### Use `<slot>` in markdown
可以在 markdown 中使用 `<slot>` 語法，但需要設置以下項目

1. 裝上 `rehype-raw` 套件
2. 設定 `:sanitize="false"`


```sh
npm install rehype-raw@6.1.1
```

在下面的範例中，我們在 markdown 中寫入如 vue slot 一樣的語法。並且在可以從父元件插入這個 slot。同時也可以取得 slot props。

目前不支援 `v-bind` 等 vue template 語法 (要支援會比較困難一點)。

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
為了防禦各種攻擊（e.g: XSS），內部使用 `rehype-sanitize` 這個 `unified` plugin。若要開啟，請加上 `:sanitize="true"`。

請參考 [`rehype-sanitize` 的文件](https://github.com/rehypejs/rehype-sanitize) 了解如何設定

以下是一個設定的範例，他將所有的 html tag 都不能渲染，只出現 text。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import VueMarkdown, { SanitizeOptions } from '@crazydos/vue-remark'

const sanitizeOption: SanitizeOptions = {
  // 請在 sanitizeOptions 中傳入 rehype-sanitize 的參數
  sanitizeOptions: {
    tagNames: [],
  },
  
  // mergeOptions: Optional. 我們在內部使用 deepmerge 套件，組合 defaultSchema 跟 sanitizeOptions。你可以在 mergeOptions 中調整合併的行為。
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
scoped slot 和 customAttrs 中，都可以接收額外的參數，除了 markdown 中可以設定的 html attrs 之外， `vue-markdown` 也提供額外的參數。

- `h1` ~ `h6`, `heading`: 
  - `level`: `number`，代表 heading level

- `code`, `inline-code`, `block-code`:
  - `language`: `string`。代表語言，比如 `js`, `sh`, `md` ....
  - `languageOriginal`: `string`。通常會是 `language-` + 語言，比方說 `language-js`, `language-sh`。與 `language` 參數相同，只是 `language` 提供了比較簡易的表示。
  - `inline`: `boolean`，是 `inline-code` 或是 `block-code`

- `th`, `td`, `tr`:
  - `isHead`: `boolean`。是否位於 thead。

- `list`, `ol`, `ul`:
  - `ordered`: 是否是 `ordered-list`
  - `depth`: 在巢狀 list 中，位於第幾層。第一層是 0。

- `list-item`, `li`:
  - `ordered`: 是否位於 `ordered-list`
  - `depth`: 在巢狀 list 中，位於第幾層。第一層是 0。 
  - `index`: 是這一層的第幾個 list-item。第一層是 0。



## doc: attributes aliases
attributes aliases 可以用在 `scoped slot` 或是 `customAttrs` 的設定。
一般來說，如果你是使用 alises 進行設定，或是插入 slot， aliases 的設定會先於他對應的 html tag。

`heading`: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
`list`: `ol`, `ul`
`list-item`: `li`
`inline-code`: `code` which is inline
`block-code`: `code` which is block code in `pre` tag


## Reference
[react-markdown](https://github.com/remarkjs/react-markdown).


