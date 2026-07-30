import Capacitor
import CoreMotion
import Foundation
import UIKit
import WebKit

@objcMembers
public final class LynxCapacitorRuntime: NSObject {
    private let runtime: CapacitorRuntime

    public override init() {
        runtime = CapacitorRuntime()
        super.init()
    }

    public func getPlatform() -> String {
        runtime.getPlatform()
    }

    public func getPluginHeaders() -> String {
        runtime.getPluginHeaders()
    }

    public func handleCall(_ payload: String, callback: @escaping (Any?) -> Void) {
        runtime.handleCall(payload, callback: callback)
    }
}

private final class CapacitorRuntime: NSObject, CAPBridgeProtocol {
    private var plugins: [String: CAPPlugin] = [:]
    private var storedCalls: [String: CAPPluginCall] = [:]
    private let lock = NSLock()

    public let config: InstanceConfiguration
    public let notificationRouter = NotificationRouter()

    public var webView: WKWebView?
    public var autoRegisterPlugins = false
    public var statusBarVisible = true
    public var statusBarStyle = UIStatusBarStyle.default
    public var statusBarAnimation = UIStatusBarAnimation.fade

    public var viewController: UIViewController? {
        Self.topViewController()
    }

    public func setStatusBarVisible(_ visible: Bool, animated: Bool) {
        statusBarVisible = visible
        UIView.animate(withDuration: animated ? 0.3 : 0, delay: 0, options: .curveEaseInOut) {
            self.viewController?.setNeedsStatusBarAppearanceUpdate()
        }
    }

    public func setStatusBarStyle(_ style: UIStatusBarStyle, animated: Bool) {
        statusBarStyle = style
        UIView.animate(withDuration: animated ? 0.3 : 0, delay: 0, options: .curveEaseInOut) {
            self.viewController?.setNeedsStatusBarAppearanceUpdate()
        }
    }

    public var isSimEnvironment: Bool {
#if targetEnvironment(simulator)
        true
#else
        false
#endif
    }

    public var isDevEnvironment: Bool {
#if DEBUG
        true
#else
        false
#endif
    }

    public var userInterfaceStyle: UIUserInterfaceStyle {
        viewController?.traitCollection.userInterfaceStyle ?? .unspecified
    }

    override init() {
        let descriptor = InstanceDescriptor(at: Bundle.main.bundleURL, configuration: nil, cordovaConfiguration: nil)
        descriptor.pluginConfigurations = [:]
        descriptor.handleApplicationNotifications = true
        config = InstanceConfiguration(with: descriptor, isDebug: true)
        super.init()

        UNUserNotificationCenter.current().delegate = notificationRouter
        registerOfficialPlugins()
    }

    func getPlatform() -> String {
        "ios"
    }

    private func registerOfficialPlugins() {
        let classNames = [
            "ActionSheetPlugin",
            "AppPlugin",
            "AppLauncherPlugin",
            "BackgroundRunnerPlugin",
            "CapacitorBarcodeScannerPlugin",
            "CAPBrowserPlugin",
            "CAPCameraPlugin",
            "ClipboardPlugin",
            "DevicePlugin",
            "DialogPlugin",
            "FileTransferPlugin",
            "FileViewerPlugin",
            "FilesystemPlugin",
            "GeolocationPlugin",
            "HapticsPlugin",
            "InAppBrowserPlugin",
            "KeyboardPlugin",
            "LocalLLMPlugin",
            "LocalNotificationsPlugin",
            "CAPNetworkPlugin",
            "PreferencesPlugin",
            "PrivacyScreenPlugin",
            "PushNotificationsPlugin",
            "ScreenOrientationPlugin",
            "ScreenReaderPlugin",
            "SharePlugin",
            "SplashScreenPlugin",
            "StatusBarPlugin",
            "TextZoomPlugin",
            "ToastPlugin",
            "CapacitorGoogleMapsPlugin",
            "LynxMotionPlugin",
            "CAPHttpPlugin",
            "CAPCookiesPlugin",
            "CAPSystemBarsPlugin"
        ]

        for className in classNames {
            guard let pluginType = NSClassFromString(className) as? CAPPlugin.Type else {
                continue
            }
            registerPluginType(pluginType)
        }
    }

    func getPluginHeaders() -> String {
        let headers = plugins.values.compactMap { plugin -> [String: Any]? in
            guard let bridged = plugin as? CAPBridgedPlugin else {
                return nil
            }
            var methods: [[String: Any]] = [
                ["name": "addListener", "rtype": "callback"],
                ["name": "removeListener", "rtype": "promise"],
                ["name": "removeAllListeners", "rtype": "promise"]
            ]
            methods.append(contentsOf: bridged.pluginMethods.map {
                ["name": $0.name, "rtype": $0.returnType ?? "none"]
            })
            return ["name": bridged.jsName, "methods": methods]
        }
        return Self.jsonString(headers) ?? "[]"
    }

    func handleCall(_ payload: String, callback: @escaping (Any?) -> Void) {
        guard
            let data = payload.data(using: .utf8),
            let message = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            callback(Self.resultJSON(
                callbackId: "-1",
                pluginId: "",
                methodName: "",
                success: false,
                error: ["message": "Invalid Capacitor call payload", "code": "INVALID_ARGUMENT"]
            ))
            return
        }

        let callbackId = message["callbackId"] as? String ?? "-1"
        let pluginId = message["pluginId"] as? String ?? ""
        let methodName = message["methodName"] as? String ?? ""
        let options = message["options"] as? [String: Any] ?? [:]

        guard let plugin = plugins[pluginId], let bridged = plugin as? CAPBridgedPlugin else {
            callback(Self.resultJSON(
                callbackId: callbackId,
                pluginId: pluginId,
                methodName: methodName,
                success: false,
                error: ["message": "Plugin \"\(pluginId)\" is not registered", "code": "UNIMPLEMENTED"]
            ))
            return
        }

        let selector: Selector
        if ["addListener", "removeListener", "removeAllListeners"].contains(methodName) {
            selector = NSSelectorFromString(methodName + ":")
        } else if let method = bridged.pluginMethods.first(where: { $0.name == methodName }) {
            selector = method.selector
        } else {
            callback(Self.resultJSON(
                callbackId: callbackId,
                pluginId: pluginId,
                methodName: methodName,
                success: false,
                error: ["message": "Method \"\(methodName)\" is not registered on \"\(pluginId)\"", "code": "UNIMPLEMENTED"]
            ))
            return
        }

        guard plugin.responds(to: selector) else {
            callback(Self.resultJSON(
                callbackId: callbackId,
                pluginId: pluginId,
                methodName: methodName,
                success: false,
                error: ["message": "Plugin \"\(pluginId)\" does not respond to \"\(methodName)\"", "code": "UNIMPLEMENTED"]
            ))
            return
        }

        guard let call = CAPPluginCall(
            callbackId: callbackId,
            methodName: methodName,
            options: JSTypes.coerceDictionaryToJSObject(
                options,
                formattingDatesAsStrings: plugin.shouldStringifyDatesInCalls
            ) ?? [:],
            success: { [weak self] result, call in
                guard let self else {
                    return
                }
                callback(Self.resultJSON(
                    callbackId: callbackId,
                    pluginId: pluginId,
                    methodName: methodName,
                    success: true,
                    data: result?.data ?? [:],
                    save: call?.keepAlive ?? false
                ))
                if call?.keepAlive == true, let call {
                    self.saveCall(call)
                }
            },
            error: { error in
                var errorPayload: [String: Any] = [
                    "message": error?.message ?? "",
                    "errorMessage": error?.message ?? ""
                ]
                if let code = error?.code {
                    errorPayload["code"] = code
                }
                if let data = error?.data {
                    errorPayload.merge(data) { current, _ in current }
                }
                callback(Self.resultJSON(
                    callbackId: callbackId,
                    pluginId: pluginId,
                    methodName: methodName,
                    success: false,
                    error: errorPayload
                ))
            }
        ) else {
            callback(Self.resultJSON(
                callbackId: callbackId,
                pluginId: pluginId,
                methodName: methodName,
                success: false,
                error: ["message": "Unable to create native plugin call", "code": "NATIVE_EXCEPTION"]
            ))
            return
        }

        DispatchQueue.main.async {
            plugin.perform(selector, with: call)
            if call.keepAlive {
                self.saveCall(call)
            }
        }
    }

    public func registerPluginType(_ pluginType: CAPPlugin.Type) {
        registerPluginInstance(pluginType.init())
    }

    public func registerPluginInstance(_ pluginInstance: CAPPlugin) {
        guard let bridged = pluginInstance as? CAPBridgedPlugin else {
            return
        }
        pluginInstance.bridge = self
        pluginInstance.webView = webView
        pluginInstance.shouldStringifyDatesInCalls = true
        pluginInstance.retainedEventArguments = [:]
        pluginInstance.eventListeners = [:]
        pluginInstance.pluginId = bridged.identifier
        pluginInstance.pluginName = bridged.jsName
        pluginInstance.load()
        plugins[bridged.jsName] = pluginInstance
    }

    public func plugin(withName: String) -> CAPPlugin? {
        plugins[withName]
    }

    public func saveCall(_ call: CAPPluginCall) {
        lock.withLock {
            storedCalls[call.callbackId] = call
        }
    }

    public func savedCall(withID: String) -> CAPPluginCall? {
        lock.withLock {
            storedCalls[withID]
        }
    }

    public func releaseCall(_ call: CAPPluginCall) {
        releaseCall(withID: call.callbackId)
    }

    public func releaseCall(withID: String) {
        lock.withLock {
            storedCalls.removeValue(forKey: withID)
        }
    }

    public func getSavedCall(_ callbackId: String) -> CAPPluginCall? {
        savedCall(withID: callbackId)
    }

    public func releaseCall(callbackId: String) {
        releaseCall(withID: callbackId)
    }

    public func getWebView() -> WKWebView? {
        webView
    }

    public func isSimulator() -> Bool {
        isSimEnvironment
    }

    public func isDevMode() -> Bool {
        isDevEnvironment
    }

    public func getStatusBarVisible() -> Bool {
        statusBarVisible
    }

    public func getStatusBarStyle() -> UIStatusBarStyle {
        statusBarStyle
    }

    public func getUserInterfaceStyle() -> UIUserInterfaceStyle {
        userInterfaceStyle
    }

    public func getLocalUrl() -> String {
        config.localURL.absoluteString
    }

    public func evalWithPlugin(_ plugin: CAPPlugin, js: String) {}

    public func eval(js: String) {}

    public func triggerJSEvent(eventName: String, target: String) {}

    public func triggerJSEvent(eventName: String, target: String, data: String) {}

    public func triggerWindowJSEvent(eventName: String) {}

    public func triggerWindowJSEvent(eventName: String, data: String) {}

    public func triggerDocumentJSEvent(eventName: String) {}

    public func triggerDocumentJSEvent(eventName: String, data: String) {}

    public func localURL(fromWebURL webURL: URL?) -> URL? {
        guard let webURL else {
            return nil
        }
        if webURL.isFileURL {
            return webURL
        }
        return config.appLocation.appendingPathComponent(webURL.path)
    }

    public func portablePath(fromLocalURL localURL: URL?) -> URL? {
        localURL
    }

    public func setServerBasePath(_ path: String) {}

    public func showAlertWith(title: String, message: String, buttonTitle: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: buttonTitle, style: .default))
        presentVC(alert, animated: true, completion: nil)
    }

    public func presentVC(
        _ viewControllerToPresent: UIViewController,
        animated flag: Bool,
        completion: (() -> Void)?
    ) {
        DispatchQueue.main.async {
            self.viewController?.present(viewControllerToPresent, animated: flag, completion: completion)
        }
    }

    public func dismissVC(animated flag: Bool, completion: (() -> Void)?) {
        DispatchQueue.main.async {
            self.viewController?.dismiss(animated: flag, completion: completion)
        }
    }

    private static func topViewController() -> UIViewController? {
        let root = UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first(where: \.isKeyWindow)?
            .rootViewController
        var current = root
        while let presented = current?.presentedViewController {
            current = presented
        }
        return current
    }

    private static func resultJSON(
        callbackId: String,
        pluginId: String,
        methodName: String,
        success: Bool,
        data: [String: Any]? = nil,
        error: [String: Any]? = nil,
        save: Bool? = nil
    ) -> String {
        var result: [String: Any] = [
            "callbackId": callbackId,
            "pluginId": pluginId,
            "methodName": methodName,
            "success": success
        ]
        if let data {
            result["data"] = prepareJSON(data)
        }
        if let error {
            result["error"] = prepareJSON(error)
        }
        if let save {
            result["save"] = save
        }
        return jsonString(result) ?? "{}"
    }

    private static func jsonString(_ value: Any) -> String? {
        guard JSONSerialization.isValidJSONObject(value),
              let data = try? JSONSerialization.data(withJSONObject: value) else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }

    private static func prepareJSON(_ value: Any) -> Any {
        if let date = value as? Date {
            return ISO8601DateFormatter().string(from: date)
        }
        if let dictionary = value as? [String: Any] {
            return dictionary.mapValues(prepareJSON)
        }
        if let array = value as? [Any] {
            return array.map(prepareJSON)
        }
        return value
    }
}

@objc(LynxMotionPlugin)
private final class LynxMotionPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "LynxMotionPlugin"
    let jsName = "Motion"
    let pluginMethods: [CAPPluginMethod] = []
    private let manager = CMMotionManager()

    override func load() {
        manager.deviceMotionUpdateInterval = 1.0 / 30.0
    }

    @objc override func addListener(_ call: CAPPluginCall) {
        super.addListener(call)
        guard manager.isDeviceMotionAvailable, !manager.isDeviceMotionActive else {
            return
        }
        manager.startDeviceMotionUpdates(to: .main) { [weak self] motion, _ in
            guard let self, let motion else {
                return
            }
            notifyListeners("accel", data: [
                "acceleration": [
                    "x": motion.userAcceleration.x,
                    "y": motion.userAcceleration.y,
                    "z": motion.userAcceleration.z
                ],
                "accelerationIncludingGravity": [
                    "x": motion.userAcceleration.x + motion.gravity.x,
                    "y": motion.userAcceleration.y + motion.gravity.y,
                    "z": motion.userAcceleration.z + motion.gravity.z
                ],
                "rotationRate": [
                    "alpha": motion.rotationRate.x,
                    "beta": motion.rotationRate.y,
                    "gamma": motion.rotationRate.z
                ],
                "interval": 30
            ])
            notifyListeners("orientation", data: [
                "alpha": motion.attitude.yaw * 180 / .pi,
                "beta": motion.attitude.pitch * 180 / .pi,
                "gamma": motion.attitude.roll * 180 / .pi
            ])
        }
    }

    @objc override func removeAllListeners(_ call: CAPPluginCall) {
        super.removeAllListeners(call)
        manager.stopDeviceMotionUpdates()
    }
}

private extension NSLock {
    func withLock<T>(_ body: () -> T) -> T {
        lock()
        defer { unlock() }
        return body()
    }
}
