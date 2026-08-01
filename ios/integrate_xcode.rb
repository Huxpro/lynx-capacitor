require "xcodeproj"

REPO_ROOT = File.expand_path("..", __dir__)
LYNX_ROOT = ENV.fetch("LYNX_ROOT", File.expand_path("../lynx", REPO_ROOT))
PROJECT = File.join(LYNX_ROOT, "explorer/darwin/ios/lynx_explorer/LynxExplorer.xcodeproj")
CAP_IOS = File.join(REPO_ROOT, "packages/runtime/ios/src")
TARGET_NAME = "LynxExplorer"

proj = Xcodeproj::Project.open(PROJECT)
target = proj.targets.find { |t| t.name == TARGET_NAME }
raise "target not found" unless target

# Remove any prior LynxCapacitor group so this script is idempotent.
existing = proj.main_group.children.find { |c| c.display_name == "LynxCapacitor" }
if existing
  # Remove build files referencing these paths first.
  files_to_remove = []
  existing.recursive_children.each do |c|
    files_to_remove << c if c.isa == "PBXFileReference"
  end
  files_to_remove.each do |fr|
    target.source_build_phase.files.dup.each do |bf|
      if bf.file_ref == fr
        target.source_build_phase.remove_build_file(bf)
      end
    end
    fr.remove_from_project
  end
  existing.remove_from_project
end

group = proj.main_group.new_group("LynxCapacitor", nil)

# Collect the official-runtime bridge sources only.
sources = []
headers = []
Dir.glob("#{CAP_IOS}/*.{swift,m,mm,h}").sort.each do |path|
  if path.end_with?(".swift", ".m", ".mm")
    sources << path
  else
    headers << path
  end
end

added = []
(sources + headers).each do |path|
  ref = group.new_reference(path)
  if path.end_with?(".swift", ".m", ".mm")
    target.source_build_phase.add_file_reference(ref)
  end
  added << File.basename(path)
end

target.build_configurations.each do |config|
  config.build_settings["SWIFT_VERSION"] = "5.9"
  config.build_settings["IPHONEOS_DEPLOYMENT_TARGET"] = "15.0"
  config.build_settings.delete("GCC_PREFIX_HEADER")
  config.build_settings.delete("GCC_PRECOMPILE_PREFIX_HEADER")
end

proj.save
puts "Added #{added.length} files to #{TARGET_NAME}:"
added.each { |f| puts "  #{f}" }
