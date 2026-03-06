# Blog Maintenance Guide

This file helps AI agents understand how to maintain this Hugo blog.

## Blog Info

- **URL**: https://xzl01.github.io/
- **Framework**: Hugo
- **Theme**: Custom (no theme, custom layouts)
- **Language**: Chinese (zh-cn)
- **Content Directory**: `content/blog/`
- **Deployment**: GitHub Pages (GitHub Actions)
- **Code Highlighting**: highlight.js + local Catppuccin-style colors

## Key Files

| File | Purpose |
|------|---------|
| `config.toml` | Hugo configuration |
| `content/blog/` | Blog posts (Markdown) |
| `layouts/` | Custom templates |
| `static/` | Static assets (images, CSS, JS) |
| `.github/workflows/hugo.yml` | GitHub Actions deployment |
| `.github/AGENT.md` | This file - AI agent guide |

## Current Blog Posts

| File | Title | Date |
|------|-------|------|
| `welcome.md` | 欢迎来到我的博客 | 2026-03-02 |
| `linux-5g-modem.md` | Linux 下使用 5G Modem 上网指南 | 2026-03-02 |
| `logitech-linux-config-guide.md` | Linux 下罗技键鼠配置指南 - logiops 使用教程 | 2026-03-02 |
| `chroot-cross-architecture.md` | 64位主机进入ARM/32位rootfs的chroot配置指南 | 2026-03-04 |

## How to Add a New Post

### 1. Create a new Markdown file

```bash
# File naming: content/blog/{slug}.md
# Example: content/blog/my-new-post.md
```

### 2. Use front matter template

```yaml
---
title: "文章标题"
date: 2026-03-06T16:10:00+08:00
description: "简短描述"
categories: ["分类1", "分类2"]
tags: ["标签1", "标签2"]
---

# 正文内容...
```

### 3. Build and deploy

```bash
hugo --minify
git add .
git commit -m "Add new post: 文章标题"
git push origin main
```

## Content Guidelines

### Language
- **Title**: Chinese
- **Content**: Chinese (中文)
- **Code comments**: English or Chinese

### Front Matter Required Fields
| Field | Required | Description |
|-------|----------|-------------|
| title | Yes | 文章标题 |
| date | Yes | 发布时间，优先使用完整时间戳 (`YYYY-MM-DDTHH:MM:SS+08:00`) |
| description | No | 文章描述 |
| categories | No | 分类数组 |
| tags | No | 标签数组 |

### Date/Time Policy

- Do **not** default to date-only front matter for newly added or imported posts.
- Prefer full timestamps so multiple posts on the same day can be sorted correctly.
- Existing old posts may still use date-only values, but new maintenance work should use full time.

Example:

```yaml
date: 2026-03-06T16:10:00+08:00
```

### Content Structure
- Use `---` separators for front matter
- Use proper heading levels (`#`, `##`, `###`)
- Use bullet lists for lists
- Use tables for structured data
- Use code blocks with language tags

## Code Highlighting

This blog uses highlight.js with a local Catppuccin-style theme defined in `static/css/site.css`.

### Supported Languages

| Language | Code Block Syntax |
|----------|------------------|
| Bash | ```bash |
| Python | ```python |
| JavaScript | ```javascript |
| C | ```c |
| C++ | ```cpp |
| JSON | ```json |
| HTML | ```html |
| CSS | ```css |
| Markdown | ```markdown |
| YAML | ```yaml |
| Go | ```go |
| Rust | ```rust |
| Shell | ```sh |

### Code Block Examples

**Bash:**
```bash
echo "Hello World"
ls -la
```

**Python:**
```python
def hello():
    print("Hello")
```

**C:**
```c
#include <stdio.h>
int main() {
    printf("Hello\n");
    return 0;
}
```

## GitHub Actions

The blog auto-deploys on push to main branch.

### Workflow File
`.github/workflows/hugo.yml`

### Deployment Process
1. Trigger: Push to main branch
2. Action: Builds with Hugo
3. Output: Deploys to gh-pages branch
4. URL: https://xzl01.github.io/

### Manual Deployment
```bash
# Not needed - automatic on push
```

## Common Tasks

### Update Blog Title
Edit `config.toml` → `title` field.

### Add Custom CSS/JS
Add files to `static/` directory.
- CSS: `static/css/`
- JS: `static/js/`

### Add Images
1. Put images in `static/images/`
2. Reference as `/images/filename.jpg`

Example:
```markdown
![Image](/images/screenshot.png)
```

### Add New Category/Tag
Tags are defined in post front matter. No central config needed.

### Tag Behavior

- Tags shown on article pages must be clickable.
- Tags shown on list pages should also be clickable when rendered.
- Clicking a tag should open the corresponding Hugo taxonomy page under `/tags/<tag>/`.
- Do not render article tags as plain text pills unless there is a deliberate design reason.

## Layout Files

| File | Purpose |
|------|---------|
| `layouts/index.html` | Homepage (shows blog posts) |
| `layouts/_default/single.html` | Single post layout |
| `layouts/_default/list.html` | List page layout |
| `layouts/_default/baseof.html` | Base template |
| `layouts/partials/post-time.html` | Shared date/time display formatter |

## Config.toml Reference

```toml
baseURL = 'https://xzl01.github.io/'
languageCode = 'zh-cn'
title = "Your Title"

[outputs]
  home = ["HTML"]
  page = ["HTML"]

[markup]
  [markup.highlight]
    noClasses = false
    style = "github-dark"
  [markup.goldmark.renderer]
    unsafe = true
```

## Current UX Rules

### Footer Build Info

- The footer should display:
  - current commit short hash
  - build/update time
- Local preview may show `commit local`.
- GitHub Pages production build should inject the real commit hash through GitHub Actions.

### Article Layout

- Article content width should be wider than the default Hugo-like narrow column.
- The table of contents should sit in the right-side whitespace area instead of shrinking the main reading column.
- On mobile, the TOC should fall back above the article content.

### Homepage

- Homepage should stay minimal.
- Blog and gallery are the same priority.
- Avoid count widgets such as article totals or tag totals unless explicitly requested.

## For AI Agents

When maintaining this blog:

1. **Language**: Always use Chinese for content (blog is Chinese-language)
2. **Front Matter**: Include in all posts
3. **Code Blocks**: Use language tags for syntax highlighting
4. **Testing**: Test locally with `hugo server` before pushing
5. **Commit Messages**: Use descriptive Chinese/English messages
6. **Images**: Use relative paths in `static/` folder
7. **Links**: Use absolute paths starting with `/`
8. **Tags**: Render tags as clickable links to taxonomy pages
9. **Time**: Prefer full timestamps over date-only values for new posts
10. **Footer**: Keep commit hash and update time visible in the footer

## Troubleshooting

### Build Failed
- Check front matter syntax (YAML)
- Verify all code blocks have language tags
- Ensure all referenced images exist in `static/`

### Deployment Failed
- Check GitHub Actions logs
- Verify repository settings: Pages → Source = gh-pages
- Check token permissions

### Code Not Highlighting
- Ensure language tag is correct (e.g., ```bash not ```shell)
- Check `static/css/site.css` for local highlight theme rules
- Avoid relying on third-party highlight theme CSS

### Remote Page Looks Different From Local
- Check `.github/workflows/hugo.yml` Hugo version matches local Hugo version
- Check asset cache busting is still present for `/css/site.css` and `/js/site.js`
- Check GitHub Actions build actually ran after push

## Contact

- Blog Owner: HarryLoong
- GitHub: https://github.com/xzl01/xzl01.github.io

## Import Records

- Import records are stored in `.github/import-records/`.
- Latest records:
  - `.github/import-records/2026-03-04-w-ktny-import.md`
  - `.github/import-records/2026-03-06-w-ktny-import-batch-2.md`

## Import Cleanup Automation

- After importing markdown files into `content/blog/`, run:
  - `scripts/clean_imported_markdown.py content/blog/<file1>.md content/blog/<file2>.md ...`
- This step normalizes heading hierarchy, fixes malformed code fences, removes empty table rows, and trims noisy formatting.
- Treat this as mandatory before `hugo --minify` verification.
- After cleanup, always run a full build (`hugo --minify`) and restart `hugo server` to avoid stale hot-reload cache issues.
