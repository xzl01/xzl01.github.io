---
title: "Debian 打包更新带 Patch 的软件包：以 Doxygen 为例"
date: 2026-03-06
description: "以 Doxygen 为例，记录 Debian 软件包在存在 patch 的情况下如何完成版本升级、构建排查与 patch 刷新。"
categories: ["工程实践", "软件打包"]
tags: ["Debian", "软件打包", "Patch", "Doxygen"]
---

这篇文章记录一次比较典型的发行版维护场景：上游版本已经前进，但发行版的软件包仍停留在旧版本，而且还叠加了一组历史 patch。目标不是“直接升级”，而是先理解已有 patch 的作用，再决定哪些需要刷新、哪些需要保留。

## 1. 软件包背景

上游地址：[https://github.com/doxygen/doxygen](https://github.com/doxygen/doxygen "https://github.com/doxygen/doxygen")

Debian打包地址： [https://packages.debian.org/bookworm/doxygen](https://packages.debian.org/bookworm/doxygen "https://packages.debian.org/bookworm/doxygen")

## 2. 分析软件包

当时的情况是：上游版本已经来到 `1.9.6`，而 Debian 打包版本仍停留在 `1.9.4`。这意味着如果要基于 Debian 的现有打包成果继续前进，就必须先搞清楚旧版本里那一组 patch 的背景和作用。

## 3. 升级尝试

### 第一次尝试：

先把 `1.9.4` 中的 `debian/` 目录整体迁移到 `1.9.6`，并暂时关闭所有 patch（把 `series` 重命名为 `series.bak`）。

然后执行构建：`dpkg-buildpackage -us -uc -b`。很快就能发现第一个问题：上游 `1.9.6` 调整了依赖文件路径到 `./deps/`，因此旧的打包逻辑无法直接复用。

### 第二次尝试：

修改 `debian/control` 以及相关构建逻辑，把原先依赖 `./deps/` 的部分改成新版本的正确路径。

再次构建后仍然失败，问题主要集中在 `jquery` 相关的构建文件上。

### 第三次尝试：

继续阅读 Debian 现有的 patch/diff，发现它们本来就对 `jquery` 的构建流程做过定制，因此接下来的关键不再是“绕开 patch”，而是把这些 patch 刷新到新目录结构上。

## 4. 更新 patch/diff

更新 patch 的常见步骤通常是：

1. 检查patch是否可以被应用：`git apply --check <diff name>`&#x20;

   我们现在的情况是jquery的文件夹被移动到一个新的目录，所以我们应该对patch的内容进行修改：
   ```diff
   Description: Avoid use of compass
    Compass is obsoleted by Sass and its reimplementation in C, sassc.
    .
    This patch avoids use of sass mixins border-radius and box-shadow
    shipped in libraries part of Compass, and adapts build rules to use
    sassc instead of Compass and YUI Compressor.
    .
    Sass mixins border-radius and box-shadow added vendored selectors now
    obsolete: Would help only browsers released in 2011 or earlier, used by
    0.02% of public web browsing today according to <https://caniuse.com/>.
    .
    If the reference Ruby implementation of Sass is preferred over sassc,
    simply replace "sassc" with "scss" in the Makefile rule.
   Author: Jonas Smedegaard <dr@jones.dk>
   Last-Update: 2022-07-16
   ---
   This patch header follows DEP-3: http://dep.debian.net/deps/dep3/
   Index: doxygen/jquery/Makefile
   ===================================================================
   --- doxygen.orig/jquery/Makefile
   +++ doxygen/jquery/Makefile
   @@ -28,10 +28,7 @@ doxmenu-min.css: sm-core-css.css \
                     sass/_round-corners-last-item.scss \
                     sass/_sm-dox.scss \
                     sass/_sub-items-indentation.scss
   -  compass compile --css-dir . --force sass/sm-dox.scss
   -  cat sm-core-css.css sm-dox.css > doxmenu.css
   -  java -jar $(MINIFIER).jar doxmenu.css > doxmenu-min.css
   -  rm -f sm-dox.css doxmenu.css
   +  cat sm-core-css.css sass/sm-dox.scss | sassc -I sass --style compressed > doxmenu-min.css

    clean:
      rm -rf $(RESULTS) doxmenu.css .sass-cache
   Index: doxygen/jquery/sass/_round-corners-last-item.scss
   ===================================================================
   --- doxygen.orig/jquery/sass/_round-corners-last-item.scss
   +++ doxygen/jquery/sass/_round-corners-last-item.scss
   @@ -8,7 +8,7 @@
        $selector: $selector + ', ' + $chain + ' a, ' + $chain + '*:not(ul) a, ' + $chain + ' ul';
      }
      #{$selector} {
   -    @include border-radius(0 0 $amount $amount);
   +    border-radius: 0 0 $amount $amount;
      }
      // highlighted items, don't need rounding since their sub is open
      $chain: $chain_prefix;
   @@ -18,6 +18,6 @@
        $selector: $selector + ', ' + $chain + ' a.highlighted, ' + $chain + '*:not(ul) a.highlighted';
      }
      #{$selector} {
   -    @include border-radius(0);
   +    border-radius: 0;
      }
    }
   Index: doxygen/jquery/sass/_sm-dox.scss
   ===================================================================
   --- doxygen.orig/jquery/sass/_sm-dox.scss
   +++ doxygen/jquery/sass/_sm-dox.scss
   @@ -1,5 +1,3 @@
   -@import 'compass';
   -
    // This file is best viewed with Tab size 4 code indentation

   @@ -164,7 +162,7 @@ $sm-dox__toggle-spacing: floor($sm-dox__
    // Main menu box
    .sm-dox {
        background-image: $sm-dox__collapsible-bg;
   -    //@include border-radius($sm-dox__collapsible-border-radius);
   +    //border-radius: $sm-dox__collapsible-border-radius;

        // Main menu items
        a {
   @@ -215,7 +213,7 @@ $sm-dox__toggle-spacing: floor($sm-dox__
                text-align: center;
                text-shadow: none;
                background: $sm-dox__collapsible-toggle-bg;
   -            @include border-radius($sm-dox__border-radius);
   +            border-radius: $sm-dox__border-radius;
            }
            & span.sub-arrow:before {
                display: block;
   @@ -230,7 +228,7 @@ $sm-dox__toggle-spacing: floor($sm-dox__

        // round the corners of the first item
        > li:first-child > a, > li:first-child > :not(ul) a {
   -        @include border-radius($sm-dox__collapsible-border-radius $sm-dox__collapsible-border-radius 0 0);
   +        border-radius: $sm-dox__collapsible-border-radius $sm-dox__collapsible-border-radius 0 0;
        }
        // round the corners of the last item
        @include sm-dox__round-corners-last-item($sm-dox__collapsible-border-radius);
   @@ -307,7 +305,7 @@ $sm-dox__toggle-spacing: floor($sm-dox__
            padding: 0 $sm-dox__desktop-padding-horizontal;
            background-image: $sm-dox__desktop-bg;
            line-height: 36px;
   -        //@include border-radius($sm-dox__desktop-border-radius);
   +        //border-radius: $sm-dox__desktop-border-radius;

            // Main menu items
            a {
   @@ -322,7 +320,7 @@ $sm-dox__toggle-spacing: floor($sm-dox__
                    border-style: solid dashed dashed dashed;
                    border-color: $sm-dox__main-text-color transparent transparent transparent;
                    background: transparent;
   -                @include border-radius(0);
   +                border-radius: 0;
                }

                &,
   @@ -335,7 +333,7 @@ $sm-dox__toggle-spacing: floor($sm-dox__
                    background-image:url('tab_s.png');
                    background-repeat:no-repeat;
                    background-position:right;
   -                @include border-radius(0 !important);
   +                border-radius: 0 !important;
                }
                &:hover {
                  background-image: url('tab_a.png');
   @@ -384,8 +382,8 @@ $sm-dox__toggle-spacing: floor($sm-dox__
                border: $sm-dox__border-width solid $sm-dox__gray-dark;
                padding: $sm-dox__desktop-sub-padding-vertical $sm-dox__desktop-sub-padding-horizontal;
                background: $sm-dox__desktop-sub-bg;
   -            @include border-radius($sm-dox__desktop-sub-border-radius !important);
   -            @include box-shadow($sm-dox__desktop-sub-box-shadow);
   +            border-radius: $sm-dox__desktop-sub-border-radius !important;
   +            box-shadow: $sm-dox__desktop-sub-box-shadow;

                // Sub menus items
                a {
   @@ -540,7 +538,7 @@ $sm-dox__toggle-spacing: floor($sm-dox__
            // Main menu box
            &.sm-vertical {
                padding: $sm-dox__desktop-vertical-padding-vertical 0;
   -            @include border-radius($sm-dox__desktop-vertical-border-radius);
   +            border-radius: $sm-dox__desktop-vertical-border-radius;

                // Main menu items
                a {
   ```

   分析patch内容可见：其
