#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="$ROOT/ios/Demo"
SIMULATOR="${SIMULATOR:-iPhone 17 Pro}"

"$ROOT/scripts/ios-generate.sh"

xcodebuild \
  -workspace "$IOS_DIR/LynxCapacitorDemo.xcworkspace" \
  -scheme LynxCapacitorDemo \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination "platform=iOS Simulator,name=$SIMULATOR" \
  -derivedDataPath "$IOS_DIR/build" \
  build
