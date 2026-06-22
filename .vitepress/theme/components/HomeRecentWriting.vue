<script setup lang="ts">
import { computed } from 'vue'
import { data as updates } from '../../../zh-CN/data/toc.data'

interface RecentUpdate {
  title: string
  lastUpdated?: number
  filePath?: string
  category?: string
  url: string
}

function formatDate(timestamp?: number) {
  if (!timestamp)
    return ''

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp))
}

function formatTitle(item: RecentUpdate) {
  if (item.title && item.title !== 'index')
    return item.title

  const path = item.filePath || ''
  const matched = path.match(/zh-CN\/(.+)\/index\.md$/)
  return matched?.[1] || item.title || '未命名'
}

function formatCategory(item: RecentUpdate) {
  const path = item.filePath || ''
  const matched = path.match(/^zh-CN\/笔记\/(.+)\/[^/]+\.md$/)

  if (matched?.[1])
    return `笔记 · ${matched[1].split('/')[0]}`

  if (!item.category || item.category === 'Un-categorized')
    return '笔记'

  return item.category
}

const writings = computed(() => (updates as RecentUpdate[]).slice(0, 5))
</script>

<template>
  <section v-if="writings.length" class="home-recent-writing" aria-label="近期笔墨">
    <div class="home-recent-writing-inner">
      <div class="home-recent-heading">
        <div class="home-recent-kicker">
          Recent Writing
        </div>
        <h2>近期笔墨</h2>
      </div>

      <div class="home-recent-list">
        <span class="home-recent-line" aria-hidden="true" />

        <article v-for="(item, index) in writings" :key="item.url" class="home-recent-item">
          <span class="home-recent-index" :class="{ active: index === 0 }">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <a class="home-recent-link" :class="{ featured: index === 0 }" :href="item.url">
            <template v-if="index === 0">
              <div class="home-recent-meta">
                <span>{{ formatCategory(item) }}</span>
                <span v-if="formatDate(item.lastUpdated)">· {{ formatDate(item.lastUpdated) }}</span>
              </div>
              <h3>{{ formatTitle(item) }}</h3>
            </template>
            <template v-else>
              <div class="home-recent-row">
                <h3>{{ formatTitle(item) }}</h3>
                <time v-if="formatDate(item.lastUpdated)">{{ formatDate(item.lastUpdated) }}</time>
              </div>
              <div class="home-recent-meta">
                {{ formatCategory(item) }}
              </div>
            </template>
          </a>
        </article>
      </div>
    </div>
  </section>
</template>
