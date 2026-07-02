## 一句话结论

> **`apt` 是给“人”用的，`apt-get` 是给“脚本 / 自动化”用的。**

两者用的是**同一套底层库（APT）**，**不是两个不同的包管理系统**。

---

## 本质关系（别再被误导）

```text
APT（底层库）
 ├── apt-get   → 老牌 CLI，稳定、机器友好
 ├── apt-cache → 查询工具
 ├── apt-key   → 已废弃
 └── apt       → 新一代人类友好 CLI（封装常用功能）
```

- **apt ≠ apt-get 的升级版**
    
- **apt = 把 apt-get / apt-cache 常用功能“揉成一个更好用的命令”**
    

---

## 核心区别速览表

|维度|apt|apt-get|
|---|---|---|
|出现时间|Ubuntu 16.04+|非常老（2000 年代初）|
|设计目标|**交互友好（给人用）**|**稳定可脚本化（给机器用）**|
|输出格式|彩色、进度条、可读性好|稳定、可解析|
|子命令|少而精（常用）|多、完整|
|向后兼容性|**不保证**|**强保证**|
|官方态度|日常手动操作推荐|脚本 / CI / 文档推荐|
|man 页警告|明确写着“**不建议脚本使用**”|明确支持脚本|

👉 **最关键的一点**：  
`apt` 的输出 **可能随版本改变**，`apt-get` 的输出 **几十年几乎不变**。

---

## 常用命令对照（你日常用哪个？）

### 安装 / 升级

```bash
# 推荐给人
sudo apt install nginx
sudo apt upgrade

# 推荐给脚本
sudo apt-get install -y nginx
sudo apt-get upgrade -y
```

---

### 更新索引

```bash
apt update
apt-get update
```

功能一样，输出不一样。

---

### 搜索 / 查看信息（apt 明显更友好）

```bash
apt search ncdu
apt show ncdu
```

对比老工具：

```bash
apt-cache search ncdu
apt-cache show ncdu
```

👉 `apt` 把 `apt-cache` 的常用功能都吸收了。

---

### 删除

```bash
apt remove ncdu
apt purge ncdu

apt-get remove ncdu
apt-get purge ncdu
```

---

## 为什么**脚本里不该用 apt**？

这是官方写进 man page 的（重点）：

```text
apt is intended to be used interactively and should not be used in scripts.
```

原因很现实：

### 1️⃣ 输出不稳定

- 彩色
    
- 表格
    
- 进度条
    
- 提示语可能改
    

脚本一旦 `grep / awk` 就容易炸。

---

### 2️⃣ 行为可能随版本变化

- 新 Ubuntu 可能改默认提示
    
- 新 apt 可能多一步确认
    

👉 CI / Ansible / Dockerfile 最怕这种。

---

### 3️⃣ 非零退出码语义更稳定（apt-get）

自动化系统**靠退出码判断成功失败**，apt-get 在这点上更保守。
