Pod::Spec.new do |spec|
  spec.name = 'SocketRocket'
  spec.version = '0.7.1'
  spec.summary = 'Local SocketRocket source reused for the Lynx Capacitor demo.'
  spec.homepage = 'https://github.com/facebook/SocketRocket'
  spec.license = { :type => 'BSD', :file => 'LICENSE' }
  spec.author = 'Meta'
  spec.source = { :path => '.' }
  spec.ios.deployment_target = '9.0'
  spec.source_files = 'SocketRocket/**/*.{h,m}'
  spec.public_header_files = 'SocketRocket/*.h'
  spec.frameworks = 'Foundation', 'Security', 'CFNetwork'
  spec.requires_arc = true
end
