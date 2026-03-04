# W-kTNY 导入记录

- 记录时间: 2026-03-04
- 操作人: Codex + 用户确认
- 数据源目录: `W-kTNY/pages/*.md`
- 导入目标:
  - 文章: `content/blog/`
  - 图片: `static/images/imported/w-ktny/`
  - 附件: `static/files/imported/w-ktny/`

## 执行摘要

本次执行了“先候选、后确认、再落地”的导入流程。

1. 首轮候选清单生成后，用户明确要求去掉 `#1` 和 `#5`。
2. 用户随后确认导入剩余候选（13 篇）。
3. 已完成落库、资源复制、路径改写与 Hugo 构建验证。

## 已确认的筛选口径

- 隐私模式: 中等
- 完整性模式: 可直接发布
- 主题优先: Linux/系统开发优先
- 文件命名: 清理随机后缀并规范 slug
- 日期策略: 保留原文日期优先（无可提取日期时使用导入日期）

## 用户确认轨迹

- 候选清单阶段: 用户回复“1 和 5 去掉”
- 最终确认阶段: 用户回复“确定导入”

## 本次导入文章（13篇）

1. `content/blog/org-freedesktop-login1-systemd-logind-的-d-bus-接口.md`
2. `content/blog/tlp电源管理简述.md`
3. `content/blog/linux系统引导和启动程序.md`
4. `content/blog/linux-下罗技键鼠驱动指南.md`
5. `content/blog/upower.md`
6. `content/blog/内核进程销毁.md`
7. `content/blog/logind-conf-logind-conf-d-login-manager-设置文件.md`
8. `content/blog/3-数据库系统的用户接口以及sql语言.md`
9. `content/blog/xdg-基本目录规范.md`
10. `content/blog/从操作系统维护者的角度去看不可变发行版.md`
11. `content/blog/accountsservice.md`
12. `content/blog/1-概述.md`
13. `content/blog/智能指针.md`

## 本次复制资源

- 图片目录: `static/images/imported/w-ktny/`
- 图片文件数: 6
- 图片列表:
  - `image_1y9KhTAivY.png`
  - `image_DwAQjufO45.png`
  - `image_MkZ6-dBCRM.png`
  - `image_mNVHng49it.png`
  - `image_mt407J-UN-.png`
  - `image_uKHLYfEvOC.png`

- 附件目录: `static/files/imported/w-ktny/`
- 附件文件数: 0

## 路径与格式处理

- 已将导入文内资源路径从 `../image/...` 改写为 `/images/imported/w-ktny/...`
- 新文章统一补齐 front matter:
  - `title`
  - `date`
  - `description`
  - `tags`

## 验证记录

- 构建命令: `hugo --minify`
- 构建结果: 成功
- 关键输出:
  - `Pages: 57`
  - `Static files: 8`

## 备注

- 本记录仅覆盖 2026-03-04 这一批次导入。
- 如需继续从 `W-kTNY` 导入下一批，建议复用本记录中的筛选口径并新建下一条记录文件。


## 二次整理（重命名与分类）

- 整理时间: 2026-03-04
- 目标: 提高文件名可读性与文章分类可维护性

### 分类策略

- `Linux系统`: 系统服务、内核、引导、电源、规范类文章
- `数据库`: 数据库基础与 SQL 相关文章
- `C++`: C++ 语言机制与内存管理文章
- `系统维护`: 发行版维护视角文章

### 重命名映射

- `org-freedesktop-login1-systemd-logind-的-d-bus-接口.md` -> `systemd-logind-dbus-interface.md`
- `tlp电源管理简述.md` -> `linux-tlp-power-management-guide.md`
- `linux系统引导和启动程序.md` -> `linux-boot-process.md`
- `linux-下罗技键鼠驱动指南.md` -> `linux-logitech-input-guide.md`
- `upower.md` -> `linux-upower-guide.md`
- `内核进程销毁.md` -> `linux-kernel-process-exit.md`
- `logind-conf-logind-conf-d-login-manager-设置文件.md` -> `systemd-logind-config-guide.md`
- `3-数据库系统的用户接口以及sql语言.md` -> `database-user-interface-and-sql.md`
- `xdg-基本目录规范.md` -> `xdg-base-directory-spec.md`
- `从操作系统维护者的角度去看不可变发行版.md` -> `immutable-linux-distro-maintainer-view.md`
- `accountsservice.md` -> `linux-accountsservice-guide.md`
- `1-概述.md` -> `database-overview.md`
- `智能指针.md` -> `cpp-smart-pointer-basics.md`

### Front Matter 变更

- 新增 `categories` 字段
- 统一校准 `tags`
- 修正部分标题（如“1.概述” -> “数据库系统概述”）
