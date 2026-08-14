#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT/android/Demo"

cd "$ROOT"
pnpm --filter @lynx-capacitor/core typecheck
pnpm --filter @lynx-capacitor/demo exec tsc --noEmit

"$ROOT/scripts/android-build.sh"
cmp "$ROOT/demo/dist/main.lynx.bundle" \
  "$ANDROID_DIR/app/src/main/assets/main.lynx.bundle"

"$ANDROID_DIR/gradlew" \
  -p "$ROOT/packages/runtime/gradle-plugin" \
  test

echo "Android verification passed."
