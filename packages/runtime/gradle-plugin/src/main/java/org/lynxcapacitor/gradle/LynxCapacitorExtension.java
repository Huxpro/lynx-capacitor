package org.lynxcapacitor.gradle;

import java.util.LinkedHashSet;
import java.util.Set;

public class LynxCapacitorExtension {
    private String nodeModulesPath;
    private final Set<String> include = new LinkedHashSet<>();
    private final Set<String> exclude = new LinkedHashSet<>();

    public String getNodeModulesPath() {
        return nodeModulesPath;
    }

    public void setNodeModulesPath(String nodeModulesPath) {
        this.nodeModulesPath = nodeModulesPath;
    }

    public Set<String> getInclude() {
        return include;
    }

    public Set<String> getExclude() {
        return exclude;
    }
}
