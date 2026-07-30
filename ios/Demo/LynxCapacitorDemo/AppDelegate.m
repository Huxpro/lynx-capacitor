#import "AppDelegate.h"
#import "LynxDemoViewController.h"

@implementation LynxCapacitorAppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  self.window = [[UIWindow alloc] initWithFrame:UIScreen.mainScreen.bounds];
  self.window.rootViewController = [LynxDemoViewController new];
  [self.window makeKeyAndVisible];
  return YES;
}

@end
