---
title: "UPower 接口与 Linux 电源管理"
date: 2026-03-04
description: "解读 UPower 的 D-Bus 接口模型与事件机制，帮助你在 Linux 上实现电源状态查询与管理集成。"
categories: ["Linux系统", "系统服务"]
tags: ["Linux", "UPower", "D-Bus", "电源管理"]
---
GNU 自由文档许可证1.1 版

UPower 是枚举电源设备、监听设备事件以及查询历史和统计数据的抽象。`org.freedesktop.UPower`系统上的任何应用程序或服务都可以通过系统消息总线 访问该 服务。

UPower [曾经被称为 DeviceKit-power](http://lists.freedesktop.org/archives/devkit-devel/2009-December/000567.html "曾经被称为 DeviceKit-power")。UPower 旨在使大量 HAL 冗余，因为 HAL 已正式 [弃用](http://lists.freedesktop.org/archives/hal/2008-May/011560.html "弃用")。

UPower 还可用于控制 计算机上 [不同操作的延迟](http://blogs.gnome.org/hughsie/2008/11/06/devicekit-power-latency-control/ "不同操作的延迟")，从而节省大量电量。目前还没有太多使用这个界面，但这是一个经典的鸡和蛋场景，我认为鼓励鸡蛋下鸡很重要。请将任何问题报告给 [Freedesktop](https://bugs.freedesktop.org/enter_bug.cgi?product=upower "Freedesktop") bugzilla 或发送邮件到 [DeviceKit](http://lists.freedesktop.org/mailman/listinfo/devkit-devel "DeviceKit") 邮件列表进行讨论。

## org.freedesktop.UPower

org.freedesktop.UPower — UPower 接口

## 方法

`EnumerateDevices（out 'ao' devices）`

`GetDisplayDevice（out'o'device）`&#x20;

`GetCriticalAction (out 's' action)`

## 信号

`DeviceAdded ('o' device)`&#x20;

`DeviceRemoved ('o' device)`

## 实现的接口

实现 `org.freedesktop.UPower` 的对象也实现了 `org.freedesktop.DBus.Introspectable`、`org.freedesktop.DBus.Properties`

## 属性

'DaemonVersion' 读为 's'&#x20;

'OnBattery' 读为 'b'&#x20;

'LidIsClosed' 读为 'b'&#x20;

“LidIsPresent”读作“b”

## 描述

UPower服务是通过系统消息总线提供的。要访问该服务，请使用D-Bus系统总线服务上的`/org/freedesktop/UPower`对象上的`org.freedesktop.UPower`接口，其名称为`org.freedesktop.UPower`。

```bash
dbus-send --print-reply \
            --system \
            --dest=org.freedesktop.UPower \
            /org/freedesktop/UPower \
            org.freedesktop.UPower.EnumerateDevices

method return sender=:1.386 -> dest=:1.451 reply_serial=2
   array [
      object path "/org/freedesktop/UPower/devices/line_power_AC"
      object path "/org/freedesktop/UPower/devices/battery_BAT0"
   ]$ dbus-send --print-reply \
            --system \
            --dest=org.freedesktop.UPower \
            /org/freedesktop/UPower \
            org.freedesktop.UPower.EnumerateDevices

method return sender=:1.386 -> dest=:1.451 reply_serial=2
   array [
      object path "/org/freedesktop/UPower/devices/line_power_AC"
      object path "/org/freedesktop/UPower/devices/battery_BAT0"
   ]
```

## 细节

### EnumerateDevices ()

`EnumerateDevices(out 'ao' device)`

枚举系统上的所有电源对象。

```text
devices: An array of object paths for devices.
```

***

### GetDisplayDevice ()

`GetDisplayDevice（out 'o' device）`

将对象获取到“显示设备”，这是一个表示要在桌面环境中显示的状态图标的复合设备。您也可以直接访问该对象，因为它的路径保证为 /org/freedesktop/UPower/devices/DisplayDevice。将定义以下标准 org.freedesktop.UPower.Device 属性（仅`IsPresent`具有特殊含义）：

- **Type：**显示设备的类型，UPS 或电池（下面统称为电池）。请注意，与真实设备相比，此值可以更改。
- **State：**显示设备的电源状态，如充电或放电。
- **Percentage：**设备上剩余的能量。
- **Energy：**电池中当前可用的能量（以 Wh 为单位）。
- **EnergyFull：**电池充满时的能量（以 Wh 为单位）。
- **EnergyRate：**从电池中消耗的能量，以 W 为单位。如果为正，则电池正在放电，如果为负，则正在充电。
- **TimeToEmpty：**直到电池被视为空的秒数。
- **TimeToFull：**直到电池被认为已满的秒数。
- **IsPresent：**是否应显示使用此信息的状态图标。
- **IconName：**代表设备状态的图标名称。
- **WarningLevel：**与整体相同`WarningLevel`

| *`device`*： | 显示设备的对象路径。 |
| ----------- | ---------- |

***

### GetCriticalAction ()

GetCriticalAction (out 's' action)

当系统的电源严重不足（电池或 UPS 严重不足）时，系统将采取此操作。可能的值为：

- **HybridSleep:**混合睡眠
- **Hibernate:**休眠
- **PowerOff:**关机

| *`action`*： | 表示已配置且可用的关键操作的字符串。 |
| ----------- | ------------------ |

## 信号详情

### DeviceAdded 信号

DeviceAdded ('o' 设备)

添加设备时发出。

| *`device`*： | 添加的设备的对象路径。 |
| ----------- | ----------- |

***

### DeviceRemoved 信号

DeviceRemoved ('o' 设备)

移除设备时发出。

| *`device`*： | 被移除设备的对象路径。 |
| ----------- | ----------- |

## 属性详情

### “DaemonVersion”属性

`'DaemonVersion'  read      's'`

正在运行的守护进程的版本，例如`002`.

***

### “OnBattery”属性

`'OnBattery'  read      'b'`

指示系统是否使用电池电源运行。此属性是为了方便而提供的。

***

### “LidIsClosed”属性

`'LidIsClosed'  read      'b'`

指示笔记本电脑盖是否关闭，无法看到显示屏。

***

### “LidIsPresent”属性

`'LidIsPresent'  read      'b'`

如果存在笔记本电脑盖装置。

org.freedesktop.UPower.Device

org.freedesktop.UPower.Device — Device interface

## 方法

```纯文本
Refresh()
GetHistory (in 's' type,
               in 'u' timespan,
               in 'u' resolution,
               out 'a(udu)' data)
GetStatistics (in 's' type,
               out 'a(dd)' data)
```

## 实现的接口

实现 org.freedesktop.UPower.Device 的对象也实现了 org.freedesktop.DBus.Introspectable、org.freedesktop.DBus.Properties

## 特性

```纯文本
'NativePath'       read      's'
'Vendor'           read      's'
'Model'            read      's'
'Serial'           read      's'
'UpdateTime'       read      't'
'Type'             read      'u'
'PowerSupply'      read      'b'
'HasHistory'       read      'b'
'HasStatistics'    read      'b'
'Online'           read      'b'
'Energy'           read      'd'
'EnergyEmpty'      read      'd'
'EnergyFull'       read      'd'
'EnergyFullDesign' read      'd'
'EnergyRate'       read      'd'
'Voltage'          read      'd'
'ChargeCycles'     read      'i'
'Luminosity'       read      'd'
'TimeToEmpty'      read      'x'
'TimeToFull'       read      'x'
'Percentage'       read      'd'
'Temperature'      read      'd'
'IsPresent'        read      'b'
'State'            read      'u'
'IsRechargeable'   read      'b'
'Capacity'         read      'd'
'Technology'       read      'u'
'WarningLevel'     read      'u'
'BatteryLevel'     read      'u'
'IconName'         read      's'
```

## 描述

实现此接口的对象通常是通过使用`EnumerateDevices`方法在D-Bus系统总线服务上的`/org/freedesktop/UPower`对象上的`org.freedesktop.UPower`接口发现的。

```bash
$ dbus-send --print-reply \
            --system \
            --dest=org.freedesktop.UPower \
            /org/freedesktop/UPower/devices/battery_BAT0 \
            org.freedesktop.DBus.Properties.GetAll \
            string:org.freedesktop.UPower.Device

method return sender=:1.386 -> dest=:1.477 reply_serial=2
   array [
      dict entry(
         string "native-path"
         variant             string "/sys/devices/LNXSYSTM:00/device:00/PNP0A08:00/device:01/PNP0C09:00/PNP0C0A:00/power_supply/BAT0"
      )
      dict entry(
         string "vendor"
         variant             string "SONY"
      )
      dict entry(
         string "model"
         variant             string "42T4568"
      )
      dict entry(
         string "serial"
         variant             string "4179"
      )
      dict entry(
         string "update-time"
         variant             uint64 1226417875
      )
      dict entry(
         string "type"
         variant             uint 2
      )
      dict entry(
         string "power-supply"
         variant             boolean true
      )
      dict entry(
         string "has-history"
         variant             boolean true
      )
      dict entry(
         string "has-statistics"
         variant             boolean true
      )
      dict entry(
         string "online"
         variant             boolean false
      )
      dict entry(
         string "energy"
         variant             double 72.85
      )
      dict entry(
         string "energy-empty"
         variant             double 0
      )
      dict entry(
         string "energy-full"
         variant             double 74.55
      )
      dict entry(
         string "energy-full-design"
         variant             double 74.88
      )
      dict entry(
         string "energy-rate"
         variant             double 0
      )
      dict entry(
         string "voltage"
         variant             double 16.415
      )
      dict entry(
         string "time-to-empty"
         variant             int64 0
      )
      dict entry(
         string "time-to-full"
         variant             int64 0
      )
      dict entry(
         string "percentage"
         variant             double 97.7197
      )
      dict entry(
         string "is-present"
         variant             boolean true
      )
      dict entry(
         string "state"
         variant             uint 3
      )
      dict entry(
         string "is-rechargeable"
         variant             boolean true
      )
      dict entry(
         string "capacity"
         variant             double 100
      )
      dict entry(
         string "technology"
         variant             uint 1
      )
   ]
```

除非另有说明，否则此接口上的属性中的空字符串或值0表示未设置。

## 细节

### Refresh ()

Refresh ()
刷新从电源收集的数据。

#### Errors

| *`org.freedesktop.UPower.Device.GeneralError`*: | if an error occured while refreshing |
| ----------------------------------------------- | ------------------------------------ |

#### Permissions&#xA;

调用者将需要确保守护程序是在调试模式下启动的

***

### GetHistory ()                //deepin不支持

GetHistory (in  's'      type,

in  'u'      timespan,

in  'u'      resolution,

out 'a(udu)' data)
获取在重新引导期间持续存在的电源设备的历史记录。

|                 |                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *`type`*:       | history的类型。有效类型是`rateor`或者 `charge`。                                                                                                                                                                                      |
| *`timespan`*:   | 以秒为单位返回的数据量，或者全部为 0                                                                                                                                                                                                       |
| *`resolution`*: | 要返回的近似点数。更高的分辨率更准确，但以牺牲绘图速度为代价                                                                                                                                                                                            |
| *`data`*:       | 电源设备的历史数据（如果设备支持历史）。数据从最早的时间到最新的数据点进行排序。每个元素包含以下成员：&#xA;&#xA;**\*   time:** 以秒为单位的时间值，从 `gettimeofday()` 方法获取&#xA;\*   **value:** 数据值, 比如以W为单位的增长速率或者以百分比为单位的充电百分比&#xA;\*   **state:** 设备的状态，例如`charging`或` discharging`。 |

***

### GetStatistics ()        //deepin不支持

`GetStatistics (in  's'   type, out 'a(dd)' data)`
获取功率设备的统计信息，这些统计信息可能会在会话中的图形界面上显示。

|           |                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------- |
| *`type`*: | 统计模式。有效类型是 `charging` 或者 `discharging`.                                                            |
| *`data`*: | 电源设备的统计数据。每个元素包含以下成员：&#xA;&#xA;\*   **value:** 百分比的值，通常以秒为单位&#xA;\*   **accuracy:** 预测的准确性，以百分比表示。 |

## 属性详情

### The "NativePath" property

'NativePath'  read      's'

操作系统特定的电源本机路径。在 Linux 上，这是 sysfs 路径，例如`/sys/devices/LNXSYSTM:00/device:00/PNP0C0A:00/power_supply/BAT0`. 如果设备由用户空间驱动程序驱动，则为空白。

***

### The "Vendor" property

'Vendor'  read      's'
电池供应商的名称。

***

### The "Model" property

'Model'  read      's'
这种电池型号的名称。

***

### The "Serial" property

'Serial'  read      's'

电池的唯一序列号。

***

### The "UpdateTime" property

'UpdateTime'  read      't'
从电源读取数据的时间点 (从世界协调时1970年1月1日开始的0:00秒)。（本质还是unix时间戳）

***

### The "Type" property

'Type'  read      'u'

电源类型

- **0:** Unknown
- **1:** 线路电源
- **2:** 电池
- **3:** Ups不间断电源
- **4:** 监控
- **5:** 鼠标
- **6:** 键盘
- **7:** 掌上电脑
- **8:** 手机

`power-supply` 如果该值设置为“电池”，则在将其视为笔记本电脑电池之前 ，您需要验证该属性的值是否为“真”。否则，它很可能是未知类型设备的电池。

***

### The "PowerSupply" property

'PowerSupply'  read      'b'

如果电源设备用于为系统供电。对于笔记本电脑电池和 UPS 设备，这将设置为 TRUE，但对于无线鼠标或掌上电脑设置为 FALSE。

***

### The "HasHistory" property

'HasHistory'  read      'b'
如果电源设备有历史记录。

***

### The "HasStatistics" property

'HasStatistics'  read      'b'
如果电源设备具有统计信息。

***

### The "Online" property

'Online'  read      'b'
当前是否通过线路电源提供电源。仅当属性类型具有值 “line-power” 时，此属性才有效。

***

### The "Energy" property

'Energy'  read      'd'e.
电源中当前可用的能量 (以Wh为单位)。

This property is only valid if the property `type` has the value "battery".
仅当`type`属性类型具有值 “battery” 时，此属性才有效

***

### The "EnergyEmpty" property

'EnergyEmpty'  read      'd'
当电源被认为是空的时，电源中的能量 (以Wh为单位)。

仅当`type`属性类型具有值 “battery” 时，此属性才有效

***

### The "EnergyFull" property

'EnergyFull'  read      'd'
当电源被认为充满时，电源中的能量 (以Wh为单位)。
仅当`type`属性类型具有值 “battery” 时，此属性才有效。

***

### The "EnergyFullDesign" property

'EnergyFullDesign'  read      'd'
电池设计的最大容量，以Wh作为单位。

仅当`type`属性类型具有值 “battery” 时，此属性才有效。

***

### The "EnergyRate" property

'EnergyRate'  read      'd'
电源消耗的能量，以W为单位。如果是正数，电源正在放电，如果是负数，电源正在充电。

仅当`type`属性类型具有值 “battery” 时，此属性才有效

***

### The "Voltage" property

'Voltage'  read      'd'

Voltage in the Cell or being recorded by the meter.
电池中的电压或被仪表记录的值。

***

### The "ChargeCycles" property

'ChargeCycles'  read      'i'
TCO认证定义的充电周期数，如果该值未知或不适用，则为-1。

***

### The "Luminosity" property

'Luminosity'  read      'd'
仪表记录的光度（我也不能理解光度是什么意思，大概也许可能是屏幕亮度或者环境亮度？使用d-feet软件也无法获取其值）。

***

### The "TimeToEmpty" property

'TimeToEmpty'  read      'x'
直到电源被认为是空的秒数。如果未知，则设置为0。

仅当`type`属性类型具有值 “battery” 时，此属性才有效

***

### The "TimeToFull" property

'TimeToFull'  read      'x'
电池充电达到被认为充满所需的秒数。如果未知，则设置为0。

仅当`type`属性类型具有值 “battery” 时，此属性才有效

***

### The "Percentage" property

'Percentage'  read      'd'
功率源中剩余的能量表示为0和100之间的百分比。通常这与 (`energy` - `energy-empty`) / (`energy-full` - `energy-empty`)相同。但是，某些原始电源只能报告百分比，在这种情况下，在设置此属性时，将取消设置energy-\* 属性。

仅当`type`属性类型具有值 “battery” 时，此属性才有效
如果`battery level`被设置为无以外的东西，百分比将是一个近似值。百分比的保留是出于兼容性的考虑。

***

### The "Temperature" property

'Temperature'  read      'd'
设备的温度，以摄氏度为单位。

仅当`type`属性类型具有值 “battery” 时，此属性才有效

***

### The "IsPresent" property

'IsPresent'  read      'b'
如果电源存在于托架中。这个字段是必须的，因为某些电池是可热拆卸（热插拔）的，例如昂贵的UPS和大多数笔记本电脑电池。

仅当`type`属性类型具有值 “battery” 时，此属性才有效

***

### The "State" property

'State'  read      'u'

电池电量状态

- **0:** 未知
- **1:** 充电
- **2:** 未充电
- **3:** 空
- **4:** 充满电
- **5:** 待充电
- **6:** 待放电

仅当`type`属性类型具有值 “battery” 时，此属性才有效

***

### The "IsRechargeable" property

'IsRechargeable'  read      'b'
如果电源是可充电的。

仅当`type`属性类型具有值 “battery” 时，此属性才有效

***

### The "Capacity" property

'Capacity'  read      'd'
电源的容量表示为0和100之间的百分比。电池的容量会随着使用的增长而减少。小于75% 的容量值通常表示您应该更新电池。通常，此值与 (`full-design` / `full`) \* 100相同。但是，某些原始电源无法报告容量，在这种情况下，容量属性将被取消。

仅当`type`属性类型具有值 “battery” 时，此属性才有效

***

### The "Technology" property

'Technology'  read      'u'

电池使用的技术

- **0:** 未知
- **1:** 锂离子
- **2:** 锂聚合物电池
- **3:** 磷酸铁锂电池
- **4:** 铅酸电池
- **5:** 镍铬电池
- **6:** 镍氢电池

仅当`type`属性类型具有值 “battery” 时，此属性才有效

***

### The "WarningLevel" property

'WarningLevel'  read      'u'

电池警告级别:

- **0:** 未知
- **1:** 无
- **2:** 放电（仅适用于UPS不间断电源）
- **3:** 低
- **4:** 临界
- **5:** Action

***

### The "BatteryLevel" property

'BatteryLevel'  read      'u'
不报告百分比而是报告粗略电池电量的设备的电池电量。如果该值为None，则该设备不支持粗略的电池报告，应改用百分比。

- t
- **0:** 未知
- **1:** 无（电池不使用粗略级别的电池报告）
- **3:** 低
- **4:** 临界
- **6:** 正常
- **7:** 高
- **8:** 满

***

### The "IconName" property

'IconName'  read      's'
图标名称，遵循图标命名规范请注意，相对于剩余或感知到的剩余电量，图标在呈现方面可能与最终用户的期望不匹配。建议前端首先使用BatteryLevel属性 (如果可用)，然后使用百分比，以向用户呈现更真实的电池电量。

org.freedesktop.UPower.KbdBacklight

org.freedesktop.UPower.KbdBacklight — 键盘背光控制接口

> 一些不受支持的厂商键盘，即使存在背光也没有这个接口

## 方法

GetMaxBrightness (out 'i' value)
GetBrightness    (out 'i' value)
SetBrightness    (in  'i' value)

## 信号

BrightnessChanged           ('i' value)

BrightnessChangedWithSource ('i' value,

's' source)

## 已实现的接口

实现 `org.freedesktop.UPower.KbdBacklight `的对象也实现了 `org.freedesktop.DBus.Introspectable`、`org.freedesktop.DBus.Properties`

## 描述

`org.freedesktop.UPower.KbdBacklight` 是 UPower 实现的 DBus 接口。它允许控制键盘背光（如果存在）。

## 细节

### GetMaxBrightness ()

GetMaxBrightness (out 'i' value)

获取键盘背光的最大亮度级别。

| *`value`*: | 键盘背光亮度的最大值。 |
| ---------- | ----------- |

#### Errors

| *`org.freedesktop.UPower.GeneralError`*: | 如果在获得最大亮度时发生错误 |
| ---------------------------------------- | -------------- |

***

### GetBrightness ()

GetBrightness (out 'i' value)

获取键盘背光的亮度级别。

| *`value`*: | 键盘背光的亮度级别。 |
| ---------- | ---------- |

#### Errors

| *`org.freedesktop.UPower.GeneralError`*: | 如果在设置亮度时发生错误 |
| ---------------------------------------- | ------------ |

***

### SetBrightness ()

SetBrightness (in  'i' value)

设置键盘背光的亮度级别。

| *`value`*: | 键盘背光的新亮度值 |
| ---------- | --------- |

#### Errors

| *`org.freedesktop.UPower.GeneralError`*: | 如果在设置亮度时发生错误 |
| ---------------------------------------- | ------------ |

## Signal Details

### The BrightnessChanged signal

BrightnessChanged ('i' value)

键盘背光亮度级别已更改。

| *`value`*: | 键盘背光的新亮度值 |
| ---------- | --------- |

***

### The BrightnessChangedWithSource signal

BrightnessChangedWithSource ('i' value,

's' source)

键盘背光亮度级别已更改，包括有关更改来源的信息

| *`value`*:  | 键盘背光的新亮度值。                                                                   |
| ----------- | ---------------------------------------------------------------------------- |
| *`source`*: | 键盘背光亮度变化的来源，如果调用了 SetBrightness，则为“外部”，如果硬件本身更改了键盘亮度（自动或通过按下固件处理的热键），则为“内部”。 |
