---
title: "64位主机进入ARM/32位rootfs的chroot配置指南"
date: 2026-03-04
description: "详解在64位主机上使用chroot进入不同架构rootfs的完整配置流程"
tags: ["Linux", "chroot", "ARM", "QEMU", "交叉编译"]
---

# 64位主机进入ARM/32位rootfs的chroot配置指南

在 64 位主机上使用 chroot 进入一个为不同架构（如 ARM 或 32 位 i386）准备的根文件系统（rootfs）时，为了确保环境能正常工作，必须正确挂载一系列虚拟文件系统。

## 1. 挂载核心虚拟文件系统

在 chroot 之前，必须将宿主机的几个关键虚拟文件系统绑定挂载到目标 rootfs 的对应目录下。这是为了让 chroot 环境内的进程能够访问设备、进程信息和系统信息等核心资源。

### /proc - 进程信息文件系统

```bash
sudo mount -t proc /proc /path/to/rootfs/proc
# 或使用 --bind 选项
sudo mount --bind /proc /path/to/rootfs/proc
```

### /sys - 系统内核信息

```bash
sudo mount -t sysfs /sys /path/to/rootfs/sys
# 或
sudo mount --bind /sys /path/to/rootfs/sys
```

### /dev - 设备文件系统

```bash
sudo mount --bind /dev /path/to/rootfs/dev
```

### /dev/pts - 伪终端支持

这是 `/dev` 下的一个特殊目录，用于伪终端支持，对于运行 bash 等 Shell 是必要的：

```bash
sudo mount --bind /dev/pts /path/to/rootfs/dev/pts
```

## 2. 其他可能需要挂载的目录

根据具体使用场景，可能还需要挂载以下目录：

### /tmp - 临时文件系统

```bash
sudo mount --bind /tmp /path/to/rootfs/tmp
```

### /run - 运行时目录

某些服务（如 Docker 守护进程）会用到：

```bash
sudo mount --bind /run /path/to/rootfs/run
```

## 3. 跨架构 chroot 的特殊准备

如果你的 rootfs 是为 ARM 或 i386 等与宿主机不同的 CPU 架构准备的，仅挂载文件系统是不够的。你还需要配置跨架构二进制执行支持，否则 chroot 后无法运行目标架构的程序。

### 安装必要工具

```bash
sudo apt update
sudo apt install qemu-user-static binfmt-support
```

### 复制 QEMU 静态二进制文件

将对应的 QEMU 静态二进制文件复制到 rootfs 的 `/usr/bin` 目录下：

```bash
# 对于 ARM (armhf/armel)
sudo cp /usr/bin/qemu-arm-static /path/to/rootfs/usr/bin/

# 对于 32位 x86 (i386)
sudo cp /usr/bin/qemu-i386-static /path/to/rootfs/usr/bin/
```

这个步骤使得宿主机内核能够识别并调用 QEMU 来执行目标架构的二进制文件。

## 4. 进入 chroot 环境

完成上述挂载和准备后，即可使用 chroot 命令进入目标根文件系统：

```bash
sudo chroot /path/to/rootfs /bin/bash
```

## 5. 退出与卸载

完成在 chroot 环境中的操作后，需要退出并按顺序卸载之前挂载的文件系统，以避免出现"设备忙"的错误。

### 退出 chroot

```bash
exit
```

### 卸载挂载点

```bash
sudo umount /path/to/rootfs/dev/pts
sudo umount /path/to/rootfs/dev
sudo umount /path/to/rootfs/proc
sudo umount /path/to/rootfs/sys
sudo umount /path/to/rootfs/tmp  # 如果挂载了
sudo umount /path/to/rootfs/run  # 如果挂载了
```

> ⚠️ 卸载顺序通常与挂载时相反

## 6. 自动化脚本

为了方便，可以将挂载和卸载步骤写成脚本：

```bash
#!/bin/bash
# ch-mount.sh

function mnt() {
    echo "MOUNTING"
    sudo mount -t proc /proc ${2}proc
    sudo mount -t sysfs /sys ${2}sys
    sudo mount -o bind /dev ${2}dev
    sudo mount -o bind /dev/pts ${2}dev/pts
    sudo chroot ${2}
}

function umnt() {
    echo "UNMOUNTING"
    sudo umount ${2}proc
    sudo umount ${2}sys
    sudo umount ${2}dev/pts
    sudo umount ${2}dev
}

if [ "$1" == "-m" ]; then
    mnt $1 $2
elif [ "$1" == "-u" ]; then
    umnt $1 $2
fi
```

### 使用方法

```bash
# 挂载并进入 chroot
sudo bash ch-mount.sh -m /path/to/rootfs/

# 卸载
sudo bash ch-mount.sh -u /path/to/rootfs/
```

## 总结

| 步骤 | 命令 |
|------|------|
| 挂载文件系统 | mount --bind /proc, /sys, /dev, /dev/pts |
| 配置 QEMU | qemu-user-static |
| 进入 chroot | chroot /path/to/rootfs /bin/bash |
| 退出 | exit |
| 卸载 | umount (顺序与挂载相反) |

通过正确配置这些虚拟文件系统和 QEMU 模拟器，就可以在 64 位 x86 主机上无缝运行 ARM 或 32 位 rootfs 中的程序了。
