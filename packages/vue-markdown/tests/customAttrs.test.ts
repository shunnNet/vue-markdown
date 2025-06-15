import { mount } from '@vue/test-utils'
import remarkGfm from 'remark-gfm'
import { describe, expect, it, vi } from 'vitest'
import { VueMarkdown } from '../src/old'

describe('vueMarkdown customAttrs', () => {
  it('should append customAttrs when it is an object', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '# title',
        customAttrs: {
          h1: {
            'class': 'custom-title',
            'data-test': 'test',
          },
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should append customAttrs when it is a function', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '# title',
        customAttrs: {
          h1: (_, combinedAttrs) => ({
            'class': 'custom-title',
            'data-level': combinedAttrs.level,
          }),
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should apply alias customAttrs with higher priority than tag name', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: `
# h1 title
`,
        customAttrs: {
          h1: {
            class: 'h1-custom',
          },
          heading: {
            class: 'heading-custom',
          },
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  describe('customAttrs parameters', () => {
    it('should pass correct parameters to h1 customAttrs', () => {
      const h1CustomAttrs = vi.fn()

      mount(VueMarkdown, {
        props: {
          markdown: '# title',
          customAttrs: {
            h1: h1CustomAttrs,
          },
        },
      })

      expect(h1CustomAttrs).toHaveBeenCalledWith(
        expect.objectContaining({
          tagName: 'h1',
          properties: expect.any(Object),
        }),
        expect.objectContaining({
          level: 1,
          key: expect.any(String),
        }),
      )
    })

    it('should pass correct parameters to heading customAttrs', () => {
      const headingCustomAttrs = vi.fn()

      mount(VueMarkdown, {
        props: {
          markdown: '## title',
          customAttrs: {
            heading: headingCustomAttrs,
          },
        },
      })

      expect(headingCustomAttrs).toHaveBeenCalledWith(
        expect.objectContaining({
          tagName: 'h2',
          properties: expect.any(Object),
        }),
        expect.objectContaining({
          level: 2,
          key: expect.any(String),
        }),
      )
    })

    it('should pass correct parameters to code customAttrs', () => {
      const codeCustomAttrs = vi.fn()

      mount(VueMarkdown, {
        props: {
          markdown: `
\`const hello = 'world'\`

\`\`\`js
const hello = 'world'
\`\`\`
`,
          customAttrs: {
            code: codeCustomAttrs,
          },
        },
      })

      expect(codeCustomAttrs).toHaveBeenCalledWith(
        expect.objectContaining({
          tagName: 'code',
          properties: expect.any(Object),
        }),
        expect.objectContaining({
          class: ['language-js'],
          language: 'js',
          languageOriginal: 'language-js',
          content: `const hello = 'world'\n`,
          inline: false,
          key: expect.any(String),
        }),
      )

      expect(codeCustomAttrs).toHaveBeenCalledWith(
        expect.objectContaining({
          tagName: 'code',
          properties: expect.any(Object),
        }),
        expect.objectContaining({
          language: '',
          languageOriginal: '',
          content: `const hello = 'world'`,
          inline: true,
          key: expect.any(String),
        }),
      )
    })

    it('should pass correct parameters to list customAttrs', () => {
      const listCustomAttrs = vi.fn()
      const listItemCustomAttrs = vi.fn()
      mount(VueMarkdown, {
        props: {
          markdown: '- list item 1\n- list item 2',
          customAttrs: {
            'list': listCustomAttrs,
            'list-item': listItemCustomAttrs,
          },
        },
      })

      expect(listCustomAttrs).toHaveBeenCalledWith(
        expect.objectContaining({
          tagName: 'ul',
          properties: expect.any(Object),
        }),
        expect.objectContaining({
          depth: 0,
          ordered: false,
        }),
      )

      expect(listItemCustomAttrs).toHaveBeenCalledWith(
        expect.objectContaining({
          tagName: 'li',
          properties: expect.any(Object),
        }),
        expect.objectContaining({
          depth: 0,
          ordered: false,
          index: 0,
        }),
      )
    })

    it('should pass correct parameters to table customAttrs', () => {
      const tableCustomAttrs = vi.fn()

      mount(VueMarkdown, {
        props: {
          markdown: `
| header 1 | header 2 |
|----------|----------|
| cell 1   | cell 2   |`,
          customAttrs: {
            th: tableCustomAttrs,
          },
          remarkPlugins: [remarkGfm],
        },
      })

      expect(tableCustomAttrs).toHaveBeenCalledWith(
        expect.objectContaining({
          tagName: 'th',
          properties: expect.any(Object),
        }),
        expect.objectContaining({
          isHead: true,
        }),
      )
    })
  })
})
