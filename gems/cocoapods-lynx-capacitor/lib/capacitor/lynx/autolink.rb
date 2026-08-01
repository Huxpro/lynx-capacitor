# Resolves Capacitor plugin pods out of node_modules so a Podfile does not have
# to name them one by one.
#
# This is the Capacitor half of the lynx-capacitor autolink story.
# `cocoapods-lynx-library` links the Lynx native library that hosts the bridge;
# this plugin links the Capacitor plugin pods the bridge dispatches to. Neither
# can do the other's job: a podspec cannot declare `:path` dependencies, so the
# plugin pods have to be named in the Podfile, and most Capacitor 8 plugins are
# either missing from CocoaPods trunk or lag npm badly, so a version-based
# dependency is not a substitute.
#
# Plugin detection matches the Capacitor CLI: a package is a plugin when its
# package.json carries a `capacitor` key.

require 'json'

module Capacitor
  module Lynx
    # package_dir is the path as found under node_modules and is what lands in
    # the Podfile. resolved_dir follows symlinks and is used only for identity:
    # under pnpm the real path embeds the version and a dependency hash, so
    # declaring it would rewrite Podfile.lock on every version bump.
    PluginInfo = Struct.new(:npm_name, :package_dir, :resolved_dir, :pod_name, :podspec_path)
    SkippedPackage = Struct.new(:npm_name, :reason)

    # How far up from the starting directory to look for node_modules. Matches
    # cocoapods-lynx-library so both plugins agree on what "the app" is.
    NODE_MODULES_SEARCH_DEPTH = 6

    # @capacitor/ios is the runtime, not a plugin: it has no `capacitor` key in
    # package.json and ships two podspecs at its package root.
    RUNTIME_PACKAGE = '@capacitor/ios'.freeze
    RUNTIME_POD_NAMES = %w[Capacitor CapacitorCordova].freeze

    class Autolink
      class << self
        # Declares every discovered Capacitor pod on the given Podfile.
        #
        # @param podfile [Pod::Podfile::TargetDefinition] receives `pod` calls
        # @option options [String] :root where to start looking for node_modules
        # @option options [Array<String>] :include only link these npm packages
        # @option options [Array<String>] :exclude never link these npm packages
        # @option options [Boolean] :runtime also link Capacitor/CapacitorCordova
        # @return [Array<PluginInfo>] what was linked, in declaration order
        def install!(podfile, options = {})
          root = File.expand_path(options[:root] || Dir.pwd)
          resolution = resolve(root, options)

          resolution[:skipped].each do |skipped|
            warn_once("[lynx-capacitor] skipping #{skipped.npm_name}: #{skipped.reason}")
          end

          resolution[:pods].each do |plugin|
            podfile.pod plugin.pod_name, :path => plugin.package_dir
          end
          resolution[:pods]
        end

        # The pure half of install!, so callers (and tests) can inspect what
        # would be declared without a Podfile.
        #
        # @return [Hash] :pods => Array<PluginInfo>, :skipped => Array<SkippedPackage>
        def resolve(root, options = {})
          root = File.expand_path(root)
          packages = discover_packages(root)

          pods = []
          skipped = []

          if options.fetch(:runtime, true)
            runtime = packages[RUNTIME_PACKAGE]
            if runtime
              pods.concat(runtime_pods(runtime))
            else
              skipped << SkippedPackage.new(
                RUNTIME_PACKAGE,
                'not installed; declare `pod \'Capacitor\'` yourself or pass :runtime => false'
              )
            end
          end

          plugin_packages(packages, options).each do |npm_name, package_dir|
            podspec_path = find_podspec(package_dir)
            if podspec_path.nil?
              # @capacitor/motion is the standing example: published with a
              # `capacitor` key but no iOS implementation yet.
              skipped << SkippedPackage.new(npm_name, 'no iOS podspec in the package')
              next
            end
            pods << PluginInfo.new(npm_name, package_dir, real_path(package_dir),
                                   pod_name_from(podspec_path), podspec_path)
          end

          { :pods => dedupe(pods, skipped), :skipped => skipped }
        end

        private

        def plugin_packages(packages, options)
          included = normalize_list(options[:include])
          excluded = normalize_list(options[:exclude])

          packages.reject { |npm_name, _dir| npm_name == RUNTIME_PACKAGE }
                  .select { |npm_name, dir| capacitor_plugin?(dir) && npm_name != RUNTIME_PACKAGE }
                  .reject { |npm_name, _dir| excluded.include?(npm_name) }
                  .select { |npm_name, _dir| included.empty? || included.include?(npm_name) }
                  .sort_by { |npm_name, _dir| npm_name }
        end

        def normalize_list(value)
          Array(value).map(&:to_s)
        end

        # A package is a Capacitor plugin when package.json has a `capacitor`
        # key -- the same test the Capacitor CLI applies.
        def capacitor_plugin?(package_dir)
          manifest = read_package_json(package_dir)
          return false if manifest.nil?

          capacitor = manifest['capacitor']
          return false unless capacitor.is_a?(Hash)

          # An `ios` entry is not required to be present for the pod to exist,
          # but a package that opts out of iOS entirely has nothing to link.
          !capacitor.key?('ios') || capacitor['ios'].is_a?(Hash)
        end

        def runtime_pods(package_dir)
          RUNTIME_POD_NAMES.filter_map do |pod_name|
            podspec_path = File.join(package_dir, "#{pod_name}.podspec")
            next unless File.file?(podspec_path)
            PluginInfo.new(RUNTIME_PACKAGE, package_dir, real_path(package_dir),
                           pod_name, podspec_path)
          end
        end

        # Capacitor plugins put `<PodName>.podspec` at the package root. The
        # `capacitor.ios.src` directory holds sources, not the podspec, but it
        # is checked as a fallback for plugins that lay themselves out that way.
        def find_podspec(package_dir)
          candidates = Dir[File.join(package_dir, '*.podspec')].sort
          return candidates.first if candidates.any?

          manifest = read_package_json(package_dir)
          src = manifest && manifest.dig('capacitor', 'ios', 'src')
          return nil if src.nil?

          src_dir = File.expand_path(src, package_dir)
          return nil unless File.directory?(src_dir)

          Dir[File.join(src_dir, '*.podspec')].sort.first
        end

        def pod_name_from(podspec_path)
          match = File.read(podspec_path).match(/\.name\s*=\s*['"]([^'"]+)['"]/)
          match ? match[1] : File.basename(podspec_path, '.podspec')
        end

        # CocoaPods raises on a duplicate pod name, and the same plugin can be
        # reachable through more than one node_modules. Nearest wins.
        def dedupe(pods, skipped)
          seen = {}
          pods.each_with_object([]) do |plugin, kept|
            existing = seen[plugin.pod_name]
            if existing
              if existing.resolved_dir != plugin.resolved_dir
                skipped << SkippedPackage.new(
                  plugin.npm_name,
                  "#{plugin.pod_name} already linked from #{existing.package_dir}"
                )
              end
              next
            end
            seen[plugin.pod_name] = plugin
            kept << plugin
          end
        end

        # Maps npm package name => realpath of its directory, nearest first.
        def discover_packages(start_dir)
          packages = {}
          node_modules_dirs(start_dir).each do |node_modules|
            each_package_dir(node_modules) do |npm_name, package_dir|
              packages[npm_name] ||= package_dir
            end
          end
          packages
        end

        def node_modules_dirs(start_dir)
          dirs = []
          current = File.expand_path(start_dir)
          NODE_MODULES_SEARCH_DEPTH.times do
            candidate = File.join(current, 'node_modules')
            dirs << candidate if File.directory?(candidate)
            parent = File.dirname(current)
            break if parent == current
            current = parent
          end
          dirs.uniq
        end

        def each_package_dir(node_modules)
          Dir.children(node_modules).sort.each do |name|
            next if name.start_with?('.')
            path = File.join(node_modules, name)
            next unless File.directory?(path)

            if name.start_with?('@')
              Dir.children(path).sort.each do |scoped_name|
                scoped_path = File.join(path, scoped_name)
                next unless File.directory?(scoped_path)
                yield "#{name}/#{scoped_name}", scoped_path
              end
            else
              yield name, path
            end
          end
        end

        # Identity only -- see PluginInfo. pnpm and npm workspaces symlink
        # packages, so two node_modules entries can be the same package.
        def real_path(path)
          File.realpath(path)
        rescue SystemCallError
          File.expand_path(path)
        end

        def read_package_json(package_dir)
          manifest_path = File.join(package_dir, 'package.json')
          return nil unless File.file?(manifest_path)
          JSON.parse(File.read(manifest_path))
        rescue JSON::ParserError
          nil
        end

        def warn_once(message)
          @warned ||= {}
          return if @warned[message]
          @warned[message] = true

          if defined?(Pod::UI)
            Pod::UI.warn(message)
          else
            Kernel.warn(message)
          end
        end
      end
    end
  end
end
