# Changesets

Every pull request that changes a published package should include a changeset:

```bash
pnpm changeset
```

Choose `@lynx-capacitor/core`, `@lynx-capacitor/runtime`, or both, then
describe the user-visible change. Documentation, demo-only, website-only,
test-only, and CI-only changes do not need one.

`@lynx-capacitor/core` uses the Capacitor-compatible major and minor version.
Use patch changesets for adapter fixes. Only use a major or minor changeset when
the package is intentionally moving to that matching Capacitor release line.

See [`RELEASING.md`](../RELEASING.md) for the complete release flow.
