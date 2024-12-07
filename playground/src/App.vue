<script setup lang="ts">
import {VueMarkdown} from "@crazydos/vue-markdown"
import type {CustomAttrs} from "@crazydos/vue-markdown"
import CodeBlock from "./components/CodeBlock.vue"
import { ref }  from "vue"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import remarkToc from "remark-toc"

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
  h1: { 'class': ["heading"] },
  h2: { 'class': ["heading"] },
  a: (node, combinedAttrs) => {
    if(
      typeof node.properties.href === 'string' &&
      node.properties.href.startsWith('https://www.google.com')
    ){
      return { target: '_blank', rel: "noopener noreferrer"}
    } else {
      return {}
    }
  }
}

const preset = {
  plugins: [
    remarkGfm,
    remarkMath,
  ]
}

</script>

<template>
  <div>

    <VueMarkdown
      :markdown="markdown"
      :custom-attrs="customAttrs"
      :remark-plugins="[preset, [remarkToc, {heading: 'structure'}]]"
      :rehype-plugins="[rehypeRaw, rehypeKatex]"
    >
      <template v-slot:s-header="{ children: Children, ...attrs }">
        <p v-bind="attrs">
          <component :is="Children"  />
        </p>
      </template>

      <template #code="{ children, ...props}">
        <CodeBlock :code="props.content" />
      </template>

    </VueMarkdown>
  </div>
</template>

<style>

</style>
