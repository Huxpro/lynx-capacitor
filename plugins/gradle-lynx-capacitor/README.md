# Lynx Capacitor Gradle autolink

This build supplies two Gradle plugins:

- `org.lynxcapacitor.settings` scans `node_modules`, includes the runtime,
  `@capacitor/android`, and every package that declares `capacitor.android`.
- `org.lynxcapacitor.autolink` adds those projects to an Android app and
  generates the Capacitor plugin and Lynx NativeModule registries.

## Use from source

```kotlin
// settings.gradle.kts
pluginManagement {
  includeBuild("../node_modules/@lynx-capacitor/gradle-lynx-capacitor")
}
plugins { id("org.lynxcapacitor.settings") }

include(":app")
lynxCapacitor {
  nodeModulesPath = "../node_modules"
  include.add("@capacitor/device") // optional allow-list
  exclude.add("@capacitor/local-llm") // optional deny-list
}
```

```kotlin
// app/build.gradle.kts
plugins {
  id("com.android.application")
  id("org.lynxcapacitor.autolink")
}
```

Paths are canonicalized, so pnpm's symlinked package layout is supported. A
package without Android sources is skipped. Bundled AARs under a plugin's
`android/src/main/libs` are exposed through a flat directory repository.

## Build and publish locally

```bash
./gradlew test publishToMavenLocal
```

The current coordinate is
`org.lynxcapacitor:gradle-lynx-capacitor:0.1.0`. The Android Demo uses an
included build so local development always tests the current source.
