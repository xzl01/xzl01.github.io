---
title: "Linux 输入设备键码与 Logitech MX Master 配置指南"
date: 2026-03-02
description: "Linux input event codes 与 Logitech MX Master 2S 配置教程"
tags: ["Linux", "Logitech", "键码", "配置", "鼠标"]
---

## 简介

本文档包含 Linux 输入设备键码定义以及 Logitech MX Master 2S 鼠标的 logiops 配置教程。

---

## 第一部分：Linux 输入事件码

### 键盘键码 (KEY_*)

| 键码 | 定义 | 说明 |
|------|------|------|
| `0x01` | KEY_ESC | ESC 键 |
| `0x02-0x0C` | KEY_1 - KEY_0 | 数字键 |
| `0x10` | KEY_Q | Q 键 |
| ... | ... | 更多请查看源码 |

### 鼠标/触控按钮 (BTN_*)

| 键码 | 定义 | 说明 |
|------|------|------|
| `0x110` | BTN_LEFT | 鼠标左键 |
| `0x111` | BTN_RIGHT | 鼠标右键 |
| `0x112` | BTN_MIDDLE | 鼠标中键 |
| `0x113` | BTN_SIDE | 侧边按钮 |
| `0x114` | BTN_EXTRA | 额外按钮 |
| `0x115` | BTN_FORWARD | 前进按钮 |
| `0x116` | BTN_BACK | 后退按钮 |

### 绝对坐标轴 (ABS_*)

| 键码 | 定义 | 说明 |
|------|------|------|
| `0x00` | ABS_X | X 坐标 |
| `0x01` | ABS_Y | Y 坐标 |
| `0x18` | ABS_PRESSURE | 压力 |
| `0x35` | ABS_MT_POSITION_X | 多点触控 X |
| `0x36` | ABS_MT_POSITION_Y | 多点触控 Y |

### 系统控制键 (KEY_* 系统功能)

| 键码 | 定义 | 功能 |
|------|------|------|
| `0x100` | KEY_POWER | 电源 |
| `0x6E` | KEY_DISPLAY_TOOGLE | 显示开关 |
| `0x6F` | KEY_SLEEP | 睡眠 |
| `0xE2` | KEY_MUTE | 静音 |
| `0xE5` | KEY_PLAYPAUSE | 播放/暂停 |
| `0xE6` | KEY_NEXTSONG | 下一曲 |
| `0xE7` | KEY_VOLUMEUP | 音量+ |
| `0xE8` | KEY_VOLUMEDOWN | 音量- |

> 📖 完整键码列表请参考：[linux/input-event-codes.h](https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h)

---

## 第二部分：Logitech MX Master 配置

### 安装 logiops

```bash
sudo apt install logiops
# 或从源码编译
git clone https://github.com/PixlOne/logiops.git
cd logiops
cmake .
make
sudo make install
```

### 配置文件位置

- 默认配置：`/etc/logid.cfg`
- 自定义配置：`~/.config/logid.cfg` 或使用 `-c` 参数

### 配置示例

```json
devices: (
    {
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

### 常用 cid 值 (MX Master 系列)

| 按钮 | cid 值 |
|------|--------|
| 滚轮按下 | 0xc4 |
| 手势按钮 | 0xc3 |
| 中键 | 0xc0 |
| 前进 | 0x53 |
| 后退 | 0x56 |

### 调试命令

```bash
# 查看设备列表
xinpt --list

# 测试按钮事件
xinput test-xi2 --root <设备ID>

# 启动 logiops (调试模式)
sudo logid -d
```

---

## 参考资料

- [linux/input-event-codes.h](https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h)
- [logiops Wiki](https://github.com/PixlOne/logiops/wiki)
- [Logitech MX Master 2S 产品页面](https://www.logitech.com.cn/zh-cn/products/masters/mx-master-2s.html)
