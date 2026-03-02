---
title: "Linux 下使用 5G Modem 上网指南"
date: 2026-03-02
description: "详细介绍在 Linux 系统上配置 5G 蜂窝网络上网的完整步骤"
tags: ["Linux", "5G", "Modem", "教程"]
---

## 简介

本教程将详细介绍在 Linux 系统中使用 ModemManager 连接 5G 网络的完整步骤。

## 环境说明

- **操作系统**: Deepin Linux / Debian / Ubuntu
- **硬件**: 5G WWAN 模块
- **软件**: ModemManager, NetworkManager

## 第一步：安装 ModemManager

ModemManager 是一个由 freedesktop 托管的项目，旨在 Linux 设备上运行调制解调器以获得蜂窝无线网络连接能力。

```bash
# 安装 ModemManager
sudo apt install modemmanager
```

### 检查内核驱动

确保内核模块已正确加载 WWAN 驱动：

```bash
lspci -vvv
```

## 第二步：使用 mmcli 连接 5G 网络

### 1. 查看 WWAN 卡信息

```bash
mmcli -L
```

返回信息包含三个内容：
- DBus 地址
- 设备类型
- 设备 ID

> 💡 DBus 地址的最后一位为设备编号

### 2. 查看设备详情

```bash
mmcli --modem=<设备编号>
```

### 3. 解锁 SIM 卡（如有 PIN 锁）

```bash
mmcli --modem=0 --sim=0 --pin=你的PIN码
```

### 4. 启动设备

```bash
mmcli --modem=<设备编号> --enable
```

### 5. 连接网络

```bash
mmcli -m <设备编号> --simple-connect='apn=你的APN,ip-type=ipv4v6'
```

**示例**（中国电信）：

```bash
mmcli -m 4 --simple-connect='apn=ctnet,ip-type=ipv4v6'
```

### 6. 查看 Bearer 信息

```bash
mmcli -m <设备编号> -b <Bearer编号>
```

成功后会显示类似信息：

```
Status
  connected: yes
  interface: wwan0

IPv4 configuration
  method: static
  address: 10.122.58.19
  prefix: 8
  gateway: 10.122.58.17
  dns: 202.103.24.68, 202.103.44.150
```

## 第三步：通过 NetworkManager 管理连接

NetworkManager 对 ModemManager 有很好的支持。

### 1. 查看网络设备

```bash
nmcli device show
```

你会看到一个以 `wwan` 开头的设备：

```
GENERAL.DEVICE: wwan0mbim0
GENERAL.TYPE: gsm
GENERAL.STATE: 100（已连接）
```

### 2. 激活连接

```bash
nmcli d connect wwan0mbim0
```

### 3. 验证连接

```bash
ip a
```

看到分配到的 IP 地址就说明成功了！

## 常见问题

### Q: mmcli 命令找不到？

确保已安装 `modemmanager` 和 `modemmanager-gui` 包

### Q: 一直显示 "connecting"？

检查 SIM 卡是否正确插入，APN 是否正确

### Q: DNS 无法解析？

手动设置 DNS：

```bash
nmcli dev modify wwan0 ipv4.dns "8.8.8.8 8.8.4.4"
```

## 总结

通过以上步骤，你就可以在 Linux 系统上使用 5G 蜂窝网络上网了。ModemManager 提供了便捷的命令行工具，让 5G 上网变得简单可控。

> 📡 享受高速的 5G 网络吧！
