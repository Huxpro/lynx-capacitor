pluginManagement {
    if (providers.gradleProperty("lynxCapacitorUsePublished").orNull == "true") {
        val nodeModules = providers.gradleProperty("lynxCapacitor.nodeModules")
            .getOrElse("../../demo/node_modules")
        includeBuild("$nodeModules/@lynx-capacitor/runtime/gradle-plugin")
    } else {
        includeBuild("../../packages/runtime/gradle-plugin")
    }
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
