#!/usr/bin/env node

/**
 * Syncs version from package.json to tauri.conf.json and Cargo.toml
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read version from package.json
const packageJsonPath = join(rootDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

if (!version) {
  console.error('Error: No version found in package.json');
  process.exit(1);
}

console.log(`Syncing version ${version} to Tauri config files...`);

// Update tauri.conf.json
const tauriConfigPath = join(rootDir, 'src-tauri', 'tauri.conf.json');
const tauriConfig = JSON.parse(readFileSync(tauriConfigPath, 'utf-8'));
tauriConfig.version = version;
writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + '\n');
console.log(`✓ Updated ${tauriConfigPath}`);

// Update Cargo.toml
const cargoTomlPath = join(rootDir, 'src-tauri', 'Cargo.toml');
const cargoToml = readFileSync(cargoTomlPath, 'utf-8');
const updatedCargoToml = cargoToml.replace(
  /^version = ".*"$/m,
  `version = "${version}"`
);
writeFileSync(cargoTomlPath, updatedCargoToml);
console.log(`✓ Updated ${cargoTomlPath}`);

console.log('Version sync complete!');

