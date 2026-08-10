package org.lynxcapacitor.gradle;

import groovy.json.JsonSlurper;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

final class CapacitorScanner {
    private static final Pattern PACKAGE = Pattern.compile("\\bpackage\\s+([A-Za-z0-9_.]+)\\s*;?");
    private static final Pattern PLUGIN_CLASS = Pattern.compile(
        "@CapacitorPlugin(?:\\s*\\([^)]*\\))?[\\s\\S]{0,500}?\\b(?:public\\s+)?(?:final\\s+)?(?:class|object)\\s+([A-Za-z0-9_]+)"
    );

    private CapacitorScanner() {}

    static File resolveNodeModules(File base, String configuredPath) {
        if (configuredPath != null && !configuredPath.isBlank()) {
            File configured = new File(configuredPath);
            if (!configured.isAbsolute()) configured = new File(base, configuredPath);
            return canonical(configured);
        }
        for (File cursor = base; cursor != null; cursor = cursor.getParentFile()) {
            File candidate = new File(cursor, "node_modules");
            if (candidate.isDirectory()) return canonical(candidate);
        }
        return canonical(new File(base, "node_modules"));
    }

    static List<CapacitorPackage> scan(File nodeModules, Set<String> includes, Set<String> excludes) {
        List<File> packageDirs = listPackageDirs(nodeModules);
        List<CapacitorPackage> result = new ArrayList<>();
        for (File packageDir : packageDirs) {
            File packageJson = new File(packageDir, "package.json");
            if (!packageJson.isFile()) continue;
            try {
                Object parsed = new JsonSlurper().parse(packageJson);
                if (!(parsed instanceof Map<?, ?> json)) continue;
                String name = String.valueOf(json.get("name"));
                if (!selected(name, includes, excludes)) continue;
                Object capacitorValue = json.get("capacitor");
                if (!(capacitorValue instanceof Map<?, ?> capacitor)) continue;
                Object androidValue = capacitor.get("android");
                if (!(androidValue instanceof Map<?, ?> android)) continue;
                Object srcValue = android.get("src");
                String src = srcValue == null ? "android" : String.valueOf(srcValue);
                File androidDir = canonical(new File(packageDir, src));
                if (!androidDir.isDirectory()) continue;
                String projectStem = name.startsWith("@capacitor/")
                    ? name.substring("@capacitor/".length())
                    : name.replaceFirst("^@", "").replaceAll("[^A-Za-z0-9]+", "-");
                String projectName = "capacitor-" + projectStem;
                result.add(new CapacitorPackage(name, canonical(packageDir), androidDir, projectName, scanPluginClasses(androidDir)));
            } catch (Exception ignored) {
                // A malformed third-party package should not break every Android build.
            }
        }
        result.sort(Comparator.comparing(CapacitorPackage::name));
        return result;
    }

    static List<String> scanPluginClasses(File androidDir) throws IOException {
        Set<String> classes = new LinkedHashSet<>();
        try (Stream<java.nio.file.Path> paths = Files.walk(androidDir.toPath())) {
            paths.filter(Files::isRegularFile)
                .filter(path -> path.toString().endsWith(".java") || path.toString().endsWith(".kt"))
                .sorted()
                .forEach(path -> {
                    try {
                        String source = Files.readString(path, StandardCharsets.UTF_8);
                        Matcher packageMatcher = PACKAGE.matcher(source);
                        Matcher classMatcher = PLUGIN_CLASS.matcher(source);
                        if (packageMatcher.find() && classMatcher.find()) {
                            classes.add(packageMatcher.group(1) + "." + classMatcher.group(1));
                        }
                    } catch (IOException ignored) {
                        // Continue scanning other plugins and report the missing class at runtime.
                    }
                });
        }
        return List.copyOf(classes);
    }

    private static boolean selected(String name, Set<String> includes, Set<String> excludes) {
        String shortName = name.substring(name.lastIndexOf('/') + 1);
        if (excludes.contains(name) || excludes.contains(shortName)) return false;
        return includes.isEmpty() || includes.contains(name) || includes.contains(shortName);
    }

    private static List<File> listPackageDirs(File nodeModules) {
        if (!nodeModules.isDirectory()) return List.of();
        List<File> dirs = new ArrayList<>();
        File[] children = nodeModules.listFiles(File::isDirectory);
        if (children == null) return dirs;
        for (File child : children) {
            if (child.getName().startsWith("@")) {
                File[] scoped = child.listFiles(File::isDirectory);
                if (scoped != null) dirs.addAll(List.of(scoped));
            } else if (!child.getName().startsWith(".")) {
                dirs.add(child);
            }
        }
        return dirs;
    }

    private static File canonical(File file) {
        try {
            return file.getCanonicalFile();
        } catch (IOException ignored) {
            return file.getAbsoluteFile();
        }
    }
}
