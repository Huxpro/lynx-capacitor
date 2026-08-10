# cocoapods-lynx-capacitor

A CocoaPods plugin that links Capacitor plugin pods out of `node_modules`, so a
Lynx app running [lynx-capacitor](../../README.md) never names them in its
Podfile.

```ruby
plugin 'cocoapods-lynx-library'
plugin 'cocoapods-lynx-capacitor'

target 'App' do
  use_lynx_library!        # the Capacitor bridge, as a Lynx native library
  use_capacitor_plugins!   # the Capacitor plugins it dispatches to
end
```

`npm install @capacitor/camera` + `pod install` is now the whole install
procedure for a new plugin.

## Why this exists

Lynx Autolink links Lynx native libraries. lynx-capacitor is exactly one of
those, so `use_lynx_library!` covers the bridge. It does not cover the plugin
pods the bridge dispatches to, and two constraints keep them out of
`LynxCapacitorRuntime.podspec`:

- **A podspec cannot declare `:path` dependencies.** External sources are only
  expressible in a Podfile. So plugin pods must be declared there.
- **CocoaPods trunk is not a usable substitute.** As of Capacitor 8,
  `CapacitorBarcodeScanner`, `CapacitorFileTransfer`, `CapacitorFileViewer`,
  `CapacitorInappbrowser`, `CapacitorLocalLlm` and `CapacitorPrivacyScreen` are
  not on trunk at all; `CapacitorBackgroundRunner` is at 1.0.5 against npm
  3.0.0 and `CapacitorGoogleMaps` at 5.3.2 against npm 8.0.1; and none of the
  `@capacitor-community/*` plugins are published. npm is the real distribution
  channel, which is why the Capacitor CLI generates `:path` lines too.

So something has to walk `node_modules` and emit those lines. Capacitor's CLI
does it by rewriting the text between `def capacitor_pods` and `end` during
`npx cap sync`. Doing it as a CocoaPods plugin instead means the Podfile is
never rewritten, there is no marker block to preserve, and `pod install` stays
the only command.

## Behaviour

**Detection** matches the Capacitor CLI: a package is a plugin when its
`package.json` has a `capacitor` key. Official and community plugins are
treated identically, and a plugin written in your own repo is picked up as soon
as it is a dependency.

**Podspec resolution** looks for `*.podspec` at the package root, where
Capacitor plugins put it, then falls back to the `capacitor.ios.src` directory.
The pod name is read from `s.name` inside the podspec, not from the filename.

**The runtime** — `Capacitor` and `CapacitorCordova` from `@capacitor/ios` — is
linked by default, since every plugin podspec carries `s.dependency 'Capacitor'`
and that can only be satisfied by a local path. Pass `:runtime => false` to
declare it yourself.

**Paths** are the `node_modules` paths, not symlink targets. Under pnpm the real
path embeds the version and a dependency hash
(`.pnpm/@capacitor+device@8.0.3_@capacitor+core@8.4.2/…`), which would rewrite
`Podfile.lock` on every bump. Symlinks are still resolved for identity, so one
package reachable under two names is declared once.

**Nothing is dropped silently.** A package with a `capacitor` key but no iOS
podspec (`@capacitor/motion` today), a missing `@capacitor/ios`, or two distinct
packages claiming one pod name each produce a warning naming the package and the
reason.

## Options

| Option | Default | Meaning |
|--------|---------|---------|
| `:root` | Podfile directory | Where to start looking for `node_modules`. Walks up 6 levels, matching `cocoapods-lynx-library`. Pass this when the app's `package.json` is not on the Podfile's ancestor path. |
| `:include` | all | Allowlist of npm package names. Mirrors Capacitor's `ios.includePlugins`. |
| `:exclude` | none | Denylist of npm package names. |
| `:runtime` | `true` | Also link `Capacitor` and `CapacitorCordova`. |

## Tests

```bash
ruby spec/autolink_spec.rb
```

No CocoaPods or macOS needed — the suite builds `node_modules` fixtures in a
temp dir and asserts against a fake Podfile.
