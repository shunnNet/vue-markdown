import { mount } from '@vue/test-utils'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { describe, expect, it } from 'vitest'
import { VueMarkdown } from '../src/old'

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
          // mergeOptions: Optional. Internally, we use the `deepmerge` package to combine `defaultSchema` and `sanitizeOptions`. You can adjust the merging behavior in `mergeOptions`.
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
})
