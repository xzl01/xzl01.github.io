# W-kTNY 导入记录

- 记录时间: 2026-03-06
- 操作人: Codex + 用户确认
- 数据源目录: `W-kTNY/pages/*.md`
- 导入目标:
  - 文章: `content/blog/`
  - 图片: `static/images/imported/w-ktny/`
  - 附件: `static/files/imported/w-ktny/`

## 执行摘要

本次继续沿用“先候选、后确认、再落地”的导入流程。

1. 先基于既有隐私与完整性口径筛出第二批候选。
2. 用户确认导入 `#1 #2 #3 #4 #8`，并要求“润色后导入”。
3. 已完成落库、路径改写、必要润色、清洗脚本执行与构建验证。

## 已确认的筛选口径

- 隐私模式: 中等
- 完整性模式: 可直接发布
- 主题优先: Linux/系统开发优先
- 文件命名: 清理随机后缀并规范 slug
- 日期策略: 原文无明确创建时间时使用导入日期

## 本次导入文章（5篇）

1. `content/blog/debian-package-patch-refresh-doxygen.md`
2. `content/blog/reuse-compliance-guide.md`
3. `content/blog/mime-app-association-spec-guide.md`
4. `content/blog/desktop-entry-spec-guide.md`
5. `content/blog/linux-kernel-process-init-and-creation.md`

## 本次复制资源

- 图片目录: `static/images/imported/w-ktny/`
- 图片文件数: 2
- 图片列表:
  - `image_wxM1nP52aR.png`
  - `image_Dh8Xfjef-j.png`

- 附件目录: `static/files/imported/w-ktny/`
- 附件文件数: 0

## 路径与内容处理

- 已将文内本地图片路径改写为 `/images/imported/w-ktny/...`
- 已将遗留内部链接改写为站内博客链接
- 已补齐并统一 front matter:
  - `title`
  - `date`
  - `description`
  - `categories`
  - `tags`
- 已对导语和部分段落表达做最小润色，移除不适合直接发布的口语化表述

## 执行命令

- 清洗脚本:
  - `scripts/clean_imported_markdown.py content/blog/debian-package-patch-refresh-doxygen.md content/blog/reuse-compliance-guide.md content/blog/mime-app-association-spec-guide.md content/blog/desktop-entry-spec-guide.md content/blog/linux-kernel-process-init-and-creation.md`
- 构建命令:
  - `hugo --minify`

## 备注

- 本记录仅覆盖 2026-03-06 这一批次导入。
- 仍有一批候选尚未落库，后续可继续按同口径增量整理。
