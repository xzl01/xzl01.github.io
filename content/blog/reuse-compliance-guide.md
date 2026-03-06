---
title: "REUSE 使用指南"
date: 2026-03-06T09:20:00+08:00
description: "介绍如何使用 REUSE 为项目补齐许可证与版权声明，覆盖初始化、代码文件和非代码文件的合规处理方式。"
categories: ["工程实践", "开源合规"]
tags: ["REUSE", "SPDX", "开源合规", "许可证"]
---

REUSE 适合解决一个很实际的问题：当项目中文件越来越多时，许可证文本、版权声明和资源文件的合规信息很容易逐步失控。与其靠人工约定，不如把这些信息放进可检查、可自动化处理的流程中。

## 什么是 REUSE

REUSE 是一套围绕开源合规整理出来的工具与约定，主要用于下载许可证文本、补充版权声明，并检查项目中的声明是否符合规范。

## 使用 REUSE 配置项目

## 安装

REUSE 依赖本地 Python 环境，因此需要先安装 `python` 和 `pip`。

```bash
sudo apt install python3
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
sudo python3 get-pip.py
```

然后安装 REUSE：

```bash
pip3 install --user reuse

```

安装完成后，需要确保 `~/.local/bin` 已经在 `$PATH` 中。在 Windows 上，对应路径通常类似于 `%USERPROFILE%\AppData\Roaming\Python\Python39\Scripts`，具体取决于 Python 版本。

## 使用

### 初始化项目

进入项目后运行 `reuse init`，工具会以交互方式询问所需许可证、版权所有人和邮箱。这里最重要的是许可证名称必须使用标准 SPDX 标识：[许可证名称](https://spdx.org/licenses/ "许可证名称")。

如果初始化时漏掉了某个许可证，也可以后续使用 `reuse download <许可证名称>` 单独下载，工具会把它们统一放到项目的 `LICENSES` 目录中。

### 为代码文件添加版权声明

#### 使用自动化脚本添加

含有代码逻辑文件添加版权声明方法为：

```bash
reuse addheader --copyright="UnionTech Software Technology Co., Ltd." --license=GPL-3.0-or-later -r <目录>
```

这只是一个简单示例，REUSE 还有更多参数可用：

`--copyright-style`可以将默认值更改 SPDX-FileCopyrightText为以下样式之一：

```text
spdx:           SPDX-FileCopyrightText: <year> <statement>
spdx-symbol:    SPDX-FileCopyrightText: © <year> <statement>
string:         Copyright <year> <statement>
string-c:       Copyright (C) <year> <statement>
string-symbol:  Copyright © <year> <statement>
symbol:         © <year> <statement>
```

REUSE 不会限制你使用多少个 copyright，也不会限制你在同一项目中声明多少种 license。

REUSE 会根据文件类型猜测合适的注释格式；如果自动处理效果不理想，或者你需要更精细的控制，可以考虑下面的手动方式。

#### 手动进行添加

REUSE 允许手动添加版权声明，只要最终文本符合它的规范即可。更实际的做法通常是：先用自动命令生成一个模板，再按项目需要微调。

#### 自动进行添加

理论上，REUSE 不限制你用什么方式生成这些声明；只要结果符合规范，你完全可以用自己熟悉的脚本语言来做自动化。

### 为非代码文件添加版权声明

项目里往往还包含图片、音频等非代码文件。这些文件同样可能受版权约束，但又不适合直接写入注释，因此更常见的做法是通过外部 `dep5` 文件集中声明。执行 `reuse init` 后，这个文件通常已经生成，可以直接在其基础上维护，例如：

```text
## css
Files: *.css
Copyright: None
License: CC0-1.0
```

第一行是注释，第二行是文件匹配规则，第三行是版权信息（如果使用 `CC0`，通常可写 `None`），第四行是许可证。注释虽然不是强制项，但为了后续维护，建议保留。

文件匹配支持通配符，但不支持正则表达式：`*` 匹配多个字符，`?` 匹配单个字符。可以利用这一点覆盖某个目录下的一组资源文件。

例子：

```纯文本
## assets
Files: styleplugins/dstyleplugin/assets/*
Copyright: UnionTech Software Technology Co., Ltd.
License: GPL-3.0-or-later
```

这个例子展示了有版权信息的情况

例子：

```纯文本
## png svg
Files: platformthemeplugin/icons/* styleplugins/chameleon/menu_shadow.svg styles/images/woodbackground.png
       styles/images/woodbutton.png tests/iconengines/builtinengine/icons/actions/icon_Layout_16px.svg
       tests/iconengines/svgiconengine/icon_window_16px.svg
Copyright: None
License: CC0-1.0
```

这个例子展示了为多个文件路径及文件配置版权信息

**强烈推荐你使用路径和具体文件名的方式来制定版权信息，而要避免大范围使用通配符的情况**

例子：

```纯文本
Format: https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/
Upstream-Name: qt5integration
Upstream-Contact: UnionTech Software Technology Co., Ltd.  <>
Source: https://github.com/linuxdeepin/qt5integration

## README
Files: README.md CHANGELOG.md
Copyright: None
License: CC0-1.0

## assets
Files: styleplugins/dstyleplugin/assets/*
Copyright: UnionTech Software Technology Co., Ltd.
License: GPL-3.0-or-later

## Project file
Files: *.pro *.prf *.pri
Copyright: None
License: CC0-1.0

## css
Files: *.css
Copyright: None
License: CC0-1.0

## qrc
Files: *.qrc
Copyright: None
License: CC0-1.0

## png svg
Files: platformthemeplugin/icons/* styleplugins/chameleon/menu_shadow.svg styles/images/woodbackground.png
       styles/images/woodbutton.png tests/iconengines/builtinengine/icons/actions/icon_Layout_16px.svg
       tests/iconengines/svgiconengine/icon_window_16px.svg
Copyright: None
License: CC0-1.0

## sh
Files: tests/test-recoverage-qmake.sh
Copyright: None
License: CC0-1.0

## ignore git
Files: .git*
Copyright: None
License: CC0-1.0

## xml toml json conf yaml
Files: *.xml *.toml *.json *conf *.yaml
Copyright: None
License: CC0-1.0

## rpm
Files: rpm/*
Copyright: None
License: CC0-1.0

## debian
Files: debian/*
Copyright: None
License: CC0-1.0

## Arch
Files: archlinux/*
Copyright: None
License: CC0-1.0
```

### 无需版权声明文件的处理方案

有部分文件是无需版权声明的，比如说某些资源文件脚本文件或者序列化的文件，这种文件有两种处理方式：

- `.gitignore` 是用来忽略某些与项目无关的文件和编译过程中产生的文件，同样的如果reuse也会忽略在`.gitignore`中标记的文件
- `dep5` 在执行项目init之后，会在项目目录下产生`.reuse/dep5` 文件，打开后能看到官方给的范例，如果一个文件不需要特殊版权声明则使用`CC0-1.0`（会放弃对此文件的所有版权）

## 检查项目合规

```bash
reuse lint
```

这个命令会列出项目文件数，如果项目已经合规，将会以`：-）`提示，如果项目有些文件不符合开源许可证规范将会以`：-（`提示，此时你就需要按照上面的提示进行相应的修改即可。

一般情况下，每个文件都需要有与之相关的版权和许可信息。REUSE规范详细说明了几种方法。总的来说，有这些方法：

- 将标签放在文件的标题中。
- 将标签放置在与`.license`文件相邻的文件中。
- 将信息放入 `DEP5` 文件中。

如果发现一个文件没有与之关联的版权和/或许可信息，则该项目不合规。

## 个人建议

个人建议如果对现有项目使用reuse配置且需要保留版权的时间信息，不要使用一键配置版权头的方式，而是进行手动替换，这里推荐使用vscode的文件筛选功能，筛选出你需要添加的文件，然后cv下去。在配置dep5文件的时候，一定小心通配符的范围，不宜过大。并且对于第三方版权文件一定得小心规避，同样需要完整保留第三方版权信息。

## 统信软件常见Dep5书写参考

参考详细见：

```纯文本
Format: https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/
Upstream-Name: dtkgui
Upstream-Contact: UnionTech Software Technology Co., Ltd. <>
Source: https://github.com/linuxdeepin/dtkgui

## ci
Files: .github/* .gitlab-ci.yml
Copyright: None
License: CC0-1.0

## gitignore #
Files: .gitignore
Copyright: None
License: CC0-1.0

## json conf yaml
Files: *.json *conf *.yaml
Copyright: None
License: CC0-1.0

#interface
Files: src/util/D* src/kernel/D* src/filedrag/D*
Copyright: None
License: CC0-1.0

## rpm
Files: rpm/*
Copyright: None
License: CC0-1.0

## debian
Files: debian/*
Copyright: None
License: LGPL-3.0-or-later

## Arch
Files: archlinux/*
Copyright: None
License: CC0-1.0

## README&doc
Files: README.md doc/src/*.qdoc
Copyright: None
License:  CC-BY-4.0

## DBus
Files: src/dbus/*.xml
Copyright: None
License: CC0-1.0

## Project file
Files: *.pro *.prf *.pri *.qrc *CMakeLists.txt
Copyright: None
License: CC0-1.0

## svg
Files: src/util/icons/actions/*  src/util/icons/icons/* src/util/icons/texts/*
  tests/images/logo_icon.svg
Copyright: UnionTech Software Technology Co., Ltd.
License: LGPL-3.0-or-later
```

## 常见开源协议选择

一般情况下对于文档信息使用`CC-BY-4.0` 对于我们的一般开源项目使用`LGPL-3.0-or-later`许可证，如果遇到第三方文件，则是需要保留原有许可证，保留原版版权声明。
