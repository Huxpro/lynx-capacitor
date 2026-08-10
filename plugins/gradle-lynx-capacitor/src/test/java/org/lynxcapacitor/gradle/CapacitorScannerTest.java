package org.lynxcapacitor.gradle;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class CapacitorScannerTest {
    @TempDir Path temporaryDirectory;

    @Test
    void findsAnnotatedJavaAndKotlinPlugins() throws Exception {
        Path javaSource = temporaryDirectory.resolve("src/main/java/demo/DevicePlugin.java");
        Files.createDirectories(javaSource.getParent());
        Files.writeString(javaSource, """
            package demo;
            @CapacitorPlugin(name = "Device")
            public class DevicePlugin extends Plugin {}
            """);
        Path kotlinSource = temporaryDirectory.resolve("src/main/kotlin/demo/CameraPlugin.kt");
        Files.createDirectories(kotlinSource.getParent());
        Files.writeString(kotlinSource, """
            package demo
            @CapacitorPlugin(name = "Camera")
            class CameraPlugin : Plugin()
            """);

        assertEquals(
            List.of("demo.DevicePlugin", "demo.CameraPlugin"),
            CapacitorScanner.scanPluginClasses(temporaryDirectory.toFile())
        );
    }

    @Test
    void scansPnpmStyleSymlinksAndAppliesFilters() throws Exception {
        Path storePackage = temporaryDirectory.resolve("store/device");
        Path android = storePackage.resolve("android/src/main/java/demo");
        Files.createDirectories(android);
        Files.writeString(storePackage.resolve("package.json"), """
            {"name":"@capacitor/device","capacitor":{"android":{"src":"android"}}}
            """);
        Files.writeString(android.resolve("DevicePlugin.java"), """
            package demo;
            @CapacitorPlugin(name = "Device") public class DevicePlugin extends Plugin {}
            """);
        Path nodeModules = temporaryDirectory.resolve("node_modules/@capacitor");
        Files.createDirectories(nodeModules);
        Files.createSymbolicLink(nodeModules.resolve("device"), storePackage);

        List<CapacitorPackage> found = CapacitorScanner.scan(
            temporaryDirectory.resolve("node_modules").toFile(), Set.of("device"), Set.of()
        );
        assertEquals(1, found.size());
        assertEquals("capacitor-device", found.getFirst().projectName());
        assertEquals(List.of("demo.DevicePlugin"), found.getFirst().pluginClasses());
        assertEquals(
            List.of(),
            CapacitorScanner.scan(
                temporaryDirectory.resolve("node_modules").toFile(), Set.of(), Set.of("@capacitor/device")
            )
        );
    }
}
