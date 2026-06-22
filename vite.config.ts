import { join } from 'node:path'
import { presetVite } from '@nolebase/integrations/vitepress/vite'
import UnoCSS from 'unocss/vite'

import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

import { creators, githubRepoLink } from './metadata'

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

function titleFromMarkdownId(id: string) {
  const normalized = id.replace(/\\/g, '/')
  const fileName = decodeURIComponent(normalized.split('/').at(-1) || '').replace(/\.md$/, '')

  return fileName === 'index'
    ? decodeURIComponent(normalized.split('/').at(-2) || fileName)
    : fileName
}

function AutoTitleForNotes() {
  return {
    name: 'zeya:auto-title-for-notes',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      const normalized = id.replace(/\\/g, '/')

      if (!normalized.endsWith('.md') || !normalized.includes('/zh-CN/笔记/'))
        return null

      if (hasTopLevelHeading(code))
        return null

      const title = titleFromMarkdownId(id)
      if (!title)
        return null

      return `# ${title}\n\n${code}`
    },
  }
}

export default defineConfig(async ({ command }) => {
  const nolebase = presetVite({
    gitChangelog: {
      options: {
        gitChangelog: {
          repoURL: () => githubRepoLink,
          mapAuthors: creators,
        },
        markdownSection: {
          excludes: [
            join('zh-CN', 'toc.md'),
            join('zh-CN', 'index.md'),
          ],
        },
      },
    },
    pageProperties: {
      options: {
        markdownSection: {
          excludes: [
            join('zh-CN', 'toc.md'),
            join('zh-CN', 'index.md'),
          ],
        },
      },
    },
  })

  return {
    assetsInclude: [
      '**/*.mov',
    ],
    optimizeDeps: {
      // vitepress is aliased with replacement `join(DIST_CLIENT_PATH, '/index')`
      // This needs to be excluded from optimization
      exclude: [
        'vitepress',
      ],
    },
    plugins: [
      ...(command === 'serve' ? [Inspect()] : []),
      Components({
        include: [/\.vue$/, /\.md$/],
        dirs: '.vitepress/theme/components',
        dts: '.vitepress/components.d.ts',
      }),
      UnoCSS(),
      AutoTitleForNotes(),
      nolebase,
      ...nolebase.plugins(),
    ],
  }
})
