#import "LynxCapacitorBridge.h"
#import <Lynx/LynxContext.h>
#import <LynxCapacitorRuntime/LynxCapacitorRuntime-Swift.h>

@interface LynxCapacitorBridge ()
@property(nonatomic, strong) LynxCapacitorRuntime *runtime;
@property(nonatomic, weak) LynxContext *lynxContext;
@end

@implementation LynxCapacitorBridge

+ (NSString *)name {
  return @"CapacitorBridge";
}

+ (NSDictionary<NSString *, NSString *> *)methodLookup {
  return @{
    @"handleCall" : NSStringFromSelector(@selector(handleCall:callback:)),
    @"getPluginHeaders" : NSStringFromSelector(@selector(getPluginHeaders)),
    @"getPlatform" : NSStringFromSelector(@selector(getPlatform)),
  };
}

- (instancetype)init {
  if (self = [super init]) {
    if ([NSThread isMainThread]) {
      _runtime = [[LynxCapacitorRuntime alloc] init];
    } else {
      dispatch_sync(dispatch_get_main_queue(), ^{
        self->_runtime = [[LynxCapacitorRuntime alloc] init];
      });
    }
  }
  return self;
}

- (instancetype)initWithLynxContext:(LynxContext *)context {
  if (self = [self init]) {
    self.lynxContext = context;
    __weak typeof(self) weakSelf = self;
    [self.runtime setResultHandler:^(NSString *resultJson) {
      LynxContext *strongContext = weakSelf.lynxContext;
      if (strongContext == nil) {
        return;
      }
      [strongContext sendGlobalEvent:@"lynx-capacitor-result" withParams:@[ resultJson ]];
    }];
  }
  return self;
}

- (NSString *)getPlatform {
  return [self.runtime getPlatform];
}

- (NSString *)getPluginHeaders {
  return [self.runtime getPluginHeaders];
}

- (void)handleCall:(NSString *)payload callback:(LynxCallbackBlock)callback {
  [self.runtime handleCall:payload callback:callback];
}

@end
