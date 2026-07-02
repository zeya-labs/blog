## 目标

在 Windows 上通过 Docker 跑 VPN，然后让 VS Code 的 Remote - SSH 通过本地代理连接内网器。

---

## 当前环境

- 系统：Windows PowerShell
- VPN 地址：`https://vpn.bupt.edu.cn`、`https://vpn.bza.edu.cn:8443/`
- 本地代理端口：
  - SOCKS5：`127.0.0.1:1080`
  - HTTP：`127.0.0.1:8888`

---

## 一、安装 Ncat

### 方法 1：用 winget 安装

```powershell
winget install Insecure.Nmap
````

安装完成后检查：

```powershell
ncat --version
```

### 方法 2：图形界面安装

下载安装 Nmap，Ncat 会一起安装。

如果 `ncat` 不在 PATH 里，可以检查：

```powershell
Get-ChildItem "C:\Program Files*\Nmap\ncat.exe" -ErrorAction SilentlyContinue
```

常见路径：

```text
C:\Program Files (x86)\Nmap\ncat.exe
```

---

## 二、启动 VPN 容器

推荐使用 `docker-atrust` 图形版，而不是 `docker-easyconnect:cli`

先拉镜像：

```powershell
docker pull hagb/docker-atrust
```

启动：

```powershell
docker run --name atrust --restart unless-stopped --device /dev/net/tun --cap-add NET_ADMIN -d -e PASSWORD=123456 -e URLWIN=1 -e USE_NOVNC=1 -v "%USERPROFILE%\.atrust-data:/root" -p 127.0.0.1:8080:8080 -p 127.0.0.1:5901:5901 -p 127.0.0.1:1080:1080 -p 127.0.0.1:8888:8888 -p 127.0.0.1:54631:54631 --sysctl net.ipv4.conf.default.route_localnet=1 hagb/docker-atrust
```
如果你需要第二个：
```powershell
docker run --name atrust2 --restart unless-stopped --device /dev/net/tun --cap-add NET_ADMIN -d -e PASSWORD=123456 -e URLWIN=1 -e USE_NOVNC=1 -v "%USERPROFILE%\.atrust2-data:/root" -p 127.0.0.1:8081:8080 -p 127.0.0.1:5902:5901 -p 127.0.0.1:1081:1080 -p 127.0.0.1:8889:8888 -p 127.0.0.1:54632:54631 --sysctl net.ipv4.conf.default.route_localnet=1 hagb/docker-atrust
```

然后浏览器打开：

```text
http://127.0.0.1:8080
```

在 aTrust 界面中输入：

- 服务器：`https://vpn.bupt.edu.cn`
    
- 用户名：学号 / 教工号，如 2023212641
    
- 密码：企业微信里当前 OTP 六位动态码
    

---

## 三、配置 SSH 走代理

打开 SSH 配置文件：

```powershell
notepad $HOME\.ssh\config
```

写入：

```sshconfig
Host bupt-campus
    HostName 10.XXX.XXX.XXX
    User yourname
    Port 22
    ProxyCommand "C:/Program Files (x86)/Nmap/ncat.exe" --proxy 127.0.0.1:1080 --proxy-type socks5 %h %p
    ServerAliveInterval 30
    TCPKeepAlive yes
```

### 参数说明

- `Host`：VS Code 里显示的名字
    
- `HostName`：校园内服务器 IP 或域名
    
- `User`：SSH 用户名
    
- `ProxyCommand`：让 SSH 通过本地 SOCKS5 代理连接目标主机
    

如果 SOCKS5 不通，也可以试 HTTP 代理：

```sshconfig
ProxyCommand "C:/Program Files (x86)/Nmap/ncat.exe" --proxy 127.0.0.1:8888 --proxy-type http %h %p
```

---

## 四、先在 PowerShell 里测试 SSH

```powershell
ssh bupt-campus
```

如果能连上，再去 VS Code 里连接。

---

## 五、VS Code 连接方法

1. 安装插件：`Remote - SSH`
    
2. 打开命令面板
    
3. 运行：
    

```text
Remote-SSH: Connect to Host...
```

4. 选择：
    

```text
bupt-campus
```

---

## 六、推荐的 VS Code 调试设置

如果连接卡住，可以在 `settings.json` 里加入：

```json
"remote.SSH.showLoginTerminal": true,
"remote.SSH.useLocalServer": false
```

这样能看到 VS Code 实际执行的 SSH 过程。

---