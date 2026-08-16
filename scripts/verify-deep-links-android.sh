#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERIAL="${1:?Usage: scripts/verify-deep-links-android.sh <adb-serial>}"
APK="$ROOT/android/Demo/app/build/outputs/apk/debug/app-debug.apk"
PACKAGE="org.lynxcapacitor.demo"
COLD_URL="lynxcapacitor://demo/cold?source=verify-script"
WARM_URL="lynxcapacitor://demo/warm?source=verify-script"

if [[ ! -f "$APK" ]]; then
  echo "APK not found: $APK" >&2
  echo "Run pnpm android:build first." >&2
  exit 1
fi

wait_for_log() {
  local expected="$1"
  local attempt
  local logs=""
  for attempt in {1..30}; do
    logs="$(adb -s "$SERIAL" logcat -d -v brief \
      'LynxCapacitor:I' 'Capacitor/AppPlugin:V' 'lynx:I' '*:S')"
    if [[ "$logs" == *"$expected"* ]]; then
      return 0
    fi
    sleep 1
  done
  echo "Timed out waiting for log: $expected" >&2
  echo "$logs" >&2
  return 1
}

adb -s "$SERIAL" install -r "$APK"

adb -s "$SERIAL" logcat -c
adb -s "$SERIAL" shell am force-stop "$PACKAGE"
adb -s "$SERIAL" shell am start -W \
  -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "$COLD_URL" \
  -p "$PACKAGE"
wait_for_log "LC_DEEP_LINK source=cold start url=$COLD_URL"
echo "PASS cold start: App.getLaunchUrl() returned $COLD_URL"

adb -s "$SERIAL" logcat -c
adb -s "$SERIAL" shell am start -W \
  -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "$WARM_URL" \
  -p "$PACKAGE"
wait_for_log "LC_DEEP_LINK android delivered"
wait_for_log "LC_DEEP_LINK source=warm event url=$WARM_URL"
echo "PASS warm start: appUrlOpen emitted $WARM_URL"
