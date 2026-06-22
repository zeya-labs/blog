# 从 0 开始最佳实践配置 tmux

这份教程的目标是配置一个干净、稳定、现代的 tmux 环境：少插件、少魔法、可维护。核心配置尽量只使用 tmux 自带能力，额外只安装一个确实提升效率的插件：`tmux-fzf`。

适用环境：

- tmux 3.2 及以上，推荐 tmux 3.4
- zsh 或 bash
- 支持 256 色和 truecolor 的终端
- 可选：`fzf`、`fzf-tmux`

## 1. 安装 tmux 和基础工具

Ubuntu / Debian:

```bash
sudo apt update
sudo apt install -y tmux fzf git
```

检查版本：

```bash
tmux -V
command -v fzf
command -v fzf-tmux
```

如果 `tmux -V` 小于 3.2，建议升级。tmux 3.2 开始支持 popup，`tmux-fzf` 体验会更好。

## 2. 配置文件位置

tmux 默认会读取：

```text
~/.tmux.conf
```

也可以使用 XDG 路径：

```text
~/.config/tmux/tmux.conf
```

为了兼容性和简单起见，本教程使用：

```text
~/.tmux.conf
```

创建配置文件：

```bash
touch ~/.tmux.conf
```

## 3. 推荐完整配置

把下面内容写入 `~/.tmux.conf`：

```tmux
# ~/.tmux.conf
# tmux 3.4 friendly configuration.

##### Prefix
unbind C-b
set -g prefix C-a
bind C-a send-prefix

##### Reload
bind r source-file ~/.tmux.conf \; display-message "tmux config reloaded"

##### Shell and terminal
set -g default-shell /usr/bin/zsh
set -g default-terminal "tmux-256color"
set -as terminal-features ",xterm-256color:RGB"

##### Indexing
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on

##### Interaction
set -g mouse on
set -g focus-events on
set -g history-limit 50000
set -g display-time 1200
set -g status-interval 5
set -s escape-time 10
setw -g mode-keys vi
setw -g automatic-rename on
setw -g allow-rename off

##### Clipboard
# Uses OSC 52 where supported by the outer terminal.
set -s set-clipboard external

##### Windows and panes
bind c new-window -c "#{pane_current_path}"

unbind '"'
bind - split-window -v -c "#{pane_current_path}"
unbind %
bind | split-window -h -c "#{pane_current_path}"

bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5

bind = select-layout even-horizontal
bind + select-layout even-vertical

##### Copy mode
bind -T copy-mode-vi v send -X begin-selection
bind -T copy-mode-vi y send -X copy-selection-and-cancel
bind -T copy-mode-vi Escape send -X cancel

##### Status
set -g status on
set -g status-position bottom
set -g status-style "bg=colour234,fg=colour250"
set -g status-left-length 30
set -g status-right-length 80
set -g status-left "#[fg=colour114,bold] #S #[fg=colour245]|"
set -g status-right "#[fg=colour245]#(whoami)@#H #[fg=colour39]%Y-%m-%d %H:%M "

setw -g window-status-separator ""
setw -g window-status-format " #[fg=colour245]#I:#W#{?window_flags,#{window_flags},} "
setw -g window-status-current-format " #[bg=colour39,fg=colour231,bold]#I:#W#{?window_flags,#{window_flags},}#[default] "

set -g pane-border-style "fg=colour238"
set -g pane-active-border-style "fg=colour39"
set -g message-style "bg=colour39,fg=colour231"
set -g mode-style "bg=colour39,fg=colour231"
```

如果你的默认 shell 不是 zsh，把这一行改成实际路径：

```tmux
set -g default-shell /usr/bin/zsh
```

查看当前 shell 路径：

```bash
command -v zsh
command -v bash
```

## 4. 每段配置的作用

### Prefix

默认 prefix 是 `C-b`，很多人会改成 `C-a`：

```tmux
unbind C-b
set -g prefix C-a
bind C-a send-prefix
```

这样大部分 tmux 操作都以 `Ctrl-a` 开始。例如：

```text
C-a c
C-a -
C-a |
```

### 重新加载配置

```tmux
bind r source-file ~/.tmux.conf \; display-message "tmux config reloaded"
```

修改配置后，在 tmux 里按：

```text
C-a r
```

即可重新加载，不需要重启 tmux。

### 终端能力和 truecolor

```tmux
set -g default-terminal "tmux-256color"
set -as terminal-features ",xterm-256color:RGB"
```

`tmux-256color` 是 tmux 内部推荐的 TERM 类型。`terminal-features ...:RGB` 用来告诉 tmux 外层终端支持 truecolor。

检查系统是否支持：

```bash
infocmp tmux-256color >/dev/null && echo ok
```

如果失败，可以临时改成：

```tmux
set -g default-terminal "screen-256color"
```

### 编号从 1 开始

```tmux
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
```

窗口和 pane 从 1 开始编号，更符合键盘直觉。关闭窗口后自动重新编号，避免出现 `1, 2, 5, 8` 这种跳号。

### 交互体验

```tmux
set -g mouse on
set -g focus-events on
set -g history-limit 50000
set -s escape-time 10
setw -g mode-keys vi
setw -g allow-rename off
```

含义：

- `mouse on`：鼠标选择 pane、滚动历史。
- `focus-events on`：让 Vim、Neovim 等程序感知终端焦点变化。
- `history-limit 50000`：增加滚动历史。
- `escape-time 10`：降低 Vim 里 Esc 的延迟。
- `mode-keys vi`：copy mode 使用 vi 风格按键。
- `allow-rename off`：避免程序随意改 tmux 窗口名。

### 剪贴板

```tmux
set -s set-clipboard external
```

这是比较保守的现代选择。它允许 tmux 使用外部剪贴板，但不会随便接受 tmux 内程序修改 tmux buffer 的请求。

是否能复制到系统剪贴板，还取决于外层终端是否支持 OSC 52。

### 分屏和 pane 操作

```tmux
bind - split-window -v -c "#{pane_current_path}"
bind | split-window -h -c "#{pane_current_path}"
bind c new-window -c "#{pane_current_path}"
```

新窗口和分屏会继承当前目录，不会每次回到 home。

常用按键：

```text
C-a -    上下分屏
C-a |    左右分屏
C-a c    新建窗口
C-a h    切到左侧 pane
C-a j    切到下方 pane
C-a k    切到上方 pane
C-a l    切到右侧 pane
C-a H    向左调整 pane
C-a J    向下调整 pane
C-a K    向上调整 pane
C-a L    向右调整 pane
```

### Copy mode

```tmux
bind -T copy-mode-vi v send -X begin-selection
bind -T copy-mode-vi y send -X copy-selection-and-cancel
```

使用方式：

```text
C-a [
v  开始选择
y  复制并退出 copy mode
```

## 5. 验证配置是否正确

用独立 tmux server 测试，不影响当前 tmux：

```bash
tmux -L tmuxconf-test -f ~/.tmux.conf new-session -d -s cfgtest 'sleep 5'
tmux -L tmuxconf-test display-message -p 'prefix=#{prefix} mouse=#{mouse} term=#{default-terminal} mode=#{mode-keys}'
tmux -L tmuxconf-test kill-server
```

期望类似输出：

```text
prefix=C-a mouse=1 term=tmux-256color mode=vi
```

如果已经在 tmux 里，重新加载：

```text
C-a r
```

或者在 shell 执行：

```bash
tmux source-file ~/.tmux.conf
```

## 6. 安装 tmux-fzf

这一步是可选的。推荐只安装这一个插件，用来快速切换 session、window、pane 和查找 tmux 命令。

不使用 TPM，直接手动安装：

```bash
mkdir -p ~/.tmux/plugins
git clone --depth 1 https://github.com/sainnhe/tmux-fzf.git ~/.tmux/plugins/tmux-fzf
```

在 `~/.tmux.conf` 末尾追加：

```tmux
##### tmux-fzf
TMUX_FZF_ORDER="session|window|pane|command|keybinding"
TMUX_FZF_OPTIONS="-p -w 70% -h 45% -m"
run-shell "~/.tmux/plugins/tmux-fzf/main.tmux"
```

重新加载：

```text
C-a r
```

使用：

```text
C-a F
```

这里刻意没有启用 `clipboard` 和 `process`：

- `clipboard` 依赖更多外部剪贴板工具，且你已经有 tmux 原生剪贴板配置。
- `process` 可以杀进程，功能强但误操作成本更高。

如果以后想启用完整菜单，把顺序改成：

```tmux
TMUX_FZF_ORDER="copy-mode|session|window|pane|command|keybinding|clipboard|process"
```

## 7. 不建议一开始安装的插件

### TPM

TPM 是 tmux 插件管理器。如果你要装很多插件，它有价值。但如果只用一个 `tmux-fzf`，手动 clone 更简单，故障点更少。

### tmux-resurrect / tmux-continuum

这两个用于保存和恢复 tmux session。适合经常重启机器、希望恢复窗口布局的人。

不适合的场景：

- 你不需要恢复 session。
- 你希望 tmux 行为简单透明。
- 你以远程服务器、临时任务为主。

### 主题类插件

主题插件通常收益低、依赖多。状态栏用原生配置足够。

## 8. 常用命令速查

tmux 基础：

```bash
tmux
tmux new -s work
tmux ls
tmux attach -t work
tmux kill-session -t work
```

tmux 内常用按键：

```text
C-a r    重新加载配置
C-a c    新建窗口
C-a n    下一个窗口
C-a p    上一个窗口
C-a ,    重命名窗口
C-a -    上下分屏
C-a |    左右分屏
C-a h    左 pane
C-a j    下 pane
C-a k    上 pane
C-a l    右 pane
C-a z    放大/恢复当前 pane
C-a [    进入 copy mode
C-a d    detach
C-a F    打开 tmux-fzf
```

## 9. 排错

### 配置没有生效

确认文件位置：

```bash
ls -la ~/.tmux.conf
```

手动加载：

```bash
tmux source-file ~/.tmux.conf
```

如果没有 tmux server，启动一个：

```bash
tmux
```

### 颜色不对

检查：

```bash
echo "$TERM"
infocmp tmux-256color >/dev/null && echo ok
```

tmux 外部终端通常是 `xterm-256color`、`alacritty`、`wezterm` 等；tmux 内部应该是：

```bash
echo "$TERM"
```

输出：

```text
tmux-256color
```

### tmux-fzf 打不开

检查：

```bash
command -v fzf
command -v fzf-tmux
ls -la ~/.tmux/plugins/tmux-fzf/main.tmux
```

检查按键绑定：

```bash
tmux list-keys F
```

应该能看到：

```text
bind-key -T prefix F run-shell -b ~/.tmux/plugins/tmux-fzf/main.sh
```

## 10. 最终取舍

这套配置的取舍是：

- tmux 原生配置优先。
- 不默认使用插件管理器。
- 不安装 session 恢复类插件。
- 状态栏保持简单。
- 只用 `tmux-fzf` 补足快速导航能力。

这不是功能最多的 tmux 配置，但它足够稳定、清晰，并且适合长期维护。
