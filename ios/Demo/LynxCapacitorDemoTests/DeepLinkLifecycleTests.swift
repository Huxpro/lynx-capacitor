import Capacitor
import XCTest
@testable import LynxCapacitorDemo

final class DeepLinkLifecycleTests: XCTestCase {
    func testOpenURLIsForwardedToCapacitor() throws {
        let delegate = LynxCapacitorAppDelegate()
        let url = try XCTUnwrap(URL(string: "lynxcapacitor://demo/ios-open-url"))

        let handled = delegate.application(
            UIApplication.shared,
            open: url,
            options: [:]
        )

        XCTAssertTrue(handled)
        XCTAssertEqual(ApplicationDelegateProxy.shared.lastURL, url)
    }

    func testUniversalLinkIsForwardedToCapacitor() throws {
        let delegate = LynxCapacitorAppDelegate()
        let url = try XCTUnwrap(URL(string: "https://example.com/ios-universal-link"))
        let activity = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)
        activity.webpageURL = url

        let handled = delegate.application(
            UIApplication.shared,
            continue: activity,
            restorationHandler: { _ in }
        )

        XCTAssertTrue(handled)
        XCTAssertEqual(ApplicationDelegateProxy.shared.lastURL, url)
    }
}
