## 核心策略

* **默认编译器：Tectonic。**
  日常写 LaTeX，优先用 Tectonic，而不是上来就装 `texlive-full`。Tectonic 官方文档说明它是**单一可执行文件**，安装简单，基本用法就是 `tectonic -X compile myfile.tex`，并且支持 `--synctex`，很适合 VS Code 的现代工作流。([Tectonic][1])

* **编辑器：VS Code + LaTeX Workshop。**
  LaTeX Workshop 官方文档支持自定义 `tools` 和 `recipes`，可以把底层编译器替换成 Tectonic，并通过 `Ctrl+Alt+B` 或自动保存触发构建。([GitHub][2])

* **VS Code 安装方式：优先官方 `.deb` / `apt` 仓库版。**
  VS Code 官方文档对 Debian/Ubuntu 明确提供 `.deb` 包和 `apt` 仓库安装方法；Snap 版也是官方发行方式，但本文统一使用 `.deb` / `apt` 仓库版，便于和系统包管理保持一致。([Visual Studio Code][3])

* **传统 TeX Live 只作为兼容性后备。**
  Ubuntu 24.04 的 `texlive-full` 仍然是“**拉起整个 TeX Live 所有组件**”的 metapackage，而且依赖里包含 `context`；如果你只是想写 LaTeX，这通常过重。更稳妥的后备方案是按需安装 `texlive-xetex`、`texlive-latex-recommended`、`texlive-latex-extra`、`texlive-lang-chinese` 这类分包。([Ubuntu软件包][4])

---

## 第一步：安装 Tectonic（默认方案）

这是本文推荐的默认编译器方案。

```bash
# 1. 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. 重启终端

# 3. 补齐依赖
sudo apt update && sudo apt install -y pkg-config libfontconfig1-dev libgraphite2-dev libharfbuzz-dev libicu-dev zlib1g-dev libssl-dev libpng-dev

# 4. 编译安装
cargo install tectonic

# 3. 验证
tectonic --version
```
技巧：
```sh
# 1. 安装 apt-file 工具
sudo apt install apt-file && sudo apt-file update

# 2. 报错时，直接查这个缺失的文件属于哪个包
apt-file search libpng.pc
```

---

## 第二步：安装 VS Code（官方 apt 仓库版）

```bash
# 1. 安装依赖
sudo apt update
sudo apt install -y wget gpg apt-transport-https

# 2. 导入微软签名密钥
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -D -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/microsoft.gpg
rm -f microsoft.gpg

# 3. 添加 VS Code 官方仓库
sudo tee /etc/apt/sources.list.d/vscode.sources > /dev/null <<'EOF'
Types: deb
URIs: https://packages.microsoft.com/repos/code
Suites: stable
Components: main
Architectures: amd64 arm64 armhf
Signed-By: /usr/share/keyrings/microsoft.gpg
EOF

# 4. 安装 VS Code
sudo apt update
sudo apt install -y code
```

---

## 第三步：安装 LaTeX Workshop 插件

```bash
code --install-extension James-Yu.latex-workshop
```

---

## 第四步：写入项目级配置

**不要直接覆盖全局 `settings.json`。**
更好的做法是：给每个 LaTeX 项目单独放一个 `.vscode/settings.json`。这样不污染别的项目，也更容易迁移。

先创建测试项目：

```bash
mkdir -p ~/latex_test/.vscode
cd ~/latex_test
```

然后写入项目配置：

```bash
cat > .vscode/settings.json <<'EOF'
{
  "latex-workshop.latex.autoBuild.run": "onSave",
  "latex-workshop.view.pdf.viewer": "tab",
  "latex-workshop.latex.recipe.default": "tectonic",

  "latex-workshop.latex.recipes": [
    {
      "name": "tectonic",
      "tools": ["tectonic"]
    }
  ],

  "latex-workshop.latex.tools": [
    {
      "name": "tectonic",
      "command": "tectonic",
      "args": [
        "-X",
        "compile",
        "%DOCFILE_EXT%",
        "--synctex",
        "--keep-logs"
      ]
    }
  ]
}
EOF
```

---

## 第五步：验证环境

创建一个最小中文测试文件：

```bash
cat > test.tex <<'EOF'
\documentclass{ctexart}
\title{环境测试成功}
\author{Ubuntu User}
\date{\today}

\begin{document}
\maketitle

你好，Ubuntu！

This is a test document compiled with Tectonic.

\[
E = mc^2
\]

\end{document}
EOF
```

打开项目：

```bash
code .
```

---

## 最后一步操作

1. 在 VS Code 中打开 `test.tex`
2. 按 `Ctrl + S` 保存
3. 观察左下角构建状态，或按 `Ctrl + Alt + B` 手动触发编译
4. 右上角打开 PDF 预览
5. 如果你看到了中文“你好，Ubuntu！”，说明环境配置成功。LaTeX Workshop 的构建入口、默认 recipe、自动构建和 root file 发现机制都由官方文档支持。([GitHub][2])

---

## 什么时候不要用这套默认方案？

如果你遇到下面这些情况，就不要硬扛 Tectonic，而是切到传统 TeX Live：

* 学校/期刊模板明确要求 `latexmk`、`xelatex`、`pdflatex` 或 `lualatex`
* 模板非常老，依赖特殊外部工具
* 你需要完全复刻实验室/投稿系统的传统构建链

这时安装一个**较小但实用**的兼容性集合即可，不必装 `texlive-full`：

```bash
sudo apt update
sudo apt install -y \
  latexmk \
  texlive-xetex \
  texlive-latex-recommended \
  texlive-latex-extra \
  texlive-fonts-recommended \
  texlive-lang-chinese \
  biber
```

Ubuntu 24.04 确实提供这些分包；其中 `texlive-xetex`、`texlive-latex-recommended`、`texlive-lang-chinese` 都是官方仓库里的独立包。([Ubuntu软件包][5])
