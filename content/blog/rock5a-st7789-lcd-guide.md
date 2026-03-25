---
title: "ROCK 5A 驱动 ST7789 横屏（320×240）完全指南"
date: 2026-03-25
description: "详细记录在 ROCK 5A 上通过 Python + spidev 驱动 ST7789 屏幕（横屏 320×240）的完整过程，解析 MADCTL 旋转原理和地址窗口设置踩坑经验"
categories: ["硬件", "单片机"]
tags: ["ROCK 5A", "ST7789", "SPI", "LCD", "嵌入式", "教程"]
---

## 背景

ST7789 是一款常见的液晶控制芯片，最大分辨率 240×320。这块屏幕原生是竖屏（240 宽 × 320 高），通过 MADCTL 寄存器旋转后可以配置为横屏（320 宽 × 240 高）。

在 ROCK 5A 上用 Python + spidev 调试时，遇到了 X 坐标超过 240 后画面"折回"到左侧的问题——根本原因是横屏旋转后显存地址窗口没有正确设置。

<!--more-->

## 硬件连接

| 功能 | GPIO | 物理引脚 | 说明 |
|------|------|----------|------|
| MOSI | SPI4_MOSI | Pin 19 | SPI 数据线 |
| CLK | SPI4_CLK | Pin 23 | SPI 时钟线 |
| CS | GPIO40 | Pin 18 | 软件控制片选 |
| DC | GPIO37 | Pin 16 | 数据/命令切换 |
| RST | GPIO45 | Pin 22 | 复位信号（低有效）|
| BLK | GPIO24 | Pin 28 | 背光控制（拉高即亮）|

## SPI 配置

- 总线：SPI4，设备 0
- 模式：0（CPOL=0, CPHA=0）
- 速率：1 MHz
- 颜色格式：RGB565（16 位，每像素 2 字节）

## ST7789 核心寄存器解析

### 1. MADCTL (0x36) — 控制显示方向和颜色顺序

这是最关键的寄存器。MX、MY、MV 三个位控制方向：

| Bit | 名称 | 作用 |
|-----|------|------|
| MX | 列地址反转 | MX=1 时列从右往左 |
| MY | 行地址反转 | MY=1 时行从下往上 |
| MV | 行/列交换 | MV=1 时行列互换（旋转的关键位）|
| RGB | 颜色顺序 | 0=RGB，1=BGR |

**横屏配置：MADCTL = 0x60**

```
0x60 = 01100000b
     = MY=0, MX=1, MV=1, ML=0, MH=0, RGB=0
```

MV=1（行/列交换）+ MX=1（列镜像），将原生 240×320 旋转为 320×240 横屏。

**四种旋转方向对照：**

| MADCTL | 效果 | 宽×高 |
|--------|------|--------|
| 0x00 | 竖屏（正常方向）| 240×320 |
| 0x60 | 横屏（顺时针 90°，MV+MX）| 320×240 |
| 0xC0 | 竖屏（上下颠倒）| 240×320 |
| 0xA0 | 横屏（逆时针 90°，MV+MY）| 320×240 |

### 2. COLMOD (0x3A) — 颜色格式

| 值 | 格式 | 说明 |
|----|------|------|
| 0x55 | RGB565 | 16 位，65K 颜色（最常用）|

RGB565 每个像素 2 字节，格式为：

```
RRRRRGGGGGGBBBBB
```

### 3. CASET / RASET / RAMWR — 地址窗口

- **CASET**：设置列地址范围 `[XS, XE]`
- **RASET**：设置行地址范围 `[YS, YE]`
- **RAMWR**：写入显存

横屏旋转后（320×240）：
- 列：0 - 319
- 行：0 - 239

## 初始化序列

```python
def init():
    # 1. 硬件复位
    gpio_write(GPIO_RST, 0)
    time.sleep(0.01)
    gpio_write(GPIO_RST, 1)
    time.sleep(0.120)

    # 2. 软件复位
    write_cmd(0x01)
    time.sleep(0.2)

    # 3. 退出睡眠
    write_cmd(0x11)
    time.sleep(0.12)

    # 4. 设置横屏（关键！）
    write_cmd(0x36)  # MADCTL
    write_data(0x60)  # MV + MX = 横屏

    # 5. 设置颜色格式 RGB565
    write_cmd(0x3A)  # COLMOD
    write_data(0x55)

    # 6. 开启显示
    write_cmd(0x29)  # DISPON
```

## 地址窗口设置（踩坑最多的一步）

每次画图前都要重新设置地址窗口，**坐标必须用高字节+低字节格式发送**：

```python
def write_addr(x, y, w, h):
    x2, y2 = x + w - 1, y + h - 1

    # CASET: 列地址窗口
    write_cmd(0x2A)
    write_data([(x  >> 8) & 0xFF,  x & 0xFF,
                (x2 >> 8) & 0xFF, x2 & 0xFF])

    # RASET: 行地址窗口
    write_cmd(0x2B)
    write_data([(y  >> 8) & 0xFF,  y & 0xFF,
                (y2 >> 8) & 0xFF, y2 & 0xFF])

    write_cmd(0x2C)  # RAMWR
```

## RGB565 颜色速查

| 颜色 | 高字节 | 低字节 |
|------|--------|--------|
| 黑色 | 0x00 | 0x00 |
| 白色 | 0xFF | 0xFF |
| 红色 | 0xF8 | 0x00 |
| 绿色 | 0x07 | 0xE0 |
| 蓝色 | 0x00 | 0x1F |
| 黄色 | 0xFF | 0xE0 |

## 完整测试代码

```python
#!/usr/bin/env python3
import spidev
import time

GPIO_RST = 45
GPIO_DC  = 37
GPIO_BLK  = 24
GPIO_CS   = 40

def gpio_write(pin, value):
    with open(f'/sys/class/gpio/gpio{pin}/value', 'w') as f:
        f.write('1' if value else '0')

def cs_low():   gpio_write(GPIO_CS, 0)
def cs_high():  gpio_write(GPIO_CS, 1)

def write_cmd(cmd):
    cs_low()
    gpio_write(GPIO_DC, 0)
    spi.xfer([cmd])
    cs_high()

def write_data(data):
    if isinstance(data, int):
        data = [data]
    cs_low()
    gpio_write(GPIO_DC, 1)
    spi.xfer(data)
    cs_high()

def write_addr(x, y, w, h):
    x2, y2 = x + w - 1, y + h - 1
    write_cmd(0x2A)
    write_data([(x >> 8) & 0xFF,  x & 0xFF,
                (x2 >> 8) & 0xFF, x2 & 0xFF])
    write_cmd(0x2B)
    write_data([(y >> 8) & 0xFF,  y & 0xFF,
                (y2 >> 8) & 0xFF, y2 & 0xFF])
    write_cmd(0x2C)

def init():
    gpio_write(GPIO_RST, 0)
    time.sleep(0.01)
    gpio_write(GPIO_RST, 1)
    time.sleep(0.120)
    write_cmd(0x01)
    time.sleep(0.2)
    write_cmd(0x11)
    time.sleep(0.12)
    write_cmd(0x36)
    write_data(0x60)
    write_cmd(0x3A)
    write_data(0x55)
    write_cmd(0x29)

def clear_screen():
    write_addr(0, 0, 320, 240)
    cs_low()
    gpio_write(GPIO_DC, 1)
    for _ in range(320 * 240):
        spi.xfer([0x00, 0x00])
    cs_high()

def draw_rect(x, y, w, h, color):
    write_addr(x, y, w, h)
    cs_low()
    gpio_write(GPIO_DC, 1)
    for _ in range(w * h):
        spi.xfer(color)
    cs_high()

spi = spidev.SpiDev()
spi.open(4, 0)
spi.max_speed_hz = 1_000_000
spi.mode = 0

init()
gpio_write(GPIO_BLK, 1)
clear_screen()

# 测试：右上角蓝色方块
draw_rect(300, 0, 20, 20, [0x00, 0x1F])

spi.close()
```

## 踩坑总结

### 1. 坐标回绕到左侧 → CASET 高低位字节未拆分

X > 240 时，像素出现在左侧。严格按 `(x >> 8) & 0xFF`, `x & 0xFF` 格式发送。

### 2. 复位后白屏/花屏 → 复位时序不对

复位脉冲 ≥10ms，复位后等待 ≥120ms 再发命令。

### 3. 横屏方向不对 → MADCTL 数值错误

记住 `0x60` = 横屏，`0x00` = 竖屏。

### 4. 颜色错乱 → RGB/BGR 顺序

尝试 MADCTL 加/减 0x08 调整颜色字节序。

## 参考资料

- ST7789 数据手册
- [ST7789 MicroPython 驱动（GitHub）](https://github.com/russhughes/st7789_mpy)
- [cnblogs: 树莓派Pico + MicroPython驱动2.4寸SPI串口屏](https://www.cnblogs.com/21207-iHome/p/16062769.html)

---

*测试环境：ROCK 5A + Python 3 + spidev*
