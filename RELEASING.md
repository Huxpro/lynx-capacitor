# Releasing

Lynx Capacitor uses Changesets to maintain a reviewable **Version Packages**
pull request and publish npm packages from `main`.

## Add a release note

Any pull request that changes `@lynx-capacitor/core` or
`@lynx-capacitor/runtime` for consumers should run:

```bash
pnpm changeset
```

Select the affected package, choose the SemVer bump, and write a concise
user-facing summary. CI-only, test-only, demo-only, website-only, and
documentation-only changes do not need a changeset.

The core adapter's major and minor version identify its compatible Capacitor
release line. Adapter-only fixes use a patch bump. A major or minor bump should
only accompany an intentional move to the corresponding Capacitor version.
The runtime follows independent SemVer. The version workflow enforces that the
core package and the declared Capacitor dependency stay on the same major/minor
line.

## Version and publish

After a changeset reaches `main`, the
[`Version Packages`](.github/workflows/release.yml) workflow opens or updates a
pull request named `chore: Version Packages`. That pull request:

- applies the pending version bumps and changelogs;
- updates the package lockfile;
- synchronizes the npm versions displayed on the website.

Review and merge the Version Packages pull request to publish the changed
packages. The workflow publishes with npm provenance, pushes package tags, and
creates GitHub Releases through Changesets.

## One-time npm configuration

Configure an npm Trusted Publisher for both public packages with these exact
values:

- Organization or user: `Huxpro`
- Repository: `lynx-capacitor`
- Workflow filename: `release.yml`
- GitHub environment: `npm`

The workflow intentionally has no long-lived npm write token. It requires
Node.js 24+, npm 11.5.1+, and `id-token: write` so npm can exchange GitHub's
OIDC identity for a short-lived publishing credential.

The `cocoapods-lynx-capacitor` RubyGem is versioned and published separately;
the npm Version Packages workflow does not publish RubyGems.
