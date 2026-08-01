#import "LynxCapacitorBridge.h"
#import <LynxCapacitorRuntime/LynxCapacitorRuntime-Swift.h>

@interface LynxCapacitorBridge ()
@property(nonatomic, strong) LynxCapacitorRuntime *runtime;
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

- (instancetype)initWithParam:(id)param {
  return [self init];
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
