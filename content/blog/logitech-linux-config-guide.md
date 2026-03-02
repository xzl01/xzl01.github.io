---
title: "Linux 下罗技键鼠配置指南 - logiops 使用教程"
date: 2026-03-02
description: "详解 Linux 下罗技鼠标键位配置，包含 logiops 安装、配置和调试"
tags: ["Linux", "Logitech", "鼠标", "配置教程"]
---

# Linux 下罗技键鼠配置指南

> 本文将详细介绍如何在 Linux 上配置罗技鼠标/键盘，包含 logiops 驱动的安装、键位映射和调试方法。

---

## 前置知识：设备控制 ID

在配置之前，需要了解罗技设备的控件 ID。以下是常用的控制 ID 表格：

### 鼠标按钮

| 控件 ID | 功能 |
|---------|------|
| `0x0050` | 鼠标左键 |
| `0x0051` | 鼠标右键 |
| `0x0052` | 鼠标中键 / 手势按钮 |
| `0x0053` | 前进按钮 |
| `0x0054` | 后退按钮 |
| `0x0056` | 侧边前进 |
| `0x0057` | 侧边后退 |
| `0x005b` | 向左滚动 |
| `0x005d` | 向右滚动 |

### 系统功能键

| 控件 ID | 功能 |
|---------|------|
| `0x006e` | 显示桌面 |
| `0x006f` | 锁定屏幕 |
| `0x0090` | 最小化 |
| `0x0091` | 最大化 |
| `0x00ba` | 切换应用 |
| `0x00e0` | 任务视图 |
| `0x00e1` | 操作中心 |
| `0x00c3` | 手势按钮 |
| `0x00c4` | 智能切换 |

### 媒体控制键

| 控件 ID | 功能 |
|---------|------|
| `0x00e4` | 上一曲目 |
| `0x00e5` | 播放/暂停 |
| `0x00e6` | 下一曲目 |
| `0x00e7` | 静音 |
| `0x00e8` | 降低音量 |
| `0x00e9` | 增加音量 |

> 📋 完整键码列表请参考：[linux/input-event-codes.h](https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h)

---

## 第一步：安装 logiops

### 从包管理器安装

```bash
# Debian/Ubuntu
sudo apt install logiops

# Arch Linux
sudo pacman -S logiops
```

### 从源码编译

```bash
# 安装依赖
sudo apt install cmake libevdev-dev libudev-dev

# 克隆源码
git clone https://github.com/PixlOne/logiops.git
cd logiops

# 编译安装
cmake .
make
sudo make install
```

---

## 第二步：配置 logiops

### 配置文件位置

| 位置 | 说明 |
|------|------|
| `/etc/logid.cfg` | 系统默认配置 |
| `~/.config/logid.cfg` | 用户配置 |
| `-c <file>` | 启动时指定 |

### 基础配置示例

```json
devices: (
    {
        // 设备名称（必须与设备匹配）
        name: "Wireless Mouse MX Master 2S";
        
        // DPI 设置
        dpi: 2000;
        
        // SmartShift 滚轮模式
        smartshift: {
            on: true;
            threshold: 30;
        };
        
        // HiRes 滚轮设置
        hiresscroll: {
            hires: true;
            invert: false;
            target: false;
        };
        
        // 按钮映射
        buttons: (
            {
                // 手势按钮 (cid: 0xc3)
                cid: 0xc3;
                action = {
                    type: "Gestures";
                    gestures: (
                        {
                            direction: "Up";
                            mode: "OnRelease";
                            action = {
                                type: "Keypress";
                                keys: ["KEY_LEFTMETA", "KEY_F"];
                            };
                        },
                        {
                            direction: "Down";
                            mode: "OnRelease";
                            action = {
                                type: "Keypress";
                                keys: ["KEY_LEFTMETA", "KEY_B"];
                            };
                        },
                        {
                            direction: "Left";
                            mode: "OnRelease";
                            action = {
                                type: "Keypress";
                                keys: ["KEY_LEFTMETA", "KEY_LEFTSHIFT", "KEY_TAB"];
                            };
                        },
                        {
                            direction: "Right";
                            mode: "OnRelease";
                            action = {
                                type: "Keypress";
                                keys: ["KEY_LEFTMETA", "KEY_TAB"];
                            };
                        },
                        {
                            direction: "None";
                            mode: "OnRelease";
                            action = {
                                type: "Keypress";
                                keys: ["KEY_LEFTMETA", "KEY_LEFTSHIFT", "KEY_SPACE"];
                            };
                        }
                    );
                };
            }
        );
    }
);
```

---

## 配置项详解

### 设备对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | 字符串 | 设备名称（必填） |
| `dpi` | 整数 | 鼠标 DPI |
| `buttons` | 数组 | 按钮映射 |
| `smartshift` | 对象 | SmartShift 设置 |
| `hiresscroll` | 对象 | 高分辨率滚动设置 |

### SmartShift 配置

```json
smartshift: {
    on: true;           // 开启/关闭
    threshold: 30;       // 阈值 (1-255)
};
```

### HiRes 滚轮配置

```json
hiresscroll: {
    hires: true;    // 启用高分辨率
    invert: false;  // 反转滚动方向
    target: false;  // 启用 HID++ 通知
};
```

---

## 常用操作类型

### Keypress - 模拟按键

```json
action: {
    type: "Keypress";
    keys: ["KEY_LEFTMETA", "KEY_TAB"];
};
```

### Gestures - 手势

```json
action: {
    type: "Gestures";
    gestures: (
        {
            direction: "Up";
            mode: "OnRelease";
            action = { type: "Keypress"; keys: ["KEY_F5"]; };
        }
    );
};
```

### 手势模式

| 模式 | 说明 |
|------|------|
| `OnRelease` | 释放时触发 |
| `OnThreshold` | 满足阈值后触发 |
| `NoPress` | 不触发任何动作 |

---

## 调试与排错

### 查看设备列表

```bash
xinput --list
```

输出示例：
```
⎡ Virtual core pointer                      id=2    [master pointer  (3)]
⎜ ↳ Logitech MX Master 3                 id=9    [slave  pointer  (2)]
⎣ Virtual core keyboard                   id=3    [master keyboard (2)]
↳ Logitech MX Keys                       id=18   [slave  keyboard (2)]
```

### 测试按钮事件

```bash
# 查看设备 ID
xinput --list

# 测试按钮（假设设备 ID 为 9）
xinput test 9
```

### 启动 logiops（调试模式）

```bash
sudo logid -d
```

### 查看日志

```bash
# 实时查看 logid 日志
journalctl -fu logid
```

---

## 常见问题

### Q: 设备未被识别？

确保设备已通过蓝牙或接收器连接，然后重启 logid：
```bash
sudo systemctl restart logid
```

### Q: 按键映射不生效？

1. 检查配置文件语法
2. 使用 `logid -d` 查看详细日志
3. 确认 cid 值正确

### Q: SmartShift 不工作？

确保在支持 SmartShift 的设备上配置，并正确设置 `threshold` 值。

---

## 相关链接

- [logiops GitHub](https://github.com/PixlOne/logiops)
- [logiops Wiki 配置指南](https://github.com/PixlOne/logiops/wiki/Configuration)
- [Linux Input Event Codes](https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h)

---

> 🖱️ 祝您配置愉快！如果是 MX Master 系列，建议重点研究手势按钮和 SmartShift，可以大幅提升工作效率。
