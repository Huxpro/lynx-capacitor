pluginManagement {
    includeBuild("../../plugins/gradle-lynx-capacitor")
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id("org.lynxcapacitor.settings")
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_PROJECT)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "LynxCapacitorDemo"
include(":app")

lynxCapacitor {
    nodeModulesPath = "../../demo/node_modules"
}
