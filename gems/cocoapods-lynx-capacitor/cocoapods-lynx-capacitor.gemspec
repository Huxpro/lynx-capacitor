Gem::Specification.new do |spec|
  spec.name = 'cocoapods-lynx-capacitor'
  spec.version = '0.1.0'
  spec.summary = 'Links Capacitor plugin pods from node_modules into a Lynx app.'
  spec.description = <<~DESC
    A CocoaPods plugin that resolves Capacitor plugin pods out of node_modules,
    so a Lynx app running lynx-capacitor does not have to name each plugin in
    its Podfile. Companion to cocoapods-lynx-library, which links the Lynx
    native library hosting the Capacitor bridge.
  DESC
  spec.homepage = 'https://github.com/huxpro/lynx-capacitor'
  spec.license = 'MIT'
  spec.authors = ['Lynx Capacitor Authors']
  spec.email = ['noreply@example.com']

  spec.files = Dir['lib/**/*.rb'] + ['README.md']
  spec.require_paths = ['lib']
  spec.required_ruby_version = '>= 2.7'

  spec.metadata = {
    'source_code_uri' => 'https://github.com/huxpro/lynx-capacitor',
    'rubygems_mfa_required' => 'true'
  }
end
