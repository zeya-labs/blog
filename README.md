# Zeya 的知识库

记录回忆，知识和畅想的地方。

这个仓库保存 Zeya 的个人知识库内容和 VitePress 站点配置。站点基于 Nólëbase / VitePress 的结构改造而来，用于发布 Markdown 笔记。

## 开发

```bash
pnpm install
pnpm docs:dev
```

## 构建

```bash
pnpm run build
```

构建产物输出到 `.vitepress/dist`。

## 部署

当前部署目标是 Netlify，配置见 `netlify.toml`。
