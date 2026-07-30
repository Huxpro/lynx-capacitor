require 'json'

Pod::Spec.new do |spec|
  spec.name = 'LynxCapacitorRuntime'
  spec.version = '0.1.0'
  spec.summary = 'Capacitor iOS runtime adapted to the Lynx NativeModule transport.'
  spec.homepage = 'https://github.com/lynx-family'
  spec.license = { :type => 'MIT' }
  spec.author = { 'Lynx Capacitor Authors' => 'noreply@example.com' }
  spec.source = { :path => '.' }
  spec.ios.deployment_target = '15.0'
  spec.swift_version = '5.9'
  spec.source_files = 'runtime/**/*.swift'
  spec.dependency 'Capacitor'

  repository_root = File.expand_path('../..', __dir__)
  plugins = JSON.parse(File.read(File.join(repository_root, 'plugins.json')))
  plugins.each do |plugin|
    spec.dependency plugin['pod']
  end
  spec.framework = 'CoreMotion'
end
