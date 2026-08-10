#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APK="$ROOT/android/Demo/app/build/outputs/apk/debug/app-debug.apk"
PACKAGE="org.lynxcapacitor.demo"
ACTIVITY="$PACKAGE/.MainActivity"
ADB="${ADB:-adb}"

"$ROOT/scripts/android-build.sh"

ADB_ARGS=()
if [[ -n "${ANDROID_SERIAL:-}" ]]; then
  ADB_ARGS=(-s "$ANDROID_SERIAL")
fi

"$ADB" "${ADB_ARGS[@]}" install -r "$APK"
"$ADB" "${ADB_ARGS[@]}" shell am force-stop "$PACKAGE"
"$ADB" "${ADB_ARGS[@]}" shell am start -W -n "$ACTIVITY"
