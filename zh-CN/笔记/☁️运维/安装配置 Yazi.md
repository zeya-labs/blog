Yazi 是一个终端文件管理器，适合在 SSH、tmux、服务器环境里快速浏览目录、预览文件、复制/移动/删除文件，并和 `fzf`、`zoxide`、编辑器配合使用。

这份教程的目标不是把 Yazi 配得很花，而是配置成一个稳定、实用、可维护的终端文件工作台。

适用环境：

- Ubuntu 24.04 / Debian 系
- zsh
- tmux 可选
- 已安装或准备安装 `fzf`、`zoxide`

## 1. 安装方式说明

Yazi 官方项目本身不在 Ubuntu 24.04 默认 apt 仓库里。这里使用第三方 apt 源：

```text
https://debian.griffo.io/apt
```

注意：这是第三方源，不是 Ubuntu 官方源。添加第三方 apt 源时，不建议把 key 放进全局 `/etc/apt/trusted.gpg.d`，更推荐使用 `signed-by=` 绑定到单个源。

## 2. 添加 apt 源

创建 keyring 目录：

```bash
install -d -m 0755 /etc/apt/keyrings
```

下载并安装仓库 key：

```bash
curl -fsSL https://debian.griffo.io/EA0F721D231FDD3A0A17B9AC7808B4DD62C41256.asc \
  | gpg --dearmor --yes -o /etc/apt/keyrings/debian.griffo.io.gpg
chmod 0644 /etc/apt/keyrings/debian.griffo.io.gpg
```

添加源：

```bash
echo "deb [signed-by=/etc/apt/keyrings/debian.griffo.io.gpg] https://debian.griffo.io/apt $(lsb_release -sc) main" \
  > /etc/apt/sources.list.d/debian.griffo.io.list
```

更新 apt：

```bash
apt update
```


## 3. 安装 Yazi 和推荐依赖

基础安装：

```bash
apt install -y yazi
```

推荐一起安装这些依赖：

```bash
apt install -y yazi ffmpeg 7zip jq poppler-utils fd-find ripgrep
```

各依赖作用：

- `ffmpeg` / `ffprobe`：视频、音频、媒体信息预览。
- `7zip`：压缩包预览和处理。
- `jq`：JSON 文件预览。
- `poppler-utils`：PDF 预览，提供 `pdftotext`、`pdftoppm`。
- `fd-find`：快速文件发现。
- `ripgrep`：快速文本搜索。
- `fzf`：交互式模糊搜索。
- `zoxide`：目录跳转。
- `xclip`：剪贴板支持，适合 X11/部分 SSH 环境。

Ubuntu 里 `fd-find` 的命令通常叫 `fdfind`，而很多工具会找 `fd`。建议补一个兼容链接：

```bash
ln -sf /usr/bin/fdfind /usr/local/bin/fd
```

## 4. 验证安装

检查版本：

```bash
yazi --version
ya --version
```

检查依赖：

```bash
yazi --debug
```

重点看这些项：

```text
ffmpeg/ffprobe
pdftoppm
fzf
fd/fdfind
rg
chafa
zoxide
7zz/7z
jq
xclip
```

当前这台机器验证结果类似：

```text
Yazi 26.5.6
ffmpeg/ffprobe: 6.1.1-3 / 6.1.1-3
pdftoppm      : 24.02.0
fzf           : 0.44.1
fd/fdfind     : 9.0.0 / 9.0.0
chafa         : 1.14.0
zoxide        : 0.9.3
7zz/7z        : No such file or directory / 23.01
jq            : 1.7
xclip         : 0.13
```

`7zz` 没有但 `7z` 有，没问题。`ueberzugpp` 和 `magick` 没有也不是硬要求，SSH 服务器环境下可以先不装。

## 5. 推荐 shell 配置

直接运行：

```bash
yazi
```

可以打开 Yazi，但退出后 shell 目录不会跟着变化。更推荐配置一个 `yy` 函数，让你在 Yazi 中切到某个目录后，退出时 shell 自动进入那个目录。

把下面内容放到 `~/.zshrc`：

```zsh
yy() {
  local tmp
  tmp="$(mktemp -t yazi-cwd.XXXXXX)" || return

  yazi "$@" --cwd-file="$tmp"

  local cwd
  cwd="$(cat "$tmp" 2>/dev/null)"
  rm -f "$tmp"

  if [[ -n "$cwd" && "$cwd" != "$PWD" ]]; then
    builtin cd -- "$cwd"
  fi
}
```

重新加载 zsh：

```bash
source ~/.zshrc
```

之后推荐用：

```bash
yy
```

而不是直接 `yazi`。

## 6. 基础使用

打开当前目录：

```bash
yy
```

打开指定目录：

```bash
yy /root/code
```

Yazi 的界面通常分为三列：

- 左侧：父目录
- 中间：当前目录
- 右侧：文件预览

基础按键：

```text
h        返回上级/左移
j        下移
k        上移
l        进入目录/打开文件
Enter    打开
q        退出
~        回到 home
.        显示/隐藏隐藏文件
```

选择和文件操作：

```text
Space    选择/取消选择
v        进入选择模式
y        复制选中文件
x        剪切选中文件
p        粘贴
d        删除/移入回收站
D        永久删除，慎用
r        重命名
a        新建文件或目录
```

搜索和跳转：

```text
/        当前目录内搜索
s        用 fd/fzf 搜索文件
S        用 rg 搜索文件内容
z        用 zoxide 跳转目录
```

排序和显示：

```text
,        排序菜单
Tab      切换标签页
```

帮助：

```text
?        查看帮助/快捷键
```

如果某个按键与你当前版本不同，以 `?` 里的实际帮助为准。

## 7. 推荐工作流

### 浏览项目

```bash
cd /root/code
yy
```

在 Yazi 里：

- 用 `j/k` 浏览文件。
- 用 `l` 进入目录。
- 用 `h` 返回上级。
- 右侧自动预览文本、图片、PDF、压缩包等。

### 跳到常用目录

前提是已配置 zoxide：

```zsh
eval "$(zoxide init zsh --cmd cd)"
```

在 Yazi 里按：

```text
z
```

可以用 zoxide 快速跳转到常用目录。

在 shell 里也可以：

```bash
cd code
yy
```

### 搜索文件

在 Yazi 里按：

```text
s
```

使用 `fd` / `fzf` 搜索文件。

如果你只记得文件内容，按：

```text
S
```

使用 `ripgrep` 搜索内容。

### 用编辑器打开文件

Yazi 默认会使用 `$EDITOR`。

建议在 `~/.zshrc` 里设置：

```zsh
export EDITOR=micro
export VISUAL=micro
```

或者：

```zsh
export EDITOR=vim
export VISUAL=vim
```

然后在 Yazi 里选中文件按 `Enter` 即可打开。

## 8. 和 tmux 配合

Yazi 很适合放在 tmux pane 里。

常见用法：

```bash
tmux
yy
```

如果你已经配置了 tmux 分屏：

```text
C-a |    左右分屏
C-a -    上下分屏
```

可以一个 pane 跑 shell，一个 pane 跑 `yy`。浏览到目录后退出 Yazi，shell 会自动停在该目录。

## 9. 最佳实践

### 用 `yy`，少用裸 `yazi`

裸 `yazi` 只是打开文件管理器。`yy` 会把最后所在目录同步回 shell，更符合终端工作流。

### 不要一开始就重度改 keymap

先熟悉默认按键。Yazi 默认按键已经比较接近 Vim 风格，和 tmux/zsh 的搭配也自然。

建议先只记：

```text
h/j/k/l
Space
y/x/p
d
r
a
s
S
z
q
?
```

### 优先补依赖，不急着装插件

Yazi 的预览能力很依赖外部命令。比起先装插件，更应该先让这些命令可用：

```bash
ffmpeg
ffprobe
pdftoppm
jq
fd
rg
fzf
7z
zoxide
```

### 删除操作要保守

刚开始使用时，少用永久删除。看到 `D` 这类永久操作要谨慎。

### 在服务器上不要追求图片预览完美

SSH 环境里，图片预览受终端能力影响。`chafa` 已经够用；`ueberzugpp` 更适合本地图形环境，不是服务器必需品。

## 10. 排错

### yazi 命令不存在

检查：

```bash
command -v yazi
apt policy yazi
```

如果 apt 源没加成功：

```bash
cat /etc/apt/sources.list.d/debian.griffo.io.list
ls -la /etc/apt/keyrings/debian.griffo.io.gpg
apt update
```

### fd 不存在

Ubuntu 包叫 `fd-find`，命令可能叫 `fdfind`。

修复：

```bash
ln -sf /usr/bin/fdfind /usr/local/bin/fd
```

验证：

```bash
command -v fd
fd --version
```

### 预览不完整

运行：

```bash
yazi --debug
```

缺什么装什么：

```bash
apt install -y ffmpeg 7zip jq poppler-utils fd-find ripgrep
```

### yy 退出后没有 cd 到目标目录

确认函数是否加载：

```bash
type yy
```

确认 `.zshrc` 已重新加载：

```bash
source ~/.zshrc
```

### apt 下载很慢

如果你有代理函数 `p`，可以这样跑：

```bash
p apt update
p apt install -y yazi ffmpeg 7zip jq poppler-utils fd-find ripgrep
```

也可以加超时和重试：

```bash
p apt-get -o Acquire::Retries=3 \
  -o Acquire::http::Timeout=30 \
  -o Acquire::https::Timeout=30 \
  install -y yazi ffmpeg 7zip jq poppler-utils fd-find ripgrep
```

## 11. 当前机器状态

当前已完成：

- Yazi: `26.5.6`
- Ya: `26.5.6`
- `ffmpeg` / `ffprobe`: installed
- `pdftoppm`: installed
- `fzf`: installed
- `fd`: `/usr/local/bin/fd -> /usr/bin/fdfind`
- `rg`: installed
- `chafa`: installed
- `zoxide`: installed
- `7z`: installed
- `jq`: installed
- `xclip`: installed
- `yy`: 已写入 `~/.zshrc`

日常入口：

```bash
yy
```

这就够了。
