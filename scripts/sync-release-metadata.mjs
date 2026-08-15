import { readFileSync, writeFileSync } from 'node:fs';

const packages = {
  core: JSON.parse(readFileSync('packages/core/package.json', 'utf8')),
  runtime: JSON.parse(readFileSync('packages/runtime/package.json', 'utf8')),
};

const websitePath = 'website/index.html';
let website = readFileSync(websitePath, 'utf8');

for (const [key, packageJson] of Object.entries(packages)) {
  const marker = `data-release-package="${key}"`;
  const pattern = new RegExp(
    `<a ${marker} href="[^"]+">\\s*${key} [^<]+</a>`,
  );
  const replacement =
    `<a ${marker} href="https://www.npmjs.com/package/` +
    `${packageJson.name}/v/${packageJson.version}">` +
    `${key} ${packageJson.version}</a>`;

  if (!pattern.test(website)) {
    throw new Error(`Missing website release marker for ${packageJson.name}`);
  }
  website = website.replace(pattern, replacement);
}

writeFileSync(websitePath, website);
