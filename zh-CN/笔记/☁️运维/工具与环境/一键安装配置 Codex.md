Linux / WSL 直接复制执行：

```bash
bash -lc '
set -Eeuo pipefail

MODEL_DEFAULT="gpt-5.5"
NODE_VERSION_DEFAULT="22"
CONFIG_DIR="$HOME/.codex"
BASHRC="$HOME/.bashrc"
ZSHRC="$HOME/.zshrc"

need_tty() {
  if [ ! -t 0 ]; then
    echo "错误：请在交互式终端里运行，不要通过管道直接执行。"
    exit 1
  fi
}

ask() {
  prompt="$1"
  default="${2:-}"
  value=""

  if [ -n "$default" ]; then
    read -r -p "$prompt [$default]: " value
    printf "%s" "${value:-$default}"
  else
    while [ -z "$value" ]; do
      read -r -p "$prompt: " value
    done
    printf "%s" "$value"
  fi
}

ask_secret() {
  prompt="$1"
  value=""

  while [ -z "$value" ]; do
    read -r -s -p "$prompt: " value
    echo
  done

  printf "%s" "$value"
}

confirm() {
  prompt="$1"
  default="${2:-Y}"
  answer=""

  read -r -p "$prompt [$default]: " answer
  answer="${answer:-$default}"

  case "$answer" in
    y|Y|yes|YES|Yes) return 0 ;;
    *) return 1 ;;
  esac
}

run_sudo() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    echo "错误：需要 root 权限，但当前系统没有 sudo。请切换 root 后重试。"
    exit 1
  fi
}

detect_package_manager() {
  if command -v apt-get >/dev/null 2>&1; then
    printf "%s" "apt"
  elif command -v dnf >/dev/null 2>&1; then
    printf "%s" "dnf"
  elif command -v yum >/dev/null 2>&1; then
    printf "%s" "yum"
  elif command -v pacman >/dev/null 2>&1; then
    printf "%s" "pacman"
  elif command -v zypper >/dev/null 2>&1; then
    printf "%s" "zypper"
  elif command -v apk >/dev/null 2>&1; then
    printf "%s" "apk"
  else
    printf "%s" ""
  fi
}

packages_for_manager() {
  manager="$1"
  packages=""

  command -v curl >/dev/null 2>&1 || packages="$packages curl"
  command -v unzip >/dev/null 2>&1 || packages="$packages unzip"

  if ! command -v python3 >/dev/null 2>&1; then
    case "$manager" in
      pacman) packages="$packages python" ;;
      *) packages="$packages python3" ;;
    esac
  fi

  printf "%s" "$packages"
}

install_packages() {
  manager="$(detect_package_manager)"

  if [ -z "$manager" ]; then
    echo "错误：未识别系统包管理器，请手动安装 curl、unzip、python3 后重试。"
    exit 1
  fi

  packages="$(packages_for_manager "$manager")"
  [ -n "$packages" ] || return 0

  echo
  echo "缺少依赖，将使用 $manager 安装：$packages"

  if ! confirm "是否自动安装这些依赖？" "Y"; then
    echo "已取消。请手动安装后重试。"
    exit 1
  fi

  case "$manager" in
    apt)
      run_sudo apt-get update
      run_sudo apt-get install -y $packages
      ;;
    dnf) run_sudo dnf install -y $packages ;;
    yum) run_sudo yum install -y $packages ;;
    pacman) run_sudo pacman -Sy --needed --noconfirm $packages ;;
    zypper) run_sudo zypper install -y $packages ;;
    apk) run_sudo apk add $packages ;;
  esac
}

ensure_deps() {
  install_packages

  command -v curl >/dev/null 2>&1 || { echo "错误：curl 安装失败。"; exit 1; }
  command -v unzip >/dev/null 2>&1 || { echo "错误：unzip 安装失败。"; exit 1; }
  command -v python3 >/dev/null 2>&1 || { echo "错误：python3 安装失败。"; exit 1; }
}

pick_fastest() {
  name="$1"
  shift

  best_url=""
  best_time="999999"

  echo "正在测速 $name ..." >&2

  for url in "$@"; do
    result="$(
      curl -L -o /dev/null -s \
        -w "%{http_code} %{time_total}" \
        --connect-timeout 5 \
        --max-time 12 \
        "$url" 2>/dev/null || echo "000 999999"
    )"

    code="$(echo "$result" | awk "{print \$1}")"
    t="$(echo "$result" | awk "{print \$2}")"

    case "$code" in
      2*|3*) status="OK" ;;
      *) status="FAIL"; t="999999" ;;
    esac

    printf "  %-90s HTTP=%s time=%s 秒 [%s]\n" "$url" "$code" "$t" "$status" >&2

    if [ "$status" = "OK" ]; then
      if python3 - "$t" "$best_time" <<PY
import sys
try:
    sys.exit(0 if float(sys.argv[1]) < float(sys.argv[2]) else 1)
except Exception:
    sys.exit(1)
PY
      then
        best_time="$t"
        best_url="$url"
      fi
    fi
  done

  if [ -z "$best_url" ]; then
    echo "错误：$name 没有可用镜像。"
    exit 1
  fi

  echo "选择 $name: $best_url" >&2
  printf "%s" "$best_url"
}

write_init_file() {
  init_file="$1"
  shell_name="$2"

  touch "$init_file"

  if ! grep -q ">>> fnm / node / npm for codex >>>" "$init_file"; then
    cat >> "$init_file" <<EOF

# >>> fnm / node / npm for codex >>>
export PATH="\$HOME/.local/bin:\$PATH"
if command -v fnm >/dev/null 2>&1; then
  eval "\$(fnm env --shell $shell_name)"
  fnm use default >/dev/null 2>&1 || true
fi
# <<< fnm / node / npm for codex <<<
EOF
  fi
}

write_shell_init() {
  write_init_file "$BASHRC" "bash"

  if [ "${SHELL:-}" = "/bin/zsh" ] || [ "${SHELL:-}" = "/usr/bin/zsh" ] || command -v zsh >/dev/null 2>&1; then
    write_init_file "$ZSHRC" "zsh"
  fi
}

backup_file() {
  file="$1"

  if [ -f "$file" ]; then
    cp "$file" "$file.bak.$(date +%Y%m%d%H%M%S)"
  fi
}

write_codex_config() {
  mkdir -p "$CONFIG_DIR"
  chmod 700 "$CONFIG_DIR"

  if [ -f "$CONFIG_DIR/config.toml" ] || [ -f "$CONFIG_DIR/auth.json" ]; then
    echo
    echo "检测到已有 Codex 配置：$CONFIG_DIR"
    if ! confirm "是否覆盖 config.toml 和 auth.json？" "N"; then
      echo "跳过 Codex 配置写入。"
      return 0
    fi
  fi

  backup_file "$CONFIG_DIR/config.toml"
  backup_file "$CONFIG_DIR/auth.json"

  export CONFIG_DIR BASE_URL API_KEY MODEL
  python3 <<'"'"'PY'"'"'
import json
import os
from pathlib import Path

config_dir = Path(os.environ["CONFIG_DIR"])
base_url = os.environ["BASE_URL"]
api_key = os.environ["API_KEY"]
model = os.environ["MODEL"]

def toml_string(value):
    return json.dumps(value, ensure_ascii=False)

(config_dir / "config.toml").write_text(
    "\n".join([
        "model_provider = \"thirdparty\"",
        f"model = {toml_string(model)}",
        "model_reasoning_effort = \"medium\"",
        "personality = \"pragmatic\"",
        "approvals_reviewer = \"user\"",
        "approval_policy = \"never\"",
        "sandbox_mode = \"danger-full-access\"",
        "service_tier = \"fast\"",
        "",
        "[model_providers.thirdparty]",
        "name = \"thirdparty\"",
        f"base_url = {toml_string(base_url)}",
        "wire_api = \"responses\"",
        "",
    ]),
    encoding="utf-8",
)

(config_dir / "auth.json").write_text(
    json.dumps({"OPENAI_API_KEY": api_key}, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
PY

  chmod 600 "$CONFIG_DIR/config.toml" "$CONFIG_DIR/auth.json"
}

need_tty

echo "Codex 交互式安装配置"
echo

BASE_URL="$(ask "第三方接口 BASE_URL，例如 https://api.example.com/v1")"
API_KEY="$(ask_secret "API_KEY")"
MODEL="$(ask "模型名" "$MODEL_DEFAULT")"
NODE_VERSION="$(ask "Node.js 主版本" "$NODE_VERSION_DEFAULT")"

echo
echo "即将执行："
echo "  BASE_URL: $BASE_URL"
echo "  MODEL: $MODEL"
echo "  Node.js: $NODE_VERSION"
echo "  Codex 配置目录: $CONFIG_DIR"

confirm "确认开始安装？" "Y" || exit 0

echo
echo "[1/7] 检查并补齐系统依赖..."
ensure_deps

echo
echo "[2/7] 测速并安装 fnm..."
FNM_URL="$(pick_fastest "fnm 下载源" \
  "https://gh.llkk.cc/https://github.com/Schniz/fnm/releases/latest/download/fnm-linux.zip" \
  "https://gh-proxy.com/https://github.com/Schniz/fnm/releases/latest/download/fnm-linux.zip" \
  "https://hub.gitmirror.com/https://github.com/Schniz/fnm/releases/latest/download/fnm-linux.zip" \
  "https://github.com/Schniz/fnm/releases/latest/download/fnm-linux.zip"
)"

mkdir -p "$HOME/.local/bin"
TMP_DIR="$(mktemp -d)"
trap '"'"'rm -rf "$TMP_DIR"'"'"' EXIT
cd "$TMP_DIR"

curl -L --connect-timeout 10 --max-time 120 -o fnm-linux.zip "$FNM_URL"
unzip -o fnm-linux.zip >/dev/null
install -m 755 fnm "$HOME/.local/bin/fnm"

export PATH="$HOME/.local/bin:$PATH"

echo
echo "[3/7] 测速 Node.js 镜像..."
NODE_MIRROR_TEST="$(pick_fastest "Node.js 镜像" \
  "https://npmmirror.com/mirrors/node/index.json" \
  "https://mirrors.ustc.edu.cn/node/index.json" \
  "https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/index.json" \
  "https://mirrors.cernet.edu.cn/nodejs-release/index.json" \
  "https://nodejs.org/dist/index.json"
)"
NODE_MIRROR="${NODE_MIRROR_TEST%/index.json}"

echo
echo "[4/7] 使用 fnm 安装 Node.js $NODE_VERSION ..."
eval "$(fnm env --shell bash)"
export FNM_NODE_DIST_MIRROR="$NODE_MIRROR"

fnm install "$NODE_VERSION"
fnm default "$NODE_VERSION"
fnm use "$NODE_VERSION"

echo
echo "[5/7] 测速 npm registry 并安装 Codex..."
NPM_REGISTRY_TEST="$(pick_fastest "npm registry" \
  "https://registry.npmmirror.com/-/ping" \
  "https://registry.npmjs.org/-/ping"
)"

case "$NPM_REGISTRY_TEST" in
  https://registry.npmmirror.com/*) NPM_REGISTRY="https://registry.npmmirror.com" ;;
  https://registry.npmjs.org/*) NPM_REGISTRY="https://registry.npmjs.org" ;;
  *) NPM_REGISTRY="$NPM_REGISTRY_TEST" ;;
esac

npm config set registry "$NPM_REGISTRY"
npm install -g @openai/codex@latest --registry="$NPM_REGISTRY"

echo
echo "[6/7] 写入 Codex 配置..."
write_codex_config

echo
echo "[7/7] 写入 shell 初始化并刷新当前终端..."
write_shell_init
eval "$(fnm env --shell bash)"
fnm use default >/dev/null 2>&1 || true

echo
echo "安装完成。"
echo "fnm 下载源：$FNM_URL"
echo "Node 镜像：$NODE_MIRROR"
echo "npm registry：$NPM_REGISTRY"
echo
echo "版本检查："
fnm --version
node -v
npm -v
codex --version || true

echo
echo "正在重进交互式终端会话，让 codex 直接可用..."

exec "${SHELL:-/bin/bash}" -i
'
```
