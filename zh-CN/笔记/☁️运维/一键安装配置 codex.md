```bash
bash -lc '
set -e

# ====== 只改这里 ======
BASE_URL=""
API_KEY=""
NODE_VERSION="22"
# =====================

MODEL="gpt-5.5"

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
      2*|3*)
        status="OK"
        ;;
      *)
        status="FAIL"
        t="999999"
        ;;
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
    echo "错误：$name 没有可用镜像。" >&2
    exit 1
  fi

  echo "选择 $name: $best_url" >&2
  printf "%s" "$best_url"
}

command -v curl >/dev/null 2>&1 || { echo "缺少 curl"; exit 1; }
command -v unzip >/dev/null 2>&1 || { echo "缺少 unzip"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "缺少 python3"; exit 1; }

echo "[1/6] 测速并安装 fnm..."

FNM_URL="$(pick_fastest "fnm 下载源" \
  "https://gh.llkk.cc/https://github.com/Schniz/fnm/releases/latest/download/fnm-linux.zip" \
  "https://gh-proxy.com/https://github.com/Schniz/fnm/releases/latest/download/fnm-linux.zip" \
  "https://hub.gitmirror.com/https://github.com/Schniz/fnm/releases/latest/download/fnm-linux.zip" \
  "https://github.com/Schniz/fnm/releases/latest/download/fnm-linux.zip"
)"

mkdir -p "$HOME/.local/bin"
TMP_DIR="$(mktemp -d)"
cd "$TMP_DIR"

curl -L --connect-timeout 10 --max-time 120 -o fnm-linux.zip "$FNM_URL"
unzip -o fnm-linux.zip >/dev/null
install -m 755 fnm "$HOME/.local/bin/fnm"

export PATH="$HOME/.local/bin:$PATH"

echo "[2/6] 测速 Node.js 镜像..."

NODE_MIRROR_TEST="$(pick_fastest "Node.js 镜像" \
  "https://npmmirror.com/mirrors/node/index.json" \
  "https://mirrors.ustc.edu.cn/node/index.json" \
  "https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/index.json" \
  "https://mirrors.cernet.edu.cn/nodejs-release/index.json" \
  "https://nodejs.org/dist/index.json"
)"

NODE_MIRROR="${NODE_MIRROR_TEST%/index.json}"

echo "[3/6] 使用 fnm 安装 Node.js $NODE_VERSION ..."

eval "$(fnm env --shell bash)"
export FNM_NODE_DIST_MIRROR="$NODE_MIRROR"

fnm install "$NODE_VERSION"
fnm default "$NODE_VERSION"
fnm use "$NODE_VERSION"

echo "[4/6] 测速 npm registry 并安装 Codex..."

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

echo "[5/6] 写入 Codex 配置..."

mkdir -p "$HOME/.codex"
chmod 700 "$HOME/.codex"

cat > "$HOME/.codex/config.toml" <<EOF
model_provider = "thirdparty"
model = "$MODEL"
model_reasoning_effort = "medium"
personality = "pragmatic"
approvals_reviewer = "user"
approval_policy = "never"
sandbox_mode = "danger-full-access"
service_tier = "fast"

[model_providers.thirdparty]
name = "thirdparty"
base_url = "$BASE_URL"
wire_api = "responses"
EOF

cat > "$HOME/.codex/auth.json" <<EOF
{
  "OPENAI_API_KEY": "$API_KEY"
}
EOF

chmod 600 "$HOME/.codex/config.toml" "$HOME/.codex/auth.json"

echo "[6/6] 写入 ~/.bashrc"

touch "$HOME/.bashrc"

if ! grep -q ">>> fnm / node / npm for codex >>>" "$HOME/.bashrc"; then
  cat >> "$HOME/.bashrc" <<'"'"'EOF'"'"'

# >>> fnm / node / npm for codex >>>
export PATH="$HOME/.local/bin:$PATH"
if command -v fnm >/dev/null 2>&1; then
  eval "$(fnm env --shell bash)"
  fnm use default >/dev/null 2>&1 || true
fi
# <<< fnm / node / npm for codex <<<
EOF
fi

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
echo "当前终端可以直接运行："
echo "codex"
echo
echo "新终端会自动加载 fnm/node/npm/codex，但不会 export OPENAI_API_KEY。"
'
```
