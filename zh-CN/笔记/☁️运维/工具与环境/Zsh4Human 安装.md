# Zsh4Human 安装

适用环境：Linux / WSL / macOS。

用途：快速获得一套开箱即用的 Zsh 配置，包括补全、提示符、历史搜索和常用交互体验。

## 安装

```bash
# 优先用 curl 下载官方安装脚本；没有 curl 时退回 wget。
if command -v curl >/dev/null 2>&1; then
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/romkatv/zsh4humans/v5/install)"
else
  sh -c "$(wget -O- https://raw.githubusercontent.com/romkatv/zsh4humans/v5/install)"
fi
```

这里几个参数的含义：

- `command -v curl`：检查 `curl` 命令是否存在。
- `curl -f`：HTTP 请求失败时返回非零退出码。
- `curl -sS`：静默输出进度，但保留错误信息。
- `curl -L`：跟随重定向。
- `wget -O-`：把下载内容输出到标准输出。
- `sh -c "..."`：把下载到的脚本交给 `sh` 执行。

## 安装后检查

```bash
# 当前登录 shell。
echo "$SHELL"

# zsh 是否安装成功。
zsh --version

# 当前正在运行的 shell 进程。
ps -p $$ -o comm=
```

如果安装后想把默认 shell 改成 Zsh：

```bash
chsh -s "$(command -v zsh)"
```

执行后重新登录终端生效。
