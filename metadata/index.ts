import type { Creator } from '../scripts/types/metadata'
import { getAvatarUrlByGithubName } from '../scripts/utils'

/** 文本 */
export const siteName = 'Zeya 的知识库'
export const siteShortName = 'Zeya'
export const siteDescription = '记录一些学习、研究、开发和生活里的想法。'

/** 文档所在目录 */
export const include = ['笔记', '生活']

/** Repo */
export const githubRepoLink = 'https://github.com/zeya-labs/blog'
/** Discord */
export const discordLink = ''

/** 无协议前缀域名 */
export const plainTargetDomain = 'heyzeya.netlify.app'
/** 完整域名 */
export const targetDomain = `https://${plainTargetDomain}`

/** 创作者 */
export const creators: Creator[] = [
  {
    name: 'Zeya',
    avatar: '',
    username: 'zeya-labs',
    title: '知识库维护者',
    desc: '记录学习、研究、开发和生活中的想法',
    links: [
      { type: 'github', icon: 'github', link: 'https://github.com/zeya-labs' },
    ],
    nameAliases: ['Zeya', 'xyea'],
    emailAliases: ['xyeaovo@gmail.com'],
    mapByNameAliases: ['Zeya', 'xyea'],
    mapByEmailAliases: ['xyeaovo@gmail.com'],
  },
].map<Creator>((c) => {
  c.avatar = c.avatar || getAvatarUrlByGithubName(c.username)
  return c as Creator
})

export const creatorNames = creators.map(c => c.name)
export const creatorUsernames = creators.map(c => c.username || '')
