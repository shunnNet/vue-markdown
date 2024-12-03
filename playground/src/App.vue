<script setup lang="ts">
import VueMarkdown from "@crazydos/vue-markdown"
import CodeBlock from "./components/CodeBlock.vue"
import { ref }  from "vue"

const markdown = ref(`## Hello World

\`\`\`
\`\`\`

\`\`\`css
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
\`\`\`
`)

</script>

<template>
  <div>
    <VueMarkdown :markdown="markdown">
      <template #code="{ children, ...props}">
        <CodeBlock :code="props.content" />
      </template>

    </VueMarkdown>
  </div>
</template>

<style>

</style>
