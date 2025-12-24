# macOS Build, Sign & Release Guide

A step-by-step guide to build, sign, notarize, and release macOS versions of Zoyla.

## Prerequisites

1. **Apple Developer Account** - [developer.apple.com](https://developer.apple.com)
2. **Developer ID Application certificate** installed in Keychain
3. **App-specific password** from [account.apple.com](https://account.apple.com)
4. **GitHub CLI** - `brew install gh`

---

## One-Time Setup

### 1. Create Your Certificate

1. Go to [developer.apple.com/account/resources/certificates](https://developer.apple.com/account/resources/certificates)
2. Click **+** → Select **Developer ID Application**
3. Follow the steps (create CSR via Keychain Access)
4. Download and double-click to install in Keychain

### 2. Create App-Specific Password

1. Go to [account.apple.com](https://account.apple.com)
2. **Sign-In and Security** → **App-Specific Passwords**
3. Generate and save the password

### 3. Find Your Credentials

```bash
# Find your signing identity
security find-identity -v -p codesigning

# Output example:
# 1) ABC123 "Developer ID Application: Your Name (TEAMID123)"
#    ^^^^^^^^                                      ^^^^^^^^^^
#    (not needed)                                  This is your TEAM_ID
```

### 4. Set Environment Variables

Add to `~/.zshrc`:

```bash
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID123)"
export APPLE_ID="your@email.com"
export APPLE_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="TEAMID123"
```

Then reload: `source ~/.zshrc`

---

## Build & Release

### Quick Release (Both Architectures)

```bash
# 1. Build, sign, and notarize
npm run build:macos

# 2. Upload to existing GitHub release
gh release upload v0.2.6 dist-macos-signed/*.dmg --clobber

# 3. Update Homebrew tap (reads version from package.json)
./scripts/update-homebrew.sh
```

That's it! ✅ The Homebrew tap will be updated with the new version and SHA256 hashes.

---

## Other Build Options

```bash
# Build only Apple Silicon (M1/M2/M3)
npm run build:macos:arm64

# Build only Intel
npm run build:macos:x64

# Sign without notarization (faster, but users get Gatekeeper warning)
npm run build:macos:sign-only
```

## Updating Homebrew Tap

After uploading release assets, update the Homebrew tap:

```bash
# Uses version from package.json (default)
./scripts/update-homebrew.sh

# Or specify a version manually
./scripts/update-homebrew.sh v0.2.6
```

The script will:
1. Check if the release exists and DMGs are available
2. Download DMGs and calculate SHA256 hashes
3. Clone/update the homebrew-zoyla repository
4. Update the cask formula with new version and hashes
5. Commit and push the changes

---

## Output Files

After running `npm run build:macos`:

```
dist-macos-signed/
├── zoyla-0.2.6-macos-arm64.dmg   # Apple Silicon (M1/M2/M3)
└── zoyla-0.2.6-macos-x64.dmg     # Intel Macs
```
