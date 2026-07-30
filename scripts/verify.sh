#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT"
pnpm --filter @lynx-capacitor/core typecheck
pnpm --filter @lynx-capacitor/demo exec tsc --noEmit
pnpm build:core
pnpm build:demo

"$ROOT/scripts/ios-build.sh"
