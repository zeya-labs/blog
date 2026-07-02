# Zsh4Human 安装

适用环境：Linux / WSL / macOS。

用途：快速获得一套开箱即用的 Zsh 配置，包括补全、提示符、历史搜索和常用交互体验。

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

## 常见问题

如果下载 GitHub 脚本很慢，可以先配置代理，或把安装脚本下载到本地后再执行。

如果安装后新终端没有进入 Zsh，检查默认 shell：

```bash
echo "$SHELL"
chsh -s "$(command -v zsh)"
```
