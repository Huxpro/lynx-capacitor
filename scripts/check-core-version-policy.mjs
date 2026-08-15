import { readFileSync } from 'node:fs';

const root = JSON.parse(readFileSync('package.json', 'utf8'));
const core = JSON.parse(readFileSync('packages/core/package.json', 'utf8'));
const capacitorRange = root.devDependencies?.['@capacitor/core'];

function majorMinor(value, label) {
  const match = String(value).match(/(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`Cannot read a major/minor version from ${label}: ${value}`);
  }
  return `${match[1]}.${match[2]}`;
}

const capacitorLine = majorMinor(capacitorRange, '@capacitor/core range');
const adapterLine = majorMinor(core.version, '@lynx-capacitor/core version');

if (capacitorLine !== adapterLine) {
  throw new Error(
    `@lynx-capacitor/core ${core.version} must stay on the declared ` +
      `@capacitor/core ${capacitorRange} major/minor line`,
  );
}

console.log(
  `Core version policy passed: ${core.version} tracks Capacitor ${capacitorLine}.x`,
);
