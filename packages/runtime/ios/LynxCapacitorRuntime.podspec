Pod::Spec.new do |spec|
  spec.name = 'LynxCapacitorRuntime'
  spec.version = '0.1.0'
  spec.summary = 'Capacitor iOS runtime adapted to the Lynx NativeModule transport.'
  spec.homepage = 'https://github.com/huxpro/lynx-capacitor'
  spec.license = { :type => 'MIT' }
  spec.author = { 'Lynx Capacitor Authors' => 'noreply@example.com' }
  spec.source = { :path => '.' }
  spec.ios.deployment_target = '15.0'
  spec.swift_version = '5.9'
  spec.source_files = 'src/**/*.{h,m,swift}'
  spec.framework = 'CoreMotion'

  # Lynx provides the LynxModule protocol the bridge conforms to, and the
  # @LynxNativeModule annotation that the autolink registry scans for.
  spec.dependency 'Lynx'

  # Capacitor provides CAPBridgeProtocol / CAPPlugin. Plugin pods are
  # deliberately NOT declared here: a podspec cannot express `:path`
  # dependencies, and most Capacitor 8 plugins are either absent from
  # CocoaPods trunk or lag npm by several versions. They are linked from
  # node_modules by the `cocoapods-lynx-capacitor` Podfile plugin and picked
  # up at runtime by LynxCapacitorRuntime's plugin discovery.
  spec.dependency 'Capacitor'
end
