#import "LynxDemoViewController.h"
#import "LynxDemoTemplateProvider.h"
#import <LynxLibraryRegistry/LynxGeneratedLibraryRegistry.h>
#import <Lynx/LynxConfig.h>
#import <Lynx/LynxEnv.h>
#import <Lynx/LynxService.h>
#import <Lynx/LynxServiceDevToolProtocol.h>
#import <Lynx/LynxView.h>
#import <Lynx/LynxViewBuilder.h>

@interface LynxDemoViewController ()
@property(nonatomic, strong) LynxView *lynxView;
@end

@implementation LynxDemoViewController

- (void)viewDidLoad {
  [super viewDidLoad];
  self.view.backgroundColor = UIColor.systemBackgroundColor;

  [LynxService(LynxServiceDevToolProtocol) enableAllSessions];

  LynxConfig *globalConfig =
      [[LynxConfig alloc] initWithProvider:[LynxDemoTemplateProvider new]];
  // Registers CapacitorBridge -- and any other autolinked Lynx library -- from
  // the registry cocoapods-lynx-library generates at `pod install` time. The
  // app never names LynxCapacitorBridge; adding the npm package is enough.
  [[LynxGeneratedLibraryRegistry new] setup:globalConfig];
  [[LynxEnv sharedInstance] prepareConfig:globalConfig];

  CGSize screenSize = self.view.bounds.size;
  self.lynxView = [[LynxView alloc] initWithBuilderBlock:^(LynxViewBuilder *builder) {
    builder.config =
        [[LynxConfig alloc] initWithProvider:[LynxEnv sharedInstance].config.templateProvider];
    builder.screenSize = screenSize;
    builder.fontScale = 1.0;
    [builder setThreadStrategyForRender:LynxThreadStrategyForRenderMultiThreads];
  }];
  self.lynxView.frame = self.view.bounds;
  self.lynxView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  self.lynxView.preferredLayoutWidth = screenSize.width;
  self.lynxView.preferredLayoutHeight = screenSize.height;
  self.lynxView.layoutWidthMode = LynxViewSizeModeExact;
  self.lynxView.layoutHeightMode = LynxViewSizeModeExact;
  self.lynxView.backgroundColor = UIColor.clearColor;
  [self.view addSubview:self.lynxView];

  UIEdgeInsets insets = self.view.safeAreaInsets;
  LynxTemplateData *data = [[LynxTemplateData alloc] initWithDictionary:@{
    @"safeArea": @{
      @"top": @(insets.top),
      @"bottom": @(insets.bottom),
      @"left": @(insets.left),
      @"right": @(insets.right),
    }
  }];
  [self.lynxView loadTemplateFromURL:@"main.lynx.bundle" initData:data];
  [self.lynxView triggerLayout];
}

- (void)viewSafeAreaInsetsDidChange {
  [super viewSafeAreaInsetsDidChange];
  UIEdgeInsets insets = self.view.safeAreaInsets;
  LynxTemplateData *data = [[LynxTemplateData alloc] initWithDictionary:@{
    @"safeArea": @{
      @"top": @(insets.top),
      @"bottom": @(insets.bottom),
      @"left": @(insets.left),
      @"right": @(insets.right),
    }
  }];
  [self.lynxView updateDataWithTemplateData:data];
}

@end
