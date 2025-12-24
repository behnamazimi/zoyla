#!/bin/bash
set -e

# =============================================================================
# Update Homebrew Tap Script for Zoyla
# =============================================================================
# This script updates the Homebrew cask formula for Zoyla after a release.
#
# Prerequisites:
#   1. GitHub CLI (gh) installed and authenticated
#   2. The release DMGs must already be uploaded to GitHub releases
#
# Usage:
#   # Read version from package.json (default):
#   ./scripts/update-homebrew.sh
#
#   # Override with a specific version:
#   ./scripts/update-homebrew.sh v0.2.7
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository configuration
REPO_OWNER="behnamazimi"
REPO_NAME="zoyla"
HOMEBREW_REPO="behnamazimi/homebrew-zoyla"
TEMP_DIR=$(mktemp -d)

# Cleanup function
cleanup() {
  echo -e "${BLUE}Cleaning up temporary files...${NC}"
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Function to print colored messages
info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1" >&2
}

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PACKAGE_JSON="${PROJECT_ROOT}/package.json"

# Get version from argument, package.json, or prompt
if [ -n "$1" ]; then
  VERSION_TAG="$1"
elif [ -f "$PACKAGE_JSON" ]; then
  info "Reading version from package.json..."
  if command -v node &> /dev/null; then
    VERSION=$(node -p "require('${PACKAGE_JSON}').version")
    VERSION_TAG="v${VERSION}"
    success "Found version in package.json: ${VERSION_TAG}"
  elif command -v jq &> /dev/null; then
    VERSION=$(jq -r '.version' "$PACKAGE_JSON")
    VERSION_TAG="v${VERSION}"
    success "Found version in package.json: ${VERSION_TAG}"
  else
    warning "Could not read package.json (node/jq not found). Please specify version."
    read -p "Enter version tag (e.g., v0.2.7): " VERSION_TAG
  fi
else
  warning "package.json not found. Please specify version."
  read -p "Enter version tag (e.g., v0.2.7): " VERSION_TAG
fi

# Remove 'v' prefix if present
VERSION="${VERSION_TAG#v}"

if [ -z "$VERSION" ]; then
  error "Version cannot be empty"
  exit 1
fi

info "Updating Homebrew tap for version: ${VERSION}"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
  error "GitHub CLI (gh) is not installed. Please install it first."
  exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
  error "GitHub CLI is not authenticated. Please run 'gh auth login' first."
  exit 1
fi

# Check if release exists and get release info
info "Checking if release v${VERSION} exists..."
if ! gh release view "v${VERSION}" --repo "${REPO_OWNER}/${REPO_NAME}" &> /dev/null; then
  error "Release v${VERSION} not found. Make sure the release exists and DMGs are uploaded."
  exit 1
fi

# Check if DMG assets exist
info "Checking if release DMG assets exist..."
ARM64_ASSET="zoyla-${VERSION}-macos-arm64.dmg"
X64_ASSET="zoyla-${VERSION}-macos-x64.dmg"

RELEASE_ASSETS=$(gh release view "v${VERSION}" --repo "${REPO_OWNER}/${REPO_NAME}" --json assets -q '.assets[].name' || echo "")

if ! echo "$RELEASE_ASSETS" | grep -q "^${ARM64_ASSET}$"; then
  error "ARM64 DMG not found in release assets: ${ARM64_ASSET}"
  exit 1
fi

if ! echo "$RELEASE_ASSETS" | grep -q "^${X64_ASSET}$"; then
  error "x64 DMG not found in release assets: ${X64_ASSET}"
  exit 1
fi

success "Both DMGs found in release assets"

# Download DMGs and calculate SHA256
info "Downloading DMGs and calculating SHA256 hashes..."

cd "$TEMP_DIR"

info "Downloading ARM64 DMG..."
gh release download "v${VERSION}" \
  --repo "${REPO_OWNER}/${REPO_NAME}" \
  --pattern "${ARM64_ASSET}" \
  --dir "$TEMP_DIR" \
  --clobber

ARM64_SHA=$(shasum -a 256 "${ARM64_ASSET}" | cut -d' ' -f1)
success "ARM64 SHA256: $ARM64_SHA"

info "Downloading x64 DMG..."
gh release download "v${VERSION}" \
  --repo "${REPO_OWNER}/${REPO_NAME}" \
  --pattern "${X64_ASSET}" \
  --dir "$TEMP_DIR" \
  --clobber

X64_SHA=$(shasum -a 256 "${X64_ASSET}" | cut -d' ' -f1)
success "x64 SHA256: $X64_SHA"

# Clone or update homebrew-zoyla repository
HOMEBREW_DIR="$TEMP_DIR/homebrew-zoyla"

if [ -d "$HOMEBREW_DIR" ]; then
  info "Updating existing homebrew-zoyla repository..."
  cd "$HOMEBREW_DIR"
  git pull --rebase
else
  info "Cloning homebrew-zoyla repository..."
  gh repo clone "${HOMEBREW_REPO}" "$HOMEBREW_DIR"
  cd "$HOMEBREW_DIR"
fi

# Update cask formula
info "Updating cask formula..."

cat > Casks/zoyla.rb << CASKEOF
cask "zoyla" do
  version "${VERSION}"

  on_intel do
    sha256 "${X64_SHA}"
    url "https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/v#{version}/zoyla-#{version}-macos-x64.dmg"
  end

  on_arm do
    sha256 "${ARM64_SHA}"
    url "https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/v#{version}/zoyla-#{version}-macos-arm64.dmg"
  end

  name "Zoyla"
  desc "Fast, lightweight HTTP load testing desktop application"
  homepage "https://github.com/${REPO_OWNER}/${REPO_NAME}"

  app "zoyla.app"
end
CASKEOF

success "Cask formula updated"

# Stage the file
git add Casks/zoyla.rb

# Check if there are changes to commit
if git diff --staged --quiet; then
  warning "No changes to commit - cask already up to date"
  exit 0
fi

# Commit and push
info "Committing changes..."
git commit -m "Update zoyla to v${VERSION}"

info "Pushing to GitHub..."
git push origin HEAD

success "Homebrew tap updated successfully!"
info "The cask formula is now available at: https://github.com/${HOMEBREW_REPO}"

