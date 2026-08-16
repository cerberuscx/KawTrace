#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"
port="${KAWTRACE_PORT:-8080}"
printf 'KawTrace: http://127.0.0.1:%s/\n' "$port"
exec python3 -m http.server "$port" --bind 127.0.0.1
