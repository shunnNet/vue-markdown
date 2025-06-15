import { mount } from '@vue/test-utils'
import remarkGfm from 'remark-gfm'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { VueMarkdown } from '../src'

describe('vueMarkdown slots', () => {
  it('should render h1 slot correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '# title',
      },
      // @ts-expect-error TODO: fix this
      slots: {
        h1(scope) {
          return h('h1', { 'class': 'custom-h1', 'data-level': scope.level }, scope.children())
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render heading slot correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '## title',
      },
      // @ts-expect-error TODO: fix this
      slots: {
        heading(scope) {
          return h(`h${scope.level}`, { 'class': 'custom-heading', 'data-level': scope.level }, scope.children())
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render code slot correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '```js\nconst hello = "world"\n```',
      },
      // @ts-expect-error TODO: fix this
      slots: {
        code(scope) {
          return h('code', {
            'class': 'custom-code',
            'data-language': scope.language,
            'data-inline': scope.inline,
            'data-language-original': scope.languageOriginal,
            'data-content': scope.content,
          }, scope.children())
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render list slot correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '- list item 1\n- list item 2',
      },
      // @ts-expect-error TODO: fix this
      slots: {
        'list': (scope) => {
          return h('ul', {
            'class': 'custom-list',
            'data-depth': scope.depth,
            'data-ordered': scope.ordered,
          }, scope.children())
        },
        'list-item': (scope) => {
          return h('li', {
            'class': 'custom-list-item',
            'data-depth': scope.depth,
            'data-ordered': scope.ordered,
            'data-index': scope.index,
          }, scope.children())
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render table slot correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: `
| header 1 | header 2 |
|----------|----------|
| cell 1   | cell 2   |`,
        remarkPlugins: [remarkGfm],
      },
      // @ts-expect-error TODO: fix this
      slots: {
        th(scope) {
          return h('th', {
            'class': 'custom-th',
            'data-head': scope.isHead,
          }, scope.children())
        },
        td(scope) {
          return h('td', {
            'class': 'custom-td',
            'data-head': scope.isHead,
          }, scope.children())
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render inline code slot correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '`const hello = "world"`',
      },
      // @ts-expect-error TODO: fix this
      slots: {
        'inline-code': (scope) => {
          return h('code', {
            'class': 'custom-inline-code',
            'data-language': scope.language,
          }, scope.children())
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render block code slot correctly', () => {
    const wrapper = mount(VueMarkdown, {
      props: {
        markdown: '```js\nconst hello = "world"\n```',
      },
      // @ts-expect-error TODO: fix this
      slots: {
        'block-code': (scope) => {
          return h('code', {
            'class': 'custom-block-code',
            'data-language': scope.language,
          }, scope.children())
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
