#!/usr/bin/env node

/**
 * Version bump script that updates package.json, Cargo.toml, Cargo.lock, and tauri.conf.json
 * Then commits and creates a git tag (similar to npm version)
 * 
 * Usage:
 *   npm run version patch   (bump patch version: 0.1.5 -> 0.1.6)
 *   npm run version minor   (bump minor version: 0.1.5 -> 0.2.0)
 *   npm run version major   (bump major version: 0.1.5 -> 1.0.0)
 *   npm run version 0.2.0   (set specific version)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Get version bump type or specific version from command line
const versionArg = process.argv[2];

if (!versionArg) {
  console.error('Error: Version argument required (patch, minor, major, or specific version like 0.2.0)');
  process.exit(1);
}

// Read current version from package.json
const packageJsonPath = join(rootDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const currentVersion = packageJson.version;

if (!currentVersion) {
  console.error('Error: No version found in package.json');
  process.exit(1);
}

// Calculate new version
let newVersion;
if (['patch', 'minor', 'major'].includes(versionArg)) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (versionArg) {
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
  }
} else {
  // Validate version format (basic check)
  if (!/^\d+\.\d+\.\d+/.test(versionArg)) {
    console.error(`Error: Invalid version format: ${versionArg}. Expected format: x.y.z`);
    process.exit(1);
  }
  newVersion = versionArg;
}

if (newVersion === currentVersion) {
  console.error(`Error: Version is already ${currentVersion}`);
  process.exit(1);
}

console.log(`Bumping version from ${currentVersion} to ${newVersion}...`);

// Update package.json
packageJson.version = newVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`✓ Updated ${packageJsonPath}`);

// Update Cargo.toml
const cargoTomlPath = join(rootDir, 'src-tauri', 'Cargo.toml');
const cargoToml = readFileSync(cargoTomlPath, 'utf-8');
const updatedCargoToml = cargoToml.replace(
  /^version = ".*"$/m,
  `version = "${newVersion}"`
);
writeFileSync(cargoTomlPath, updatedCargoToml);
console.log(`✓ Updated ${cargoTomlPath}`);

// Update Cargo.lock
const cargoLockPath = join(rootDir, 'src-tauri', 'Cargo.lock');
const cargoLock = readFileSync(cargoLockPath, 'utf-8');
// Update the zoyla package version in Cargo.lock
// Match: [[package]] followed by name = "zoyla" and version = "x.y.z"
const updatedCargoLock = cargoLock.replace(
  /(\[\[package\]\]\s*\nname = "zoyla"\s*\nversion = ")[^"]+(")/,
  `$1${newVersion}$2`
);
writeFileSync(cargoLockPath, updatedCargoLock);
console.log(`✓ Updated ${cargoLockPath}`);

// Update tauri.conf.json
const tauriConfigPath = join(rootDir, 'src-tauri', 'tauri.conf.json');
const tauriConfig = JSON.parse(readFileSync(tauriConfigPath, 'utf-8'));
tauriConfig.version = newVersion;
writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + '\n');
console.log(`✓ Updated ${tauriConfigPath}`);

// Stage all changed files
console.log('\nStaging files...');
try {
  execSync('git add package.json src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json', {
    cwd: rootDir,
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error: Failed to stage files. Make sure you are in a git repository.');
  process.exit(1);
}

// Commit changes
console.log('\nCommitting changes...');
try {
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, {
    cwd: rootDir,
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error: Failed to commit. Make sure you have changes to commit.');
  process.exit(1);
}

// Create git tag
console.log('\nCreating git tag...');
try {
  execSync(`git tag -a v${newVersion} -m "v${newVersion}"`, {
    cwd: rootDir,
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error: Failed to create tag. Tag may already exist.');
  process.exit(1);
}

console.log(`\n✓ Version bump complete!`);
console.log(`  Version: ${currentVersion} → ${newVersion}`);
console.log(`  Commit: chore: bump version to ${newVersion}`);
console.log(`  Tag: v${newVersion}`);
console.log(`\nTo push changes and tags:`);
console.log(`  git push && git push --tags`);

