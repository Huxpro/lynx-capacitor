package org.lynxcapacitor.gradle;

import java.io.File;
import java.util.List;

record CapacitorPackage(String name, File packageDir, File androidDir, String projectName, List<String> pluginClasses) {}
