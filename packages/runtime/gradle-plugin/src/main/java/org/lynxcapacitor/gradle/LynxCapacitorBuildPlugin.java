package org.lynxcapacitor.gradle;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import org.gradle.api.NamedDomainObjectContainer;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.Task;
import org.gradle.api.file.SourceDirectorySet;

public final class LynxCapacitorBuildPlugin implements Plugin<Project> {
    private static final String GENERATED_PACKAGE = "com.lynxcapacitor.generated";
    private static final String GENERATED_CLASS = "LynxCapacitorPluginRegistry";

    @Override
    public void apply(Project project) {
        project.getPluginManager().withPlugin("com.android.application", ignored -> configure(project));
    }

    @SuppressWarnings("unchecked")
    private void configure(Project project) {
        Object value = project.getGradle().getExtensions().getExtraProperties().get("lynxCapacitorPackages");
        List<CapacitorPackage> packages = value instanceof List<?> list
            ? (List<CapacitorPackage>) list
            : List.of();

        project.getDependencies().add("implementation", project.project(":lynx-capacitor-runtime"));
        List<String> pluginClasses = new ArrayList<>();
        for (CapacitorPackage plugin : packages) {
            project.getDependencies().add("implementation", project.project(":" + plugin.projectName()));
            pluginClasses.addAll(plugin.pluginClasses());
        }

        File outputDir = new File(project.getLayout().getBuildDirectory().get().getAsFile(), "generated/lynx-capacitor/src");
        Task generate = project.getTasks().create("generateLynxCapacitorRegistry");
        generate.getOutputs().dir(outputDir);
        generate.getInputs().property("pluginClasses", pluginClasses);
        generate.doLast(task -> writeRegistry(outputDir, pluginClasses));
        project.getTasks().named("preBuild").configure(task -> task.dependsOn(generate));
        addJavaSourceDir(project, outputDir);
    }

    private void addJavaSourceDir(Project project, File outputDir) {
        try {
            Object android = project.getExtensions().getByName("android");
            Object sourceSetsValue = android.getClass().getMethod("getSourceSets").invoke(android);
            NamedDomainObjectContainer<?> sourceSets = (NamedDomainObjectContainer<?>) sourceSetsValue;
            Object main = sourceSets.getByName("main");
            Object java = main.getClass().getMethod("getJava").invoke(main);
            if (java instanceof SourceDirectorySet sourceDirectorySet) {
                sourceDirectorySet.srcDir(outputDir);
            } else {
                java.getClass().getMethod("srcDir", Object.class).invoke(java, outputDir);
            }
        } catch (ReflectiveOperationException error) {
            throw new IllegalStateException("Unable to attach the generated Capacitor registry", error);
        }
    }

    private void writeRegistry(File outputDir, List<String> classes) {
        File packageDir = new File(outputDir, GENERATED_PACKAGE.replace('.', '/'));
        if (!packageDir.isDirectory() && !packageDir.mkdirs()) {
            throw new IllegalStateException("Unable to create " + packageDir);
        }
        File source = new File(packageDir, GENERATED_CLASS + ".java");
        StringBuilder body = new StringBuilder();
        body.append("package ").append(GENERATED_PACKAGE).append(";\n\n")
            .append("import com.getcapacitor.Plugin;\n")
            .append("import java.util.Arrays;\n")
            .append("import java.util.List;\n\n")
            .append("public final class ").append(GENERATED_CLASS).append(" {\n")
            .append("  private ").append(GENERATED_CLASS).append("() {}\n\n")
            .append("  public static List<Class<? extends Plugin>> pluginClasses() {\n");
        if (classes.isEmpty()) {
            body.append("    return List.of();\n  }\n}\n");
            writeSources(packageDir, source, body.toString());
            return;
        }
        body.append("    return Arrays.asList(\n");
        for (int index = 0; index < classes.size(); index++) {
            body.append("      ").append(classes.get(index)).append(".class");
            body.append(index + 1 == classes.size() ? "\n" : ",\n");
        }
        body.append("    );\n  }\n}\n");
        writeSources(packageDir, source, body.toString());
    }

    private void writeSources(File packageDir, File source, String pluginRegistry) {
        try {
            Files.writeString(source.toPath(), pluginRegistry, StandardCharsets.UTF_8);
            File lynxRegistry = new File(packageDir, "LynxGeneratedLibraryRegistry.java");
            Files.writeString(lynxRegistry.toPath(), """
                package com.lynxcapacitor.generated;

                import com.lynx.tasm.LynxViewBuilder;
                import org.lynxcapacitor.runtime.LynxCapacitorBridge;

                public final class LynxGeneratedLibraryRegistry {
                  private LynxGeneratedLibraryRegistry() {}

                  public static void setup(LynxViewBuilder builder) {
                    builder.registerModule("CapacitorBridge", LynxCapacitorBridge.class);
                  }
                }
                """, StandardCharsets.UTF_8);
        } catch (IOException error) {
            throw new IllegalStateException("Unable to generate " + source, error);
        }
    }
}
