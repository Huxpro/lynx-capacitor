#import "LynxDemoTemplateProvider.h"

@implementation LynxDemoTemplateProvider

- (void)loadTemplateWithUrl:(NSString *)url onComplete:(LynxTemplateLoadBlock)callback {
  NSString *normalized = [url componentsSeparatedByString:@"?"].firstObject;
  while ([normalized hasPrefix:@"/"]) {
    normalized = [normalized substringFromIndex:1];
  }
  normalized = [normalized stringByStandardizingPath];
  NSString *assetRoot = [NSBundle.mainBundle.resourcePath stringByAppendingPathComponent:@"lynx-assets"];
  NSString *path = [assetRoot stringByAppendingPathComponent:normalized];
  if (![NSFileManager.defaultManager fileExistsAtPath:path]) {
    path = nil;
  }
  if (!path && [normalized isEqualToString:@"main.lynx.bundle"]) {
    path = [NSBundle.mainBundle pathForResource:@"main" ofType:@"lynxbin"];
  }
  NSData *data = path ? [NSData dataWithContentsOfFile:path] : nil;
  if (data) {
    callback(data, nil);
    return;
  }
  NSError *error =
      [NSError errorWithDomain:@"LynxCapacitorDemo"
                          code:1
                      userInfo:@{NSLocalizedDescriptionKey : @"main.lynx.bundle is missing"}];
  callback(nil, error);
}

@end
