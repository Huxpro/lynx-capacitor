package org.lynxcapacitor.gradle;

import java.io.File;
import java.util.List;
import org.gradle.api.Plugin;
import org.gradle.api.initialization.Settings;

public final class LynxCapacitorSettingsPlugin implements Plugin<Settings> {
    @Override
    public void apply(Settings settings) {
        LynxCapacitorExtension extension = settings.getExtensions().create(
            "lynxCapacitor",
            LynxCapacitorExtension.class
        );
        settings.getGradle().settingsEvaluated(ignored -> configure(settings, extension));
    }

    private void configure(Settings settings, LynxCapacitorExtension extension) {
        File nodeModules = CapacitorScanner.resolveNodeModules(
            settings.getSettingsDir(),
            configuredPath(settings, extension)
        );
        File runtime = new File(nodeModules, "@lynx-capacitor/runtime/android");
        if (!runtime.isDirectory()) {
            throw new IllegalStateException(
                "@lynx-capacitor/runtime Android sources were not found under " + nodeModules
            );
        }

        include(settings, ":capacitor-android", new File(runtime, "capacitor-headless"));
        include(settings, ":lynx-capacitor-runtime", runtime);

        List<CapacitorPackage> packages = CapacitorScanner.scan(
            nodeModules,
            extension.getInclude(),
            extension.getExclude()
        );
        for (CapacitorPackage plugin : packages) {
            include(settings, ":" + plugin.projectName(), plugin.androidDir());
        }
        settings.getDependencyResolutionManagement().getRepositories().flatDir(repository -> {
            for (CapacitorPackage plugin : packages) {
                File bundledLibraries = new File(plugin.androidDir(), "src/main/libs");
                if (bundledLibraries.isDirectory()) repository.dirs(bundledLibraries);
            }
        });
        settings.getGradle().getExtensions().getExtraProperties().set(
            "lynxCapacitorPackages",
            packages
        );
        settings.getGradle().getExtensions().getExtraProperties().set(
            "lynxCapacitorNodeModules",
            nodeModules
        );
    }

    private String configuredPath(Settings settings, LynxCapacitorExtension extension) {
        Object property = settings.getProviders().gradleProperty("lynxCapacitor.nodeModules").getOrNull();
        return property != null ? String.valueOf(property) : extension.getNodeModulesPath();
    }

    private void include(Settings settings, String path, File directory) {
        settings.include(path);
        settings.project(path).setProjectDir(directory);
    }
}
