#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT/android/Demo"
BUNDLE="$ROOT/demo/dist/main.lynx.bundle"
ASSET="$ANDROID_DIR/app/src/main/assets/main.lynx.bundle"

cd "$ROOT"
pnpm build:core
pnpm build:demo
install -m 0644 "$BUNDLE" "$ASSET"

if [[ -x "$ANDROID_DIR/gradlew" ]]; then
  GRADLE="$ANDROID_DIR/gradlew"
elif command -v gradle >/dev/null 2>&1; then
  GRADLE="$(command -v gradle)"
else
  echo "Gradle 8.13 is required (the checked-in wrapper is missing)." >&2
  exit 1
fi

"$GRADLE" -p "$ANDROID_DIR" :app:assembleDebug
echo "APK: $ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
