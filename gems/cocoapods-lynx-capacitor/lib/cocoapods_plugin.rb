require 'cocoapods-lynx-capacitor'

module Pod
  class Podfile
    module CapacitorLynxDSL
      # Links every Capacitor plugin found in node_modules.
      #
      #   plugin 'cocoapods-lynx-capacitor'
      #
      #   target 'App' do
      #     use_lynx_library!         # the bridge
      #     use_capacitor_plugins!    # the plugins it dispatches to
      #   end
      #
      # @option options [String] :root where to start looking for node_modules.
      #   Defaults to the Podfile's directory. Pass this when the app's
      #   package.json does not sit on the Podfile's ancestor path.
      # @option options [Array<String>] :include only link these npm packages
      # @option options [Array<String>] :exclude never link these npm packages
      # @option options [Boolean] :runtime also link Capacitor and
      #   CapacitorCordova from @capacitor/ios. Defaults to true; every plugin
      #   podspec depends on Capacitor, and that dependency can only be
      #   satisfied by a local path.
      def use_capacitor_plugins!(options = {})
        ::Capacitor::Lynx::Autolink.install!(self, options)
      end
    end

    include CapacitorLynxDSL

    module DSL
      include CapacitorLynxDSL
    end
  end
end
