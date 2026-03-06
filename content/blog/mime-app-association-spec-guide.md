---
title: "MIME 类型与应用程序关联规范解读"
date: 2026-03-06T10:00:00+08:00
description: "围绕 mimeapps.list 的查找顺序、默认应用规则和关联增删算法，整理 Linux 桌面环境中的 MIME 关联机制。"
categories: ["Linux系统", "规范标准"]
tags: ["Linux", "MIME", "FreeDesktop", "XDG"]
---

这篇文章聚焦一个在桌面 Linux 中非常常见、但经常被忽略的问题：文件类型是如何和应用程序建立关联的。规范层面看，它既涉及共享 MIME 数据库，也涉及桌面条目和默认应用的解析顺序。

## 介绍

[freedesktop.org](http://freedesktop.org "freedesktop.org")[共享 MIME 数据库](http://www.freedesktop.org/wiki/Specifications/shared-mime-info-spec/ "共享 MIME 数据库")提供了一种存储有关 MIME 类型和用于确定类型的规则的静态信息的方法。

[freedesktop.org](http://freedesktop.org "freedesktop.org")[桌面条目规范](http://www.freedesktop.org/wiki/Specifications/desktop-entry-spec/ "桌面条目规范")允许应用程序宣布它们支持的 MIME 类型。

这套规范主要回答三个问题：默认由哪个应用打开某种文件、用户如何修改默认应用，以及系统如何增删应用与 MIME 类型之间的关联。

## 文件名和位置

用户、系统管理员、应用程序供应商和发行版可以通过写入名为 mimeapps.list 的文件来更改应用程序和 mimetype 之间的关联。

该文件的查找顺序如下：

|                                                    |                      |
| -------------------------------------------------- | -------------------- |
| \$XDG\_CONFIG\_HOME/desktop-mimeapps.list          | 用户覆盖，特定于桌面（适用于高级用户）  |
| \$XDG\_CONFIG\_HOME/mimeapps.list                  | 用户覆盖（用户配置 GUI 的推荐位置） |
| \$XDG\_CONFIG\_DIRS/desktop-mimeapps.list          | 系统管理员和 ISV 覆盖，特定于桌面  |
| \$XDG\_CONFIG\_DIRS/mimeapps.list                  | 系统管理员和 ISV 覆盖        |
| XDG\_DATA\_DIRS/applications/desktop-mimeapps.list | 发行版提供的默认值，特定于桌面      |
| \$XDG\_DATA\_DIRS/applications/mimeapps.list       | 分发提供的默认值             |

在此表中，\$desktop 是当前桌面的名称之一，小写（例如，kde、gnome、xfce 等）

这是通过采用组件的 ascii 小写形式和环境变量 \$XDG\_CURRENT\_DESKTOP 确定的，该变量是当前桌面所称的以冒号分隔的名称列表。

\$desktop 变量应该依次是这些值中的每一个。

为简单起见，在本规范的其余部分中，所有上述文件都称为“mimeapps.list”。

请注意，特定于桌面的文件只能用于指定给定类型的默认应用程序。无法在这些文件中添加或删除关联。

用于确定与 mime 类型关联的所有应用程序列表和用于确定默认应用程序的算法（几乎）完全不相关，因此它们被单独呈现。

在 UOS/deepin 中，通常会同时存在用于全局设置和用户设置的两个 `mimeapps.list` 文件：

![](/images/imported/w-ktny/image_wxM1nP52aR.png)

```text
[Default Applications]
application/wps-office.et=/usr/share/applications/wps-office-et.desktop
application/wps-office.ett=/usr/share/applications/wps-office-et.desktop
application/wps-office.xls=/usr/share/applications/wps-office-et.desktop
application/wps-office.xlt=/usr/share/applications/wps-office-et.desktop
application/vnd.ms-excel=/usr/share/applications/wps-office-et.desktop
application/msexcel=/usr/share/applications/wps-office-et.desktop
application/wps-office.xlsx=/usr/share/applications/wps-office-et.desktop
application/wps-office.xltx=/usr/share/applications/wps-office-et.desktop
application/wps-office.dps=/usr/share/applications/wps-office-wpp.desktop
application/wps-office.dpt=/usr/share/applications/wps-office-wpp.desktop
application/wps-office.ppt=/usr/share/applications/wps-office-wpp.desktop
application/wps-office.pot=/usr/share/applications/wps-office-wpp.desktop
application/vnd.ms-powerpoint=/usr/share/applications/wps-office-wpp.desktop
application/vnd.mspowerpoint=/usr/share/applications/wps-office-wpp.desktop
application/powerpoint=/usr/share/applications/wps-office-wpp.desktop
application/wps-office.pptx=/usr/share/applications/wps-office-wpp.desktop
application/wps-office.potx=/usr/share/applications/wps-office-wpp.desktop
application/wps-office.wps=/usr/share/applications/wps-office-wps.desktop
application/wps-office.wpt=/usr/share/applications/wps-office-wps.desktop
application/wps-office.doc=/usr/share/applications/wps-office-wps.desktop
application/wps-office.dot=/usr/share/applications/wps-office-wps.desktop
application/vnd.ms-word=/usr/share/applications/wps-office-wps.desktop
application/msword=/usr/share/applications/wps-office-wps.desktop
application/msword-template=/usr/share/applications/wps-office-wps.desktop
application/x-deb=deepin-deb-installer.desktop
inode/directory=/usr/share/applications/dde-file-manager.desktop
image/bmp=/usr/share/applications/deepin-image-viewer.desktop
image/gif=/usr/share/applications/deepin-image-viewer.desktop
image/jpg=/usr/share/applications/deepin-image-viewer.desktop
image/jpeg=/usr/share/applications/deepin-image-viewer.desktop
image/png=/usr/share/applications/deepin-image-viewer.desktop
image/pbm=/usr/share/applications/deepin-image-viewer.desktop
image/pgm=/usr/share/applications/deepin-image-viewer.desktop
image/ppm=/usr/share/applications/deepin-image-viewer.desktop
image/xbm=/usr/share/applications/deepin-image-viewer.desktop
image/xpm=/usr/share/applications/deepin-image-viewer.desktop
image/svg=/usr/share/applications/deepin-image-viewer.desktop
image/dds=/usr/share/applications/deepin-image-viewer.desktop
image/icns=/usr/share/applications/deepin-image-viewer.desktop
image/jp2=/usr/share/applications/deepin-image-viewer.desktop
image/tga=/usr/share/applications/deepin-image-viewer.desktop
image/tiff=/usr/share/applications/deepin-image-viewer.desktop
image/wbmp=/usr/share/applications/deepin-image-viewer.desktop
image/webp=/usr/share/applications/deepin-image-viewer.desktop

```

## 添加/删除关联

在 mimeapps.list 文件中使用以下语法在 mimetypes 和应用程序之间添加和删除关联：

```纯文本
[添加关联]
mimetype1=foo1.desktop;foo2.desktop;foo3.desktop;
mimetype2=foo4.desktop;
[删除关联]
mimetype1=foo5.desktop;
```

\[Added Associations] 和 \[Removed Associations] 组只能出现在非桌面特定的文件中（即：在实际命名为“mimeapps.list”的文件中）。

\[Added Associations] 组定义了应用程序与 mimetype 的附加关联，就好像 .desktop 文件首先列出了这个 mimetype。

\[Removed Associations] 组删除应用程序与 mimetypes 的关联，就好像 .desktop 文件一开始没有列出此 mimetypes。

在“已添加”和“已删除”部分中为同一类型列出相同的应用程序是无效的，并且可能会产生实现定义的行为。

根据实现，给定类型的 \[Added Associations] 条目中的条目顺序应该是“最优先顺序”。因此，实现应该注意保持顺序，除非在他们明确打算改变它的情况下。

关联的添加和删除仅适用于当前目录中的桌面文件，或以后的文件（按优先顺序）。这意味着从 $XDG_CONFIG_HOME、$XDG\_CONFIG\_DIRS 和 \$XDG\_DATA\_HOME 中的 mimeapps.list 文件应用的添加和删除将覆盖所有现有桌面文件，但使用 /usr/share/applications/mimeapps.list 添加或删除关联，例如，如果命名应用程序的桌面文件存在于 \$XDG\_DATA\_HOME/applications 中，则将被忽略。换句话说：添加和删除的关联可以被认为等同于从包含 mimeapps.list 的目录（可能是同一目录）的下一个优先目录中复制桌面文件并调整其 MimeType=线。如果一样。desktop 文件再次出现在优先级较高的目录中，则此修改后的 .desktop 优先级较低的文件将被忽略。如果添加或删除涉及在此优先级或较低优先级不存在的桌面文件，则添加或删除将被忽略，即使桌面文件存在于高优先级目录中。

列出（按优先顺序）与给定 mimetype 关联的应用程序的建议算法是：

- 为结果创建一个空列表，以及一个临时空的“黑名单”
- 依次访问每个“mimeapps.list”文件；丢失的文件相当于一个空文件
- 将 mimeapps.list 中的任何“添加的关联”添加到结果列表中，不包括黑名单上的项目
- 将 mimeapps.list 中的任何“删除的关联”添加到黑名单
- 将与 mimeapps.list 位于同一目录中的任何 .desktop 文件添加到结果列表中，该文件在其 MimeType= 行中列出了给定类型，不包括已在黑名单中的任何桌面文件。对于基于 XDG\_CONFIG\_HOME 和 XDG\_CONFIG\_DIRS 的目录，（根据定义）同一目录中没有桌面文件。
- 将与 mimeapps.list 文件位于同一目录中的任何桌面文件的名称添加到黑名单中（对于基于 XDG\_CONFIG\_HOME 和 XDG\_CONFIG\_DIRS 的目录，该名称为无）
- 对每个后续目录重复最后四个步骤

对从最具体到最不具体的每个 mimetype 重复上述过程。请特别注意，具有更具体的 mime 类型的应用程序“已添加”将保持该关联，即使它在更高优先级的目录中被“删除”，使用不太具体的类型。

## 默认应用程序

通过写入文件 mimeapps.list 中的组 \[Default Applications] 来指示给定 mimetype 的默认应用程序。

\[默认应用程序] 组指示用于给定 mimetype 的默认应用程序。例如，这是在文件管理器中双击文件时将启动的。如果不再安装该应用程序，则尝试列表中的下一个应用程序，依此类推。

此示例确保应用程序 default1.desktop 将用于 mimetype1（如果已安装并与类型关联），否则将用于 default2.desktop（如果已安装并关联）：

\[默认应用程序] mimetype1=default1.desktop;default2.desktop;

该值是以分号分隔的桌面文件 ID 列表（在桌面条目规范中定义）。

如果没有这样的条目，则检查下一个 mimeapps.list。一旦检查了所有级别，如果找不到条目，则实现应该选择与 mimetype 关联的最喜欢的 .desktop 文件，同时考虑上一节中添加和删除的关联。

确定给定 mimetype 的默认应用程序的建议算法是：

- 在第一个 mimeapps.list 的“默认应用程序”组下获取给定 mimetype 的桌面 ID 列表
- 对于列表中的每个桌面 ID，尝试使用正常规则加载命名的桌面文件
- 如果找到有效的桌面文件，请验证它是否与类型相关联（如上一节所述）
- 如果找到有效关联，我们就找到了默认应用程序
- 如果在处理完所有列表项之后，我们还没有找到默认应用程序，则按搜索顺序继续下一个 mimeapps.list 文件并重复
- 如果处理完所有文件后，我们还没有找到默认应用程序，则选择支持该类型的最喜欢的应用程序（根据关联）

对从最具体到最不具体的每个 mimetype 重复上述过程。请特别注意，将优先使用可以处理更具体类型的应用程序，而不是显式标记为不太具体类型的默认值的应用程序。

请注意，与添加和删除关联不同，设置为应用程序默认值的桌面 ID 可以引用在更高优先级目录中找到的同名桌面文件。

另请注意，给定类型的默认应用程序必须是与该类型关联的应用程序。这意味着实现应该确保存在这样的关联，或者在将应用程序设置为类型的默认值时显式添加一个。
