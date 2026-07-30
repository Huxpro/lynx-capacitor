#import "LynxDemoViewController.h"
#import "LynxDemoTemplateProvider.h"
#import "LynxCapacitorBridge.h"
#import <Lynx/DevToolSettings.h>
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
  self.view.backgroundColor = UIColor.blackColor;

  [[DevToolSettings sharedInstance].bootstrap applyDevelopmentDefaultsIfUnset];
  [LynxService(LynxServiceDevToolProtocol) enableAllSessions];

  LynxConfig *globalConfig =
      [[LynxConfig alloc] initWithProvider:[LynxDemoTemplateProvider new]];
  [globalConfig registerModule:LynxCapacitorBridge.class];
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
  [self.view addSubview:self.lynxView];

  LynxTemplateData *data = [[LynxTemplateData alloc] initWithDictionary:@{}];
  [self.lynxView loadTemplateFromURL:@"main.lynx.bundle" initData:data];
  [self.lynxView triggerLayout];
}

@end
