import { presetMarkdownIt } from '@nolebase/integrations/vitepress/markdown-it'
import { transformHeadMeta } from '@nolebase/vitepress-plugin-meta'
import { calculateSidebar } from '@nolebase/vitepress-plugin-sidebar'
// import { buildEndGenerateOpenGraphImages } from '@nolebase/vitepress-plugin-og-image/vitepress'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItMathjax3 from 'markdown-it-mathjax3'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vitepress'

import { githubRepoLink, siteDescription, siteName } from '../metadata'
import head from './head'

const nolebase = presetMarkdownIt()

function hasTopLevelHeading(content: string) {
  let fence: string | undefined

  for (const line of content.split('\n')) {
    const fenceMatch = line.match(/^(\s*)(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[2][0]

      if (!fence)
        fence = marker
      else if (fence === marker)
        fence = undefined

      continue
    }

    if (!fence && /^#\s+/.test(line))
      return true
  }

  return false
}

function titleFromMarkdownPath(path?: string) {
  if (!path || !path.endsWith('.md'))
    return ''

  const normalized = path.replace(/\\/g, '/')
  const parts = normalized.split('/')
  const fileName = parts.at(-1)?.replace(/\.md$/, '') || ''
  const title = fileName === 'index'
    ? parts.at(-2) || fileName
    : fileName

  return decodeURIComponent(title)
}

function isNotePath(path?: string) {
  return !!path?.replace(/\\/g, '/').includes('zh-CN/笔记/')
}

function titleFromMarkdownContent(content: string) {
  let fence: string | undefined

  for (const line of content.split('\n')) {
    const fenceMatch = line.match(/^(\s*)(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[2][0]

      if (!fence)
        fence = marker
      else if (fence === marker)
        fence = undefined

      continue
    }

    if (!fence) {
      const headingMatch = line.match(/^#\s+(.+)$/)
      if (headingMatch?.[1])
        return headingMatch[1].trim()
    }
  }

  return ''
}

function resolveSidebarTitle(item: any): any {
  if (item.items)
    return { ...item, items: item.items.map(resolveSidebarTitle) }

  if (!item.link?.startsWith('/zh-CN/笔记/'))
    return item

  const filePath = join(process.cwd(), `${decodeURIComponent(item.link).replace(/^\//, '')}.md`)
  if (!existsSync(filePath))
    return item

  const content = readFileSync(filePath, 'utf8')
  const title = titleFromMarkdownContent(content) || titleFromMarkdownPath(filePath)

  return title ? { ...item, text: title, index: title } : item
}

const sidebar = calculateSidebar([
  { folderName: 'zh-CN/笔记', separate: true },
], 'zh-CN').map(resolveSidebarTitle)

export default defineConfig({
  vue: {
    template: {
      transformAssetUrls: {
        video: ['src', 'poster'],
        source: ['src'],
        img: ['src'],
        image: ['xlink:href', 'href'],
        use: ['xlink:href', 'href'],
        NolebaseUnlazyImg: ['src'],
      },
    },
  },
  title: siteName,
  description: siteDescription,
  ignoreDeadLinks: true,
  head,
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                },
              },
            },
          },
        },

        // Add title ang tags field in frontmatter to search
        // You can exclude a page from search by adding search: false to the page's frontmatter.
        _render(src, env, md) {
          // without `md.render(src, env)`, the some information will be missing from the env.
          let html = md.render(src, env)
          let tagsPart = ''
          let headingPart = ''
          let contentPart = ''
          let fullContent = ''
          const sortContent = () => [headingPart, tagsPart, contentPart] as const
          let { frontmatter, content } = env

          if (!frontmatter)
            return html

          if (frontmatter.search === false)
            return ''

          contentPart = content ||= src

          const headingMatch = content.match(/^# .*/m)
          const hasHeading = !!(headingMatch && headingMatch[0] && headingMatch.index !== undefined)

          if (hasHeading) {
            const headingEnd = headingMatch.index! + headingMatch[0].length
            headingPart = content.slice(0, headingEnd)
            contentPart = content.slice(headingEnd)
          }
          else if (frontmatter.title) {
            headingPart = `# ${frontmatter.title}`
          }

          const tags = frontmatter.tags
          if (tags && Array.isArray(tags) && tags.length)
            tagsPart = `Tags: #${tags.join(', #')}`

          fullContent = sortContent().filter(Boolean).join('\n\n')

          html = md.render(fullContent, env)

          return html
        },
      },
    },
  },
  locales: {
    root: {
      lang: 'zh-CN',
      label: '中文',
      dir: '/zh-CN',
      link: '/zh-CN',
      themeConfig: {
        nav: [
          { text: '主页', link: '/zh-CN/' },
          { text: '笔记', link: '/zh-CN/笔记/' },
          { text: '最近更新', link: '/zh-CN/toc' },
        ],
        socialLinks: [
          { icon: 'github', link: githubRepoLink },
        ],
        darkModeSwitchLabel: '切换主题',
        outline: { label: '页面大纲', level: 'deep' },
        editLink: {
          pattern: `${githubRepoLink}/tree/main/:path`,
          text: '编辑本页面',
        },
        sidebar,
        footer: {
          message: '用 <span style="color: #e25555;">&#9829;</span> 撰写',
          copyright:
        '<a class="footer-cc-link" target="_blank" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> © 2026-PRESENT zeya',
        },
      },
    },
  },
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'one-dark-pro',
    },
    math: true,
    preConfig: async (md) => {
      md.core.ruler.before('normalize', 'auto_title_for_notes', (state) => {
        const path = state.env.path || state.env.relativePath || state.env.filePath

        if (!isNotePath(path))
          return

        if (hasTopLevelHeading(state.src))
          return

        const title = titleFromMarkdownPath(path)
        if (title)
          state.src = `# ${title}\n\n${state.src}`
      })

      await nolebase.install(md)
    },
    config: (md) => {
      md.use(MarkdownItFootnote)
      md.use(MarkdownItMathjax3)
    },
  },
  async transformHead(context) {
    let head = [...context.head]

    const returnedHead = await transformHeadMeta()(head, context)
    if (typeof returnedHead !== 'undefined')
      head = returnedHead

    return head
  },
  // async buildEnd(siteConfig) {
  //   await buildEndGenerateOpenGraphImages({
  //     baseUrl: targetDomain,
  //     category: {
  //       byLevel: 2,
  //     },
  //   })(siteConfig)
  // },
})
