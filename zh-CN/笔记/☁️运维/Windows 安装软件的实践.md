Windows 现在比较合理的实践是：

> **WinGet 管常规软件，Scoop 管命令行工具，Microsoft Store 管商店应用，官网负责特殊软件。**

## 一、最推荐：WinGet

WinGet 是微软官方的 Windows 包管理器，支持搜索、安装、升级、卸载和批量恢复软件，Windows 10/11 一般已经随“应用安装程序”提供。([Microsoft Learn][1])

例如安装 VS Code：

```powershell
winget search "Visual Studio Code"
winget show --id Microsoft.VisualStudioCode
winget install --id Microsoft.VisualStudioCode --exact
```

查看可更新软件：

```powershell
winget upgrade
```

全部更新：

```powershell
winget upgrade --all
```

WinGet 官方建议在名称可能重复时，先用 `search` 或 `show` 确认，然后通过精确 ID 安装。([Microsoft Learn][2])

它还可以导出软件清单，重装系统后批量恢复：

```powershell
winget export -o apps.json
winget import -i apps.json
```

WinGet 的导出、导入功能本来就是为批量安装和重建开发环境设计的。([Microsoft Learn][3])

### WinGet 适合安装什么

适合绝大多数常规桌面软件，例如：

```powershell
winget install --id Google.Chrome -e
winget install --id Mozilla.Firefox -e
winget install --id Microsoft.VisualStudioCode -e
winget install --id Git.Git -e
winget install --id 7zip.7zip -e
winget install --id VideoLAN.VLC -e
winget install --id GitHub.GitHubDesktop -e
```

WinGet 默认软件源的清单是社区仓库维护的，但提交内容会经过自动验证，安装地址原则上应当来自软件发布者的官方网站，并记录安装包哈希。([Microsoft Learn][4])

因此它并不是从某个不明“软件下载站”重新打包软件，而通常是根据清单从官方地址下载安装包。

---

## 二、开发者推荐再装一个 Scoop

你经常使用 Linux、Shell、dotfiles 和各种命令行工具，因此 **Scoop 对你非常合适**。

Scoop 默认把程序安装在用户目录，不需要管理员权限，尤其适合便携式命令行程序。([scoop.sh][5])

例如：

```powershell
scoop install git
scoop install fzf
scoop install ripgrep
scoop install fd
scoop install bat
scoop install eza
scoop install zoxide
scoop install lazygit
```

Scoop 的软件源称为 bucket，本质上是包含 JSON 安装清单的 Git 仓库；默认 `main` bucket 主要收录稳定的命令行开发工具。([GitHub][6])

常用操作：

```powershell
scoop search 软件名
scoop info 软件名
scoop update
scoop update *
scoop cleanup *
```

### 为什么命令行工具更适合 Scoop

以 `rg`、`fd`、`bat`、`fzf` 这类单文件或便携工具为例，Scoop 通常会：

* 下载压缩包并校验哈希；
* 解压到统一目录；
* 自动加入 PATH；
* 保留旧版本或持久化配置；
* 更新、卸载时比较干净。

Scoop 提供下载校验、安装、升级、锁定版本、导入导出等命令。([GitHub][7])

不过 **Git、VS Code、Chrome 等带完整安装器的 GUI 软件，我更建议交给 WinGet**；Scoop 主要负责你那些 Linux 风格的 CLI 工具。

---

## 三、Microsoft Store 什么时候用

Microsoft Store 适合：

* Windows Terminal；
* PowerToys；
* WhatsApp、Spotify 等商店应用；
* 需要跟随微软账户恢复的应用；
* 希望后台自动更新的软件。

商店应用可以自动更新，也可以在 Microsoft Store 的“库”里手动检查更新。([微软支持][8])

但同一个软件同时有官网版、WinGet 版和 Store 版时，我通常这样选：

1. WinGet 安装传统桌面版；
2. 商店版体验更好或官方明确推荐商店版时，再选 Store；
3. 不要为了“商店更安全”强行使用功能受限的商店版本。

---

## 四、Chocolatey 还值得用吗

Chocolatey 是比较老牌的 Windows 包管理器，能够管理 MSI、EXE、ZIP 和脚本类软件，传统企业自动化环境里仍然很常见。([docs.chocolatey.org][9])

但对你这种个人电脑，我不建议同时折腾：

* WinGet
* Scoop
* Chocolatey

三个管理器。

Chocolatey 很多操作默认采用管理员权限、偏向整机级安装；官方安装流程也默认要求管理员终端。([docs.chocolatey.org][10])

除非某个工具：

* WinGet 没有；
* Scoop 也没有；
* 官方明确提供 Chocolatey 安装命令；
* 你所在的实验室或公司统一用 Chocolatey；

否则没有太大必要额外安装。

---

## 五、哪些软件仍然应该去官网

以下类型我会优先使用官网或硬件厂商自己的更新工具：

### 1. 显卡、主板、网卡等驱动

例如：

* NVIDIA 显卡驱动；
* AMD 芯片组驱动；
* 主板 BIOS；
* 笔记本固件；
* 雷电、网卡、触控板驱动。

驱动首先考虑：

1. Windows Update；
2. 电脑或主板厂商官网；
3. NVIDIA、AMD、Intel 官网。

不要用第三方“驱动大师”一类工具。

### 2. 安全敏感软件

例如：

* VPN 和代理客户端；
* 密码管理器；
* 数字证书工具；
* 银行、学校、政务控件；
* 杀毒软件；
* 硬件钱包软件。

可以使用 WinGet，但首次安装最好先核对：

```powershell
winget show --id 软件ID
```

重点检查：

* Publisher；
* Homepage；
* Installer URL；
* 软件版本；
* 安装类型。

### 3. 需要特殊版本的软件

例如：

* CUDA 与特定驱动版本；
* Visual Studio 指定工作负载；
* MATLAB；
* Adobe；
* 专业工程软件；
* 许可证绑定的软件；
* 特定旧版本。

这类软件官网安装器通常能让你选择组件、版本、安装目录和许可证方式，包管理器不一定适合。

### 4. 软件包版本落后或安装失败

WinGet 的清单虽然会验证，但仍然可能因为官方修改下载地址、替换安装包或版本尚未同步而暂时失败。官方仓库政策也提到，发布者替换二进制文件时可能造成哈希不匹配。([GitHub][11])

这时直接去官网即可，不必强行和包管理器较劲。

---

## 六、最重要的管理原则

### 一个软件只交给一个管理器

例如：

* 不要用 Scoop 安装 Git，随后又用 WinGet 安装一次 Git；
* 不要同时保留 Store 版和官网版 Telegram；
* 不要一会儿 Chocolatey 更新，一会儿官网覆盖安装。

否则容易出现：

* PATH 指向错误版本；
* 一台电脑存在两个可执行文件；
* 一个管理器认为软件未安装；
* 更新后配置目录发生变化。

你可以按照下面的分工长期使用：

| 软件类型                                  | 推荐方式               |
| ------------------------------------- | ------------------ |
| Chrome、Firefox、VS Code、7-Zip、Telegram | WinGet             |
| fzf、rg、fd、bat、eza、zoxide、lazygit      | Scoop              |
| Windows Terminal、PowerToys、部分 UWP 应用  | Microsoft Store    |
| 显卡驱动、BIOS、专业软件、特殊版本                   | 官网                 |
| Python 包                              | `uv` / `pip`       |
| Node.js 项目依赖                          | `pnpm` / `npm`     |
| Rust 工具链                              | `rustup` / `cargo` |
| WSL 内部的软件                             | Linux 自己的 `apt` 等  |

## 给你的直接建议

你可以把目前的习惯改成：

1. **第一次想到安装某个普通软件：先查 WinGet。**
2. **命令行小工具：优先查 Scoop。**
3. **WinGet/Scoop 没有、版本不对或属于驱动和专业软件：再去官网。**
4. **永远不要从“某某软件园、极速下载站、绿色软件站”下载。**

也就是：

```text
WinGet → Scoop → Microsoft Store／官网
```

而不是以后完全不访问官网。官网仍然是最终的可信来源，包管理器主要解决的是**搜索、更新、批量安装和环境复现效率**问题。

[1]: https://learn.microsoft.com/en-us/windows/package-manager/winget/?utm_source=chatgpt.com "Use WinGet to install and manage applications"
[2]: https://learn.microsoft.com/en-us/windows/package-manager/winget/upgrade?utm_source=chatgpt.com "upgrade command (winget)"
[3]: https://learn.microsoft.com/en-us/windows/package-manager/winget/export?utm_source=chatgpt.com "export command (winget)"
[4]: https://learn.microsoft.com/en-us/windows/package-manager/package/repository?utm_source=chatgpt.com "Submit your manifest to the repository"
[5]: https://scoop.sh/Scoop/?utm_source=chatgpt.com "A command-line installer for Windows"
[6]: https://github.com/ScoopInstaller/Scoop/wiki/Buckets?utm_source=chatgpt.com "Buckets · ScoopInstaller/Scoop Wiki"
[7]: https://github.com/ScoopInstaller/Scoop/wiki/Commands?utm_source=chatgpt.com "Commands · ScoopInstaller/Scoop Wiki"
[8]: https://support.microsoft.com/en-us/accounts-billing/get-updates-for-apps-and-games-in-microsoft-store?utm_source=chatgpt.com "Get updates for apps and games in Microsoft Store"
[9]: https://docs.chocolatey.org/en-us/?utm_source=chatgpt.com "Chocolatey - Software Management for Windows"
[10]: https://docs.chocolatey.org/en-us/choco/setup/?utm_source=chatgpt.com "Chocolatey Software Docs | Setup / Install"
[11]: https://github.com/microsoft/winget-pkgs/blob/master/doc/Policies.md?utm_source=chatgpt.com "winget-pkgs/doc/Policies.md at master"
