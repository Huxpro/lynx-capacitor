plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.lynxcapacitor.autolink")
}

android {
    namespace = "org.lynxcapacitor.demo"
    compileSdk = 36

    defaultConfig {
        applicationId = "org.lynxcapacitor.demo"
        minSdk = 28
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    kotlinOptions {
        jvmTarget = "21"
    }

    packaging {
        jniLibs.pickFirsts += setOf(
            "lib/*/libc++_shared.so",
            "lib/*/liblynx.so",
            "lib/*/liblynxtrace.so",
            "lib/*/libnapi.so",
        )
        resources.pickFirsts += "META-INF/*.kotlin_module"
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("com.facebook.fresco:animated-base:2.3.0")
    implementation("com.facebook.fresco:animated-gif:2.3.0")
    implementation("com.facebook.fresco:animated-webp:2.3.0")
    implementation("com.facebook.fresco:fresco:2.3.0")
    implementation("com.facebook.fresco:webpsupport:2.3.0")
    implementation("com.squareup.okhttp3:okhttp:4.9.0")
    implementation("org.lynxsdk.lynx:lynx:4.0.0")
    implementation("org.lynxsdk.lynx:lynx-jssdk:4.0.0")
    implementation("org.lynxsdk.lynx:lynx-service-http:4.0.0")
    implementation("org.lynxsdk.lynx:lynx-service-image:4.0.0")
    implementation("org.lynxsdk.lynx:lynx-service-log:4.0.0")
    implementation("org.lynxsdk.lynx:lynx-trace:4.0.0")
    implementation("org.lynxsdk.lynx:primjs:4.0.0")
}
