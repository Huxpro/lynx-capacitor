require 'minitest/autorun'
require 'fileutils'
require 'tmpdir'
require 'json'

$LOAD_PATH.unshift File.expand_path('../lib', __dir__)
require 'cocoapods-lynx-capacitor'

# Records `pod` calls the way a Podfile target definition would.
class FakePodfile
  attr_reader :calls

  def initialize
    @calls = []
  end

  def pod(name, options = {})
    @calls << [name, options]
  end

  def pod_names
    @calls.map(&:first)
  end
end

class AutolinkTest < Minitest::Test
  def setup
    @root = Dir.mktmpdir('lynx-capacitor-autolink')
    @app = File.join(@root, 'app')
    FileUtils.mkdir_p(@app)
  end

  def teardown
    FileUtils.remove_entry(@root)
  end

  # -- helpers ---------------------------------------------------------------

  def add_package(npm_name, manifest: {}, podspec: nil, podspec_name: nil, node_modules: nil, files: {})
    base = node_modules || File.join(@app, 'node_modules')
    dir = File.join(base, npm_name)
    FileUtils.mkdir_p(dir)
    File.write(File.join(dir, 'package.json'),
               JSON.dump({ 'name' => npm_name, 'version' => '1.0.0' }.merge(manifest)))
    if podspec
      File.write(File.join(dir, "#{podspec}.podspec"),
                 "Pod::Spec.new do |s|\n  s.name = '#{podspec_name || podspec}'\nend\n")
    end
    files.each do |relative, contents|
      path = File.join(dir, relative)
      FileUtils.mkdir_p(File.dirname(path))
      File.write(path, contents)
    end
    dir
  end

  def plugin_manifest
    { 'capacitor' => { 'ios' => { 'src' => 'ios' }, 'android' => { 'src' => 'android' } } }
  end

  # Mimics how pnpm lays a workspace package out: a real directory somewhere
  # else, symlinked into node_modules.
  def symlink_package(npm_name, pod_name, target: 'shared-plugin')
    real = File.join(@root, 'packages', target)
    unless File.directory?(real)
      FileUtils.mkdir_p(real)
      File.write(File.join(real, 'package.json'),
                 JSON.dump({ 'name' => target }.merge(plugin_manifest)))
      File.write(File.join(real, "#{pod_name}.podspec"),
                 "Pod::Spec.new do |s|\n  s.name = '#{pod_name}'\nend\n")
    end

    scope, name = npm_name.split('/')
    link_base = File.join(@app, 'node_modules', scope)
    FileUtils.mkdir_p(link_base)
    link = File.join(link_base, name)
    File.symlink(real, link)
    link
  end

  def add_runtime(node_modules: nil)
    dir = add_package('@capacitor/ios', node_modules: node_modules)
    %w[Capacitor CapacitorCordova].each do |name|
      File.write(File.join(dir, "#{name}.podspec"), "Pod::Spec.new do |s|\n  s.name = '#{name}'\nend\n")
    end
    dir
  end

  def install(options = {})
    podfile = FakePodfile.new
    Capacitor::Lynx::Autolink.install!(podfile, { :root => @app }.merge(options))
    podfile
  end

  # -- tests -----------------------------------------------------------------

  def test_links_packages_with_a_capacitor_manifest
    add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')
    add_package('@capacitor/preferences', manifest: plugin_manifest, podspec: 'CapacitorPreferences')

    podfile = install(:runtime => false)

    assert_equal %w[CapacitorDevice CapacitorPreferences], podfile.pod_names
  end

  def test_ignores_packages_without_a_capacitor_manifest
    add_package('lodash', podspec: 'Lodash')
    add_package('@lynx-js/react')

    assert_empty install(:runtime => false).pod_names
  end

  def test_points_path_at_the_package_directory
    dir = add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')

    _name, options = install(:runtime => false).calls.first

    assert_equal dir, options[:path]
  end

  def test_reads_the_pod_name_from_the_podspec_not_the_filename
    add_package('@capacitor/thing', manifest: plugin_manifest,
                                    podspec: 'FileName', podspec_name: 'DeclaredPodName')

    assert_equal %w[DeclaredPodName], install(:runtime => false).pod_names
  end

  def test_skips_plugins_that_ship_no_ios_podspec
    # @capacitor/motion is published with a capacitor key but no iOS pod.
    add_package('@capacitor/motion', manifest: { 'capacitor' => {} })
    add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')

    result = Capacitor::Lynx::Autolink.resolve(@app, :runtime => false)

    assert_equal %w[CapacitorDevice], result[:pods].map(&:pod_name)
    assert_equal ['@capacitor/motion'], result[:skipped].map(&:npm_name)
  end

  def test_links_the_capacitor_runtime_pods_by_default
    add_runtime
    add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')

    # Runtime first: plugin podspecs all declare `s.dependency 'Capacitor'`.
    assert_equal %w[Capacitor CapacitorCordova CapacitorDevice], install.pod_names
  end

  def test_runtime_can_be_opted_out
    add_runtime
    add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')

    assert_equal %w[CapacitorDevice], install(:runtime => false).pod_names
  end

  def test_capacitor_ios_is_never_treated_as_a_plugin
    add_runtime

    # It has no `capacitor` key, so it must not be picked up twice.
    assert_equal %w[Capacitor CapacitorCordova], install.pod_names
  end

  def test_include_acts_as_an_allowlist
    add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')
    add_package('@capacitor/camera', manifest: plugin_manifest, podspec: 'CapacitorCamera')

    podfile = install(:runtime => false, :include => ['@capacitor/camera'])

    assert_equal %w[CapacitorCamera], podfile.pod_names
  end

  def test_exclude_acts_as_a_denylist
    add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')
    add_package('@capacitor/camera', manifest: plugin_manifest, podspec: 'CapacitorCamera')

    podfile = install(:runtime => false, :exclude => ['@capacitor/camera'])

    assert_equal %w[CapacitorDevice], podfile.pod_names
  end

  def test_searches_ancestor_node_modules
    add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice',
                                     node_modules: File.join(@root, 'node_modules'))

    assert_equal %w[CapacitorDevice], install(:runtime => false).pod_names
  end

  def test_nearest_node_modules_wins_on_duplicates
    near = add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')
    add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice',
                                     node_modules: File.join(@root, 'node_modules'))

    _name, options = install(:runtime => false).calls.first

    assert_equal near, options[:path]
  end

  def test_a_pod_name_is_never_declared_twice
    add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')
    # A fork under a different npm name that ships the same pod would otherwise
    # make CocoaPods raise on a duplicate declaration.
    add_package('@fork/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')

    result = Capacitor::Lynx::Autolink.resolve(@app, :runtime => false)

    assert_equal %w[CapacitorDevice], result[:pods].map(&:pod_name)
    assert_equal ['@fork/device'], result[:skipped].map(&:npm_name)
  end

  # pnpm's real paths embed the version and a dependency hash
  # (.pnpm/@capacitor+device@8.0.3_@capacitor+core@8.4.2/...), so declaring
  # them would rewrite Podfile.lock on every dependency bump.
  def test_declares_the_node_modules_path_not_the_symlink_target
    link = symlink_package('@scope/my-plugin', 'MyPlugin')

    _name, options = install(:runtime => false).calls.first

    assert_equal link, options[:path]
  end

  def test_one_package_reachable_through_two_symlinks_is_declared_once
    symlink_package('@scope/my-plugin', 'MyPlugin')
    symlink_package('@alias/my-plugin', 'MyPlugin')

    result = Capacitor::Lynx::Autolink.resolve(@app, :runtime => false)

    assert_equal %w[MyPlugin], result[:pods].map(&:pod_name)
    # Same package under two names is not a conflict, so nothing to report --
    # unlike two distinct packages claiming one pod name.
    assert_empty result[:skipped]
  end

  def test_ordering_is_deterministic
    %w[zeta alpha middle].each do |name|
      add_package("@capacitor/#{name}", manifest: plugin_manifest, podspec: "Capacitor#{name.capitalize}")
    end

    assert_equal %w[CapacitorAlpha CapacitorMiddle CapacitorZeta], install(:runtime => false).pod_names
  end

  def test_missing_runtime_is_reported_rather_than_silently_dropped
    add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')

    result = Capacitor::Lynx::Autolink.resolve(@app)

    assert_equal ['@capacitor/ios'], result[:skipped].map(&:npm_name)
  end

  def test_falls_back_to_a_podspec_under_the_ios_source_dir
    add_package('@capacitor/odd', manifest: plugin_manifest,
                                  files: { 'ios/OddPlugin.podspec' => "Pod::Spec.new do |s|\n  s.name = 'OddPlugin'\nend\n" })

    assert_equal %w[OddPlugin], install(:runtime => false).pod_names
  end

  def test_tolerates_unparseable_package_json
    dir = File.join(@app, 'node_modules', 'broken')
    FileUtils.mkdir_p(dir)
    File.write(File.join(dir, 'package.json'), '{ not json')
    add_package('@capacitor/device', manifest: plugin_manifest, podspec: 'CapacitorDevice')

    assert_equal %w[CapacitorDevice], install(:runtime => false).pod_names
  end
end
