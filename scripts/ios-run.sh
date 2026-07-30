#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/ios/Demo/build/Build/Products/Debug-iphonesimulator/LynxCapacitorDemo.app"

"$ROOT/scripts/ios-build.sh"

xcrun simctl bootstatus booted -b
xcrun simctl install booted "$APP"
xcrun simctl terminate booted com.lynx.capacitordemo 2>/dev/null || true
xcrun simctl launch booted com.lynx.capacitordemo
