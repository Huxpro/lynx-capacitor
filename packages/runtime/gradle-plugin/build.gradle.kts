plugins {
    `java-gradle-plugin`
}

group = "org.lynxcapacitor"
version = "0.1.1"

repositories {
    mavenCentral()
}

java {
    toolchain.languageVersion.set(JavaLanguageVersion.of(21))
}

gradlePlugin {
    plugins {
        create("settingsAutolink") {
            id = "org.lynxcapacitor.settings"
            implementationClass = "org.lynxcapacitor.gradle.LynxCapacitorSettingsPlugin"
        }
        create("buildAutolink") {
            id = "org.lynxcapacitor.autolink"
            implementationClass = "org.lynxcapacitor.gradle.LynxCapacitorBuildPlugin"
        }
    }
}

dependencies {
    testImplementation(gradleTestKit())
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.4")
}

tasks.test {
    useJUnitPlatform()
}
