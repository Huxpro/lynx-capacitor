#import "AppDelegate.h"
#import "LynxDemoViewController.h"
#import <LynxCapacitorRuntime/LynxCapacitorRuntime-Swift.h>

@implementation LynxCapacitorAppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  self.window = [[UIWindow alloc] initWithFrame:UIScreen.mainScreen.bounds];
  self.window.rootViewController = [LynxDemoViewController new];
  [self.window makeKeyAndVisible];
  return YES;
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  return [LynxCapacitorRuntime handleOpenURL:url options:options];
}

- (BOOL)application:(UIApplication *)application
    continueUserActivity:(NSUserActivity *)userActivity
      restorationHandler:
          (void (^)(NSArray<id<UIUserActivityRestoring>> *restorableObjects))
              restorationHandler {
  return [LynxCapacitorRuntime
      handleContinueUserActivity:userActivity
              restorationHandler:restorationHandler];
}

@end
