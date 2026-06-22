<script setup lang="ts">
import { VPTeamMembers } from 'vitepress/theme'
import { creators, githubRepoLink, siteName } from '../../../metadata'
</script>

<template>
  <div class="content">
    <div class="content-container">
      <main class="main">
        <div class="vp-doc" mt-10 flex flex-col items-center>
          <h2 id="meet-the-team" font-normal op50 p="t-10 b-2">
            {{ siteName }} 的维护者
          </h2>
          <div w-full p-10>
            <VPTeamMembers size="small" :members="creators" flex justify-center />
          </div>

          <div text-center>
            <h2 mt-11 pb-2>
              Source
            </h2>
            <p>
              这个知识库由 Markdown、VitePress 和 Obsidian 共同维护。
            </p>
            <p>
              <a :href="githubRepoLink" target="_blank">在 GitHub 上查看</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
