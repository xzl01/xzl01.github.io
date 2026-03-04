# Blog Maintenance Guide

This file helps AI agents understand how to maintain this Hugo blog.

## Blog Info

- **URL**: https://xzl01.github.io/
- **Framework**: Hugo
- **Theme**: Custom (no theme, custom layouts)
- **Language**: Chinese (zh-cn)
- **Content Directory**: `content/blog/`
- **Deployment**: GitHub Pages (GitHub Actions)

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
| `linux-5g-modem.md` | Linux 5G Modem 配置 | - |
| `logitech-linux-config-guide.md` | Linux 下罗技键鼠配置指南 | 2026-03-02 |

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
date: 2026-03-04
description: "简短描述"
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
| date | Yes | 发布日期 (YYYY-MM-DD) |
| description | No | 文章描述 |
| tags | No | 标签数组 |

### Content Structure
- Use `---` separators for front matter
- Use proper heading levels (`#`, `##`, `###`)
- Use bullet lists for lists
- Use tables for structured data
- Use code blocks with language tags

## Code Highlighting

This blog uses highlight.js with github-dark theme.

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

## Layout Files

| File | Purpose |
|------|---------|
| `layouts/index.html` | Homepage (shows blog posts) |
| `layouts/_default/single.html` | Single post layout |
| `layouts/_default/list.html` | List page layout |
| `layouts/_default/baseof.html` | Base template |

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

## For AI Agents

When maintaining this blog:

1. **Language**: Always use Chinese for content (blog is Chinese-language)
2. **Front Matter**: Include in all posts
3. **Code Blocks**: Use language tags for syntax highlighting
4. **Testing**: Test locally with `hugo server` before pushing
5. **Commit Messages**: Use descriptive Chinese/English messages
6. **Images**: Use relative paths in `static/` folder
7. **Links**: Use absolute paths starting with `/`

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
- Check config.toml has highlight settings

## Contact

- Blog Owner: HarryLoong
- GitHub: https://github.com/xzl01/xzl01.github.io
