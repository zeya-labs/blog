# Fastfetch 安装

适用环境：Ubuntu / Debian 系桌面或 WSL。

用途：在终端里展示系统、硬件、桌面环境和主题信息，适合用作新机器初始化后的环境检查。

## 安装

```bash
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:zhangsongcui3371/fastfetch
sudo apt update
sudo apt install fastfetch
```

## 验证

```bash
fastfetch
```

## 常见问题

如果提示 `add-apt-repository: command not found`，先安装：

```bash
sudo apt install software-properties-common
```

如果 PPA 不可用，可以改用发行版仓库、GitHub Release 或源码安装。
