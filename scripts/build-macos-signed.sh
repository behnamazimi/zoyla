#!/bin/bash
set -e

# =============================================================================
# macOS Signed Build Script for Zoyla
# =============================================================================
# This script builds, signs, and notarizes the macOS app for both architectures.
#
# Prerequisites:
#   1. Developer ID Application certificate installed in Keychain
#   2. App-specific password created at https://account.apple.com
#   3. Environment variables set (see below)
#
# Required Environment Variables:
#   APPLE_SIGNING_IDENTITY - e.g., "Developer ID Application: Your Name (TEAMID)"
#   APPLE_ID               - Your Apple ID email
#   APPLE_PASSWORD         - App-specific password (NOT your Apple ID password)
#   APPLE_TEAM_ID          - Your 10-character Team ID
#
# Usage:
#   # Set environment variables first:
#   export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID)"
#   export APPLE_ID="your@email.com"
#   export APPLE_PASSWORD="xxxx-xxxx-xxxx-xxxx"
#   export APPLE_TEAM_ID="XXXXXXXXXX"
#
#   # Then run:
#   ./scripts/build-macos-signed.sh
#
#   # Or skip notarization (sign only):
#   ./scripts/build-macos-signed.sh --skip-notarization
#
#   # Build only one architecture:
#   ./scripts/build-macos-signed.sh --arch arm64
#   ./scripts/build-macos-signed.sh --arch x64
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_NOTARIZATION=false
BUILD_ARCH="both"

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-notarization)
      SKIP_NOTARIZATION=true
      shift
      ;;
    --arch)
      BUILD_ARCH="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Zoyla macOS Signed Build Script${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Check required environment variables
check_env() {
  local var_name=$1
  local var_value=${!var_name}
  if [ -z "$var_value" ]; then
    echo -e "${RED}Error: $var_name is not set${NC}"
    echo "Please set it: export $var_name=\"your-value\""
    exit 1
  fi
  echo -e "${GREEN}✓${NC} $var_name is set"
}

echo -e "${YELLOW}Checking environment variables...${NC}"
check_env "APPLE_SIGNING_IDENTITY"

if [ "$SKIP_NOTARIZATION" = false ]; then
  check_env "APPLE_ID"
  check_env "APPLE_PASSWORD"
  check_env "APPLE_TEAM_ID"
else
  echo -e "${YELLOW}⚠ Skipping notarization (--skip-notarization flag set)${NC}"
fi
echo ""

# Get the project root directory (where package.json is)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Get version from package.json
VERSION=$(node -p "require('$PROJECT_ROOT/package.json').version")
echo -e "${BLUE}Building version: ${GREEN}$VERSION${NC}"
echo ""

# Create output directory (use absolute path)
# Note: Using dist-macos-signed (not inside dist/) because Vite clears dist/ on each build
# We don't delete the directory to preserve previous architecture builds
OUTPUT_DIR="$PROJECT_ROOT/dist-macos-signed"
mkdir -p "$OUTPUT_DIR"

if [ ! -d "$OUTPUT_DIR" ]; then
  echo -e "${RED}Error: Failed to create output directory: $OUTPUT_DIR${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Output directory: $OUTPUT_DIR"
echo ""

# Build function
build_target() {
  local target=$1
  local arch_name=$2
  
  echo -e "${BLUE}==================================================${NC}"
  echo -e "${BLUE}  Building for $arch_name ($target)${NC}"
  echo -e "${BLUE}==================================================${NC}"
  
  # Build the app
  echo -e "${YELLOW}Building...${NC}"
  cd "$PROJECT_ROOT" && npm run tauri build -- --target "$target"
  
  # Find the DMG
  DMG_PATH="$PROJECT_ROOT/src-tauri/target/$target/release/bundle/dmg"
  DMG_FILE=$(ls "$DMG_PATH"/*.dmg 2>/dev/null | head -1)
  
  if [ -z "$DMG_FILE" ]; then
    echo -e "${RED}Error: DMG not found at $DMG_PATH${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✓${NC} Build complete: $DMG_FILE"
  
  # Copy and rename DMG
  OUTPUT_NAME="zoyla-${VERSION}-macos-${arch_name}.dmg"
  
  # Ensure output directory exists (create it here in case it was deleted)
  mkdir -p "$OUTPUT_DIR"
  
  echo -e "${YELLOW}Copying: $DMG_FILE -> $OUTPUT_DIR/$OUTPUT_NAME${NC}"
  cp "$DMG_FILE" "$OUTPUT_DIR/$OUTPUT_NAME"
  
  if [ -f "$OUTPUT_DIR/$OUTPUT_NAME" ]; then
    echo -e "${GREEN}✓${NC} Copied to: $OUTPUT_DIR/$OUTPUT_NAME"
  else
    echo -e "${RED}✗${NC} Failed to copy DMG"
    exit 1
  fi
  echo ""
}

# Build for selected architectures
if [ "$BUILD_ARCH" = "both" ] || [ "$BUILD_ARCH" = "arm64" ]; then
  build_target "aarch64-apple-darwin" "arm64"
fi

if [ "$BUILD_ARCH" = "both" ] || [ "$BUILD_ARCH" = "x64" ]; then
  build_target "x86_64-apple-darwin" "x64"
fi

# Verify signatures
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Verifying Signatures${NC}"
echo -e "${BLUE}==================================================${NC}"

for dmg in "$OUTPUT_DIR"/*.dmg; do
  echo -e "${YELLOW}Verifying: $(basename "$dmg")${NC}"
  
  # Mount DMG to verify app signature
  MOUNT_POINT=$(mktemp -d)
  hdiutil attach "$dmg" -mountpoint "$MOUNT_POINT" -quiet
  
  APP_PATH=$(find "$MOUNT_POINT" -name "*.app" -maxdepth 1 | head -1)
  
  if [ -n "$APP_PATH" ]; then
    if codesign --verify --deep --strict "$APP_PATH" 2>/dev/null; then
      echo -e "${GREEN}✓${NC} Code signature valid"
    else
      echo -e "${RED}✗${NC} Code signature invalid!"
    fi
    
    # Show signing info
    codesign -dv "$APP_PATH" 2>&1 | grep -E "(Authority|TeamIdentifier)" | head -3
  fi
  
  hdiutil detach "$MOUNT_POINT" -quiet
  rm -rf "$MOUNT_POINT"
  echo ""
done

# Summary
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Build Complete!${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""
echo -e "${GREEN}Output files:${NC}"
ls -lh "$OUTPUT_DIR"/*.dmg
echo ""
echo -e "${GREEN}Full path: $(pwd)/$OUTPUT_DIR${NC}"
echo ""

if [ "$SKIP_NOTARIZATION" = true ]; then
  echo -e "${YELLOW}⚠ Note: Apps were signed but NOT notarized.${NC}"
  echo -e "${YELLOW}  Users will see Gatekeeper warnings.${NC}"
  echo ""
fi

echo -e "${BLUE}To upload to a GitHub release:${NC}"
echo "  gh release upload v$VERSION $OUTPUT_DIR/*.dmg --clobber"
echo ""

