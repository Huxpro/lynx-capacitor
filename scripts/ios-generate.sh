#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="$ROOT/ios/Demo"

if [[ "${LYNX_CAPACITOR_USE_PUBLISHED:-false}" != "true" &&
      ! -d "${LYNX_ROOT:-$ROOT/../lynx}" ]]; then
  echo "Set LYNX_ROOT to a local lynx-family/lynx checkout." >&2
  exit 1
fi

cd "$ROOT"
pnpm install
pnpm build:core
pnpm build:demo
mkdir -p ios/Demo/LynxCapacitorDemo/Resource
cp demo/dist/main.lynx.bundle ios/Demo/LynxCapacitorDemo/Resource/main.lynxbin

cd "$IOS_DIR"
xcodegen generate
# The Podfile requires the cocoapods-lynx-library plugin; run CocoaPods through
# Bundler so the Gemfile pins it.
bundle check >/dev/null 2>&1 || bundle install
bundle exec pod install
