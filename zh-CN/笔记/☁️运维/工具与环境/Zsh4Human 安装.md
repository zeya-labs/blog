# Zsh4Human 安装

适用环境：Linux / WSL / macOS。Zsh4Human 是一套开箱即用的 Zsh 配置，适合想快速获得补全、提示符、历史搜索和常用交互体验的人。

## 安装

```bash
if command -v curl >/dev/null 2>&1; then
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/romkatv/zsh4humans/v5/install)"
else
  sh -c "$(wget -O- https://raw.githubusercontent.com/romkatv/zsh4humans/v5/install)"
fi
```

## 验证

安装完成后重新打开终端，确认当前 shell：

```bash
echo "$SHELL"
zsh --version
```
