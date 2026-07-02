# Fastfetch 安装

适用环境：Ubuntu / Debian 系桌面或 WSL。

用途：在终端里展示系统、硬件、桌面环境和主题信息，适合用作新机器初始化后的环境检查。

## 安装

```bash
# 更新软件源索引。
sudo apt update

# add-apt-repository 来自这个包，用来添加 PPA。
sudo apt install software-properties-common

# 添加 Fastfetch 的 PPA。
sudo add-apt-repository ppa:zhangsongcui3371/fastfetch

# 重新读取软件源索引，让 apt 能看到新 PPA 里的包。
sudo apt update

# 安装 Fastfetch。
sudo apt install fastfetch
```

## 快速上手

```bash
# 显示完整系统信息。
fastfetch

# 只输出指定模块，适合快速确认系统版本、内核、Shell 和终端。
fastfetch --structure OS:Kernel:Shell:Terminal
```
```
