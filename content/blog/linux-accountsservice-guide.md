---
title: "AccountsService 接口说明"
date: 2026-03-04
description: "整理 AccountsService 常见接口语义与调用方式，帮助理解 Linux 用户信息缓存与会话相关能力。"
categories: ["Linux系统", "系统服务"]
tags: ["Linux", "AccountsService", "D-Bus"]
---
## CacheUser ()

CacheUser (in  's' name, out 'o' user)
缓存一个用户帐户，以便它显示在ListCachedUsers() 输出中。用户名可以是远程用户，但是系统必须能够查找用户名并解析用户信息。

传入参数*`name`*:用户的用户名

返回参数*`user`*:用户对象的路径

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.UserDoesNotExist`*:
如果用户名无法解析(含有非法字符）

### 权限

调用者需要有 `org.freedesktop.accounts.user-administration` PolicyKit 权限.

## CreateUser ()

CreateUser (in  's' name,

in  's' fullname,

out 'o' user,

in  'i' accountType)

创建一个新的用户账户
accountType参数可以采用以下值:

- **0:** 普通用户
- **1:** 管理员

*`name`*:

新用户的用户名

*`fullname`*:

新用户的真实姓名（全名）

*`user`*:

新用户的对象路径

*`accountType`*:

用户类型

### Errors

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### Permissions

The caller needs the org.freedesktop.accounts.user-administration PolicyKit authorization.

## DeleteUser ()

DeleteUser (in  'x' id,

in  'b' removeFiles)
删除用户帐户。

*`id`*:

The uid to delete

*`removeFiles`*:

Whether to remove the users files

### Errors

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### Permissions

调用者需要 `org.freedesktop.accounts.user-administration` PolicyKit 权限.

***

### FindUserById ()

FindUserById (in  'x' id,

out 'o' user)

Finds a user by uid.

*`id`*:

The uid to look up

*`user`*:

Object path of user

### Errors

*`org.freedesktop.Accounts.Error.Failed`*:

if no user with the given uid exists

***

### FindUserByName ()

FindUserByName (in  's' name,

out 'o' user)

Finds a user by its username.

*`name`*:

The username to look up

*`user`*:

Object path of user

### Errors

*`org.freedesktop.Accounts.Error.Failed`*:

if no user with the given username exists

***

### ListCachedUsers ()

ListCachedUsers (out 'ao' users)
列出以前在本地登录系统的用户。这并不意味着返回所有用户的详尽列表。`FindUserByName()` 可能会返回不在列表中的用户。

*`users`*:以前在本地登录系统的用户对象路径

***

### UncacheUser ()

UncacheUser (in  's' name)
释放有关用户帐户的所有元数据，包括图标，语言和会话。如果用户帐户来自远程服务器，并且用户以前从未登录过，则该帐户将不再显示在ListCachedUsers() 输出中。

*`name`*:用户的用户名

### Errors

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

if the caller lacks the appropriate PolicyKit authorization

*`org.freedesktop.Accounts.Error.UserDoesNotExist`*:

if the user name cannot be resolved

### Permissions

The caller needs the org.freedesktop.accounts.user-administration PolicyKit authorization.

***

### The "DaemonVersion" property

'DaemonVersion'  read      's'
正在运行的守护程序的版本。

### ~~The "HasNoUsers" property~~

'HasNoUsers'  read      'b'
系统是否没有用户

### ~~The "HasMultipleUsers" property~~

'HasMultipleUsers'  read      'b'
系统是否有多个用户

### ~~The "AutomaticLoginUsers" property~~

'AutomaticLoginUsers'  read      'ao'
用户自动登录为

***

### The UserAdded signal

UserAdded ('o' user)
添加用户时发出。

*`user`*:

用户对象路径，当他们被添加前

### The UserDeleted signal

UserDeleted ('o' user)
删除用户时发出。

*`user`*:

Object path of the user that was deleted.

## GetPasswordExpirationPolicy ()

`GetPasswordExpirationPolicy ()`

用于获取用户账户密码设置有关信息

*`expiration_time`*:out 'x' 过期时间

*`last_change_time`*:out 'x' 下一次改变时间,

*`min_days_between_changes`*:out 'x' 账户密码最小改变间隔天数,

*`max_days_between_changes`*:out 'x' 账户密码最大改变间隔天数,

*`days_to_warn`*:out 'x' 账户密码改变警告天数,

*`days_after_expiration_until_lock`*:out 'x' 过期后直到锁定的天数

## SetAccountType ()

SetAccountType (in  'i' accountType)
更改用户的帐户类型。

*`accountType`*:
新帐户类型，编码为整数:

- **0:** 标准用户
- **1:** 管理员

#### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:如果操作失败

#### 权限

调用者需要以下PolicyKit授权之一:

- **org.freedesktop.accounts.user-administration:** 改变账户类型

## SetAutomaticLogin()

SetAutomaticLogin (in  'b' enabled)
为用户启用或禁用自动登录。

请注意，通常只有一个用户可以启用自动登录，因此为用户打开它将为先前配置的自动登录用户将被禁用。

传入参数*`enabled`*:是否为该用户启用自动登录。

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:
如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一:

- **org.freedesktop.accounts.set-login-option:** 改变登录屏幕设置

## SetEmail ()

SetEmail (in  's' email)

设置用户邮件地址
请注意，在AccountsService中设置电子邮件地址与配置邮件客户端不同。不过，邮件客户端可能默认为此处配置的电子邮件地址。

参数*`email`*:新的电子邮件地址.

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:
如果调用者者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一:

- **org.freedesktop.accounts.change-own-user-data:** 改变自己的邮件地址
- **org.freedesktop.accounts.user-administration:** 为其他用户改变邮件地址

## SetHomeDirectory ()

SetHomeDirectory (in  's' homedir)

设置用户home目录
请注意，更改用户的主目录将所有内容从旧位置移至新位置，这可能是一项**代价昂贵的操作**。

参数*`homedir`*:新的homedir作为绝对路径。

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:
如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一:

- **org.freedesktop.accounts.user-administration:** 为用户改变home目录

## SetIconFile ()

SetIconFile (in  's' filename)

改变用户头像（icon）

*`filename`*:
用作用户图标的png文件的绝对文件名（绝对路径+文件名）。

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一

- **org.freedesktop.accounts.change-own-user-data:** 改变自己的头像
- **org.freedesktop.accounts.user-administration:** 改变其他用户的头像

## SetLanguage ()

SetLanguage (in  's' language)

设置用户语言
期望显示管理器将使用此区域设置启动用户的会话。

参数：*`language`*:新语言，如 “`de_DE.UTF-8`” 之类的语言环境规范。

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一:

- **org.freedesktop.accounts.change-own-user-data:** 改变用户自己的语言
- **org.freedesktop.accounts.user-administration:**改变其他用户的语言

## SetXSession ()

SetXSession (in  's' x\_session)

Sets the userʼs x session.
期望显示管理器将用户登录到此指定的会话 (如果可用)。**请注意，此调用已被弃用**，并且已被SetSession取代，因为并非所有图形会话都将X用作显示服务器。

*`x_session`*:要开始的新xsession (例如 “gnome”)

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

操作失败

### 权限

调用者需要以下PolicyKit授权之一：

- **org.freedesktop.accounts.change-own-user-data:** 改变本用户的数据文件
- **org.freedesktop.accounts.user-administration:** 以管理员身份改变其他用户数据文件

## ~~SetSession ()~~

SetSession (in  's' session)

设置用户的wayland或x会话。期望显示管理器将用户登录到此指定的会话 (如果可用)。

*`session`*:
要开始的新会话 (例如 “gnome-xorg”)

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一：

- **org.freedesktop.accounts.change-own-user-data:** 改变本用户的数据文件
- **org.freedesktop.accounts.user-administration:** 以管理员身份改变其他用户数据文件

## SetSessionType ()

SetSessionType (in  's' session\_type)
设置用户会话的会话类型。
显示管理器可以使用此属性来决定在加载会话时使用哪种类型的显示服务器

*`session_type`*:
要开始的新会话的类型 (例如 “wayland” 或 “x11”)

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一：

- **org.freedesktop.accounts.change-own-user-data:** 改变本用户的数据文件
- **org.freedesktop.accounts.user-administration:** 以管理员身份改变其他用户数据文件

## SetLocation ()

SetLocation (in  's' location)

改变用户位置

*`location`*:新位置是一个自由格式字符串。

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一：

- **org.freedesktop.accounts.change-own-user-data:** 改变本用户的位置
- **org.freedesktop.accounts.user-administration:** 以管理员身份改变其他用户的位置

## SetRealName ()

SetRealName (in  's' name)

Sets the userʼs real name.

*`name`*:新姓名，通常形式为 “Firstname Lastname”。

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一：

- **org.freedesktop.accounts.change-own-user-data:** 改变用户自己的姓名
- **org.freedesktop.accounts.user-administration:** 以管理员身份改变其他用户姓名

## SetShell ()

SetShell (in  's' shell)

设置用户的登录shell
请注意，将shell设置为不允许的程序可能会阻止用户登录。

*`shell`*:新的用户shell（例如："/bin/bash"）

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一:

- **org.freedesktop.accounts.user-administration:** 改变用户的shell

## SetUserName ()

SetUserName (in  's' name)
设置用户的用户名。请注意，通常不允许有多个用户使用相同的用户名。

*`name`*:新用户名

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一:

- **org.freedesktop.accounts.user-administration:** To change the username of any user

## SetLocked ()

SetLocked (in  'b' locked)
锁定或解锁用户的帐户。锁定帐户会阻止用户登录。

*`locked`*:布尔值，是锁定还是解锁用户的帐户。

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

调用者需要以下PolicyKit授权之一：

- **org.freedesktop.accounts.user-administration:** To lock or unlock user accounts

## SetPasswordMode ()

SetPasswordMode (in  'i' mode)

Changes the userʼs password mode.

Note that changing the password mode has the side-effect of unlocking the account.

*`mode`*:

The new password mode, encoded as an integer:

- **0:** Regular password
- **1:** Password must be set at next login
- **2:** No password

### Errors

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

if the operation failed

### 权限

调用者需要以下PolicyKit授权之一：

- **org.freedesktop.accounts.user-administration:** To change a userʼs password mode

## SetPassword ()

SetPassword (in  's' password,

in  's' hint)

为此用户设置密码，**请注意，设置密码具有解锁帐户的副作用。**

*`password`*:加密密码。

*`hint`*:密码提示。

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

if the operation failed

### Permissions

调用者需要以下PolicyKit授权之一：

- **org.freedesktop.accounts.user-administration:** To change the password of a user

## SetPasswordHint ()

SetPasswordHint (in  's' hint)
设置用户的密码提示。

*`hint`*:

The password hint.

### 错误

*`org.freedesktop.Accounts.Error.PermissionDenied`*:

如果调用者缺乏适当的PolicyKit授权

*`org.freedesktop.Accounts.Error.Failed`*:

如果操作失败

### 权限

The caller needs one of the following PolicyKit authorizations:

- **org.freedesktop.accounts.change-own-user-data:** To change their own language
- **org.freedesktop.accounts.user-administration:** To change the language of another user

## SetPasswordExpirationPolicy ()

SetPasswordExpirationPolicy (in  'x' min\_days\_between\_changes,

in  'x' max\_days\_between\_changes,

in  'x' days\_to\_warn,

in  'x' days\_after\_expiration\_until\_lock)

*`min_days_between_changes`*:

*`max_days_between_changes`*:

*`days_to_warn`*:

*`days_after_expiration_until_lock`*:

## SetUserExpirationPolicy ()

SetUserExpirationPolicy (in  'x' expiration\_time)

*`expiration_time`*:
