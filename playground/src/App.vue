<script setup lang="ts">
import type { CustomAttrs } from '@crazydos/vue-markdown'
import { VueMarkdown } from '@crazydos/vue-markdown'

import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkToc from 'remark-toc'
import { ref } from 'vue'
import CodeBlock from './components/CodeBlock.vue'

const markdown = ref(`# Markdown Test

## Structure

## Autolink literals

www.example.com, https://example.com, and contact@example.com.

## Footnote

A note[^1]

[^1]: Big note.

## Strikethrough

~one~ or ~~two~~ tildes.

## Table

| a | b  |  c |  d  |
| - | - | - | - |
| 1 | 2 | 3 | 4 |

## Tasklist

* [ ] to do
* [x] done

## Raw
<div class="note">

A mix of *markdown* and <em>HTML</em>.

</div>

## Math
Lift($$L$$) can be determined by Lift Coefficient ($$C_L$$) like the following
equation.
$$
L = \\frac{1}{2} \\rho v^2 S C_L
$$

## Vue Slot
<div>
<slot slot-name="header" value="123">I am slot</slot>
</div>

## Svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="150" width="100" height="100" fill="#f0f0f0" stroke="#333" stroke-width="5"/>
  <text x="100" y="200" text-anchor="middle" font-family="Arial" font-size="14">Input</text>
</svg>
`)

// const customAttrs: CustomAttrs = {
//   heading: (node, combinedAttrs) => {
//     // if (node.children[0]?.type === 'text') {
//     //   return {
//     //     id: node.children[0].value.toLowerCase().replace(/\s/g, '-'),
//     //     ...combinedAttrs
//     //   }
//     // }

//     return { level: 1, onClick: () => { console.log(123) } }
//   }
// }
const customAttrs: CustomAttrs = {
  h1: { class: ['heading'] },
  h2: { class: ['heading'] },
  a: (node) => {
    if (
      typeof node.properties.href === 'string'
      && node.properties.href.startsWith('https://www.google.com')
    ) {
      return { target: '_blank', rel: 'noopener noreferrer' }
    }
    else {
      return {}
    }
  },
}

const preset = {
  plugins: [
    remarkGfm,
    remarkMath,
  ],
}
</script>

<template>
  <div>
    <VueMarkdown
      :markdown="markdown"
      :custom-attrs="customAttrs"
      :remark-plugins="[preset, [remarkToc, { heading: 'structure' }]]"
      :rehype-plugins="[rehypeRaw, rehypeKatex]"
    >
      <template #s-header="{ children: Children, ...attrs }">
        <p v-bind="attrs">
          <component :is="Children" />
        </p>
      </template>

      <template #code="{ ...props }">
        <CodeBlock :code="props.content" />
      </template>
    </VueMarkdown>
  </div>
</template>

<style>

</style>
