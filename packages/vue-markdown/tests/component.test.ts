import { flushPromises, mount } from '@vue/test-utils'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { VueMarkdown, VueMarkdownAsync } from '../src'

describe('vueMarkdown', () => {
  it('should render markdown and HTML correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: `
# title

hello world

<div>test</div>

<!-- test -->
`,
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render with remark plugin correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: `
# title

- [ ] todo 1
- [x] todo 2

| header 1 | header 2 |
|----------|----------|
| cell 1   | cell 2   |
`,
        remarkPlugins: [remarkGfm],
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render with rehype plugin correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: `
# title

\`\`\`js
const hello = 'world'
console.log(hello)
\`\`\`

`,
        rehypePlugins: [rehypeHighlight],
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render with rehypeOptions correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: `
# title

A note[^1]

[^1]: Big note.
`,
        remarkPlugins: [remarkGfm],
        rehypeOptions: {
          clobberPrefix: 'test-',
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render raw HTML when sanitize is false', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: `
# title

<div>valid div</div>
<script>alert('invalid script')</script>
<iframe src="invalid-iframe"></iframe>
`,
        rehypePlugins: [rehypeRaw],
        sanitize: false,
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render with sanitizeOptions1 correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: `
# title

<div>valid div</div>
<script>alert('invalid script')</script>
<iframe src="invalid-iframe"></iframe>
`,
        rehypePlugins: [rehypeRaw],
        sanitize: true,
        sanitizeOptions: {
          sanitizeOptions: {
            tagNames: [],
          },
          mergeOptions: {
            arrayMerge: (_, source) => {
              return source
            },
          },
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should rerender when props.markdown changed', async () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '# title 1',
      },
    })
    expect(wrapper.text()).toContain('title 1')

    wrapper.setProps({
      markdown: '# title 2',
    })
    await nextTick()
    expect(wrapper.text()).toContain('title 2')
  })

  it('should rerender when remarkPlugin changed', async () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '- [ ] todo',
      },
    })
    expect(wrapper.html()).not.toContain('type="checkbox"')

    wrapper.setProps({
      remarkPlugins: [remarkGfm],
    })
    await nextTick()
    expect(wrapper.html()).toContain('type="checkbox"')
  })

  it('should rerender when rehypePlugin changed', async () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '```js\nconst a = 1\n```',
      },
    })
    expect(wrapper.html()).not.toContain('hljs')

    wrapper.setProps({
      rehypePlugins: [rehypeHighlight],
    })
    await nextTick()
    expect(wrapper.html()).toContain('hljs')
  })

  it('should rerender when customAttrs changed', async () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '# title',
        customAttrs: {
          h1: {
            class: 'old-class',
          },
        },
      },
    })
    expect(wrapper.html()).toContain('old-class')

    wrapper.setProps({
      customAttrs: {
        h1: {
          class: 'new-class',
        },
      },
    })
    await nextTick()
    expect(wrapper.html()).toContain('new-class')
  })

  it('should rerender when rehypeOptions changed', async () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: 'A note[^1]\n\n[^1]: Big note.',
        remarkPlugins: [remarkGfm],
        rehypeOptions: {
          clobberPrefix: 'old-',
        },
      },
    })
    expect(wrapper.html()).toContain('old-')

    wrapper.setProps({
      rehypeOptions: {
        clobberPrefix: 'new-',
      },
    })
    await nextTick()
    expect(wrapper.html()).toContain('new-')
  })

  it('should rerender when sanitize changed', async () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '<div>test</div><script>alert(1)</script>',
        rehypePlugins: [rehypeRaw],
        sanitize: true,
      },
    })
    expect(wrapper.html()).not.toContain('<script>')

    wrapper.setProps({
      sanitize: false,
    })
    await nextTick()
    expect(wrapper.html()).toContain('<script>')
  })

  it('should rerender when sanitizeOptions changed', async () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '<div>test</div><iframe src="test"></iframe>',
        rehypePlugins: [rehypeRaw],
        sanitize: true,
        sanitizeOptions: {
          sanitizeOptions: {
            tagNames: ['div'],
          },
        },
      },
    })
    expect(wrapper.html()).toContain('<div>')
    expect(wrapper.html()).not.toContain('<iframe>')

    wrapper.setProps({
      sanitizeOptions: {
        sanitizeOptions: {
          tagNames: ['div', 'iframe'],
        },
      },
    })
    await nextTick()
    expect(wrapper.html()).toContain('<iframe>')
  })

  it('should rerender when mergeOptions changed', async () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '<div>test</div><h1>test</h1>',
        rehypePlugins: [rehypeRaw],
        sanitize: true,
        sanitizeOptions: {
          sanitizeOptions: {
            tagNames: ['div'],
          },
          mergeOptions: {
            arrayMerge: (_, source) => source,
          },
        },
      },
    })
    expect(wrapper.html()).toContain('<div>')
    expect(wrapper.html()).not.toContain('<h1>')

    wrapper.setProps({
      sanitizeOptions: {
        sanitizeOptions: {
          tagNames: ['div'],
        },
        mergeOptions: {
          arrayMerge: (target, source) => [...target, ...source],
        },
      },
    })
    await nextTick()
    expect(wrapper.html()).toContain('<h1>')
  })

  it('should render raw html text correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '<div>test</div>',
        sanitize: false,
      },
    })
    expect(wrapper.html()).toContain('<div>&lt;div&gt;test&lt;/div&gt;</div>')
  })
})

describe('vueMarkdownAsync', () => {
  it('should render markdown and HTML correctly', async () => {
    // https://test-utils.vuejs.org/guide/advanced/async-suspense.html#Testing-asynchronous-setup
    const component = defineComponent({
      components: { VueMarkdownAsync },
      template: '<Suspense><VueMarkdownAsync markdown="# title" /></Suspense >',
    })
    const wrapper = mount(component)
    await flushPromises()
    expect(wrapper.html()).toContain('title')
  })

  it('should rerender when props.markdown changed', async () => {
    const component = defineComponent({
      components: { VueMarkdownAsync },
      template: '<Suspense><VueMarkdownAsync :markdown="markdown" /></Suspense >',
      props: {
        markdown: {
          type: String,
          default: '',
        },
      },
    })
    const wrapper = mount(component, {
      props: {
        markdown: '# title 1',
      },
    })
    await flushPromises()
    expect(wrapper.html()).toContain('title 1')

    wrapper.setProps({
      markdown: '# title 2',
    })
    await flushPromises()
    expect(wrapper.html()).toContain('title 2')
  })
})
