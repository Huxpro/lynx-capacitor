plugins {
    id("com.android.library")
}

val nodeModules = gradle.extensions.extraProperties
    .get("lynxCapacitorNodeModules") as File
val capacitorRoot = nodeModules
    .resolve("@capacitor/android/capacitor")
    .canonicalFile

if (!capacitorRoot.isDirectory) {
    throw GradleException(
        "@capacitor/android is not installed under the configured node_modules: $nodeModules",
    )
}

val generatedJava = layout.buildDirectory.dir("generated/capacitor-headless/java")
val prepareHeadlessCapacitor by tasks.registering(Sync::class) {
    from(capacitorRoot.resolve("src/main/java"))
    into(generatedJava)
    inputs.file(layout.projectDirectory.file("headless-capacitor.patch"))
    doLast {
        exec {
            workingDir(generatedJava.get().asFile)
            commandLine(
                "patch",
                "-p1",
                "--forward",
                "--input",
                layout.projectDirectory.file("headless-capacitor.patch").asFile.absolutePath,
            )
        }
    }
}

android {
    namespace = "com.getcapacitor.android"
    compileSdk = 36

    defaultConfig {
        minSdk = 24
        consumerProguardFiles(capacitorRoot.resolve("proguard-rules.pro"))
    }

    sourceSets.named("main") {
        manifest.srcFile(capacitorRoot.resolve("src/main/AndroidManifest.xml"))
        java.srcDirs(generatedJava, "src/main/java")
        assets.srcDir(capacitorRoot.resolve("src/main/assets"))
        res.srcDir(capacitorRoot.resolve("src/main/res"))
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }
}

tasks.named("preBuild").configure {
    dependsOn(prepareHeadlessCapacitor)
}

dependencies {
    implementation("androidx.activity:activity:1.11.0")
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("androidx.coordinatorlayout:coordinatorlayout:1.3.0")
    implementation("androidx.core:core:1.17.0")
    implementation("androidx.fragment:fragment:1.8.9")
    implementation("androidx.webkit:webkit:1.14.0")
    implementation("org.apache.cordova:framework:14.0.1")
}
