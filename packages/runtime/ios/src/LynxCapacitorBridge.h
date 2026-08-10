#import <Foundation/Foundation.h>
#import <Lynx/LynxModule.h>

NS_ASSUME_NONNULL_BEGIN

/// Every Capacitor plugin call is multiplexed over this one Lynx NativeModule's
/// `handleCall`, so a single autolink registration covers all plugins.
///
/// `@LynxNativeModule` expands to `@class LynxNativeModuleMarker;` (see
/// Lynx/LynxModule.h) -- it is a source marker, not a declaration.
/// cocoapods-lynx-library scans for it at `pod install` time and emits
/// `[config registerModule:... withName:@"CapacitorBridge"]` into the
/// generated LynxGeneratedLibraryRegistry.
@LynxNativeModule("CapacitorBridge")
@interface LynxCapacitorBridge : NSObject <LynxModule>
@end

NS_ASSUME_NONNULL_END
