# xzl01.github.io

基于 **Hugo** 的个人技术博客仓库，部署到 **GitHub Pages**。

- 线上地址: https://xzl01.github.io/
- 语言: 中文
- 主题: 自定义模板（无第三方主题）

## 本地开发

### 1. 安装 Hugo

```bash
brew install hugo
hugo version
```

### 2. 启动预览

```bash
hugo server --bind 0.0.0.0 --port 1313 --disableFastRender --noHTTPCache
```

访问: http://localhost:1313/

### 3. 本地构建

```bash
hugo --minify
```

## 仓库结构

```text
.
├── content/
│   ├── blog/          # 博客文章
│   └── gallery/       # 图库页面配置
├── layouts/           # Hugo 模板
│   ├── _default/
│   └── gallery/
├── static/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── gallery/       # 摄影作品原图目录
└── .github/
    ├── workflows/
    └── import-records/
```

## 新增文章

在 `content/blog/` 下新建 Markdown：

```yaml
---
title: "文章标题"
date: 2026-03-04
description: "一句话描述"
categories: ["分类"]
tags: ["标签1", "标签2"]
---
```

## 图库使用

图库页面地址: `/gallery/`

把照片放入 `static/gallery/` 即可自动展示，支持：

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`
- `.gif`

## 部署

推送到 `main` 后，GitHub Actions 会自动构建并部署到 Pages。

工作流文件：`.github/workflows/hugo.yml`
