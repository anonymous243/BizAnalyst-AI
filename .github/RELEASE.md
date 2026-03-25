# GitHub Release Configuration

This file contains configuration and templates for GitHub Releases.

## Creating a Release

1. Go to https://github.com/yourusername/bizanalyst-ai/releases
2. Click "Draft a new release"
3. Choose a tag version (e.g., v1.0.0)
4. Use the release template below
5. Click "Publish release"

## Release Template

```markdown
## 🎉 What's New

[Summary of major changes]

## ✨ New Features

- Feature 1
- Feature 2

## 🐛 Bug Fixes

- Fix 1
- Fix 2

## 📦 Installation

### Option 1: Download ZIP
Click the "Source Code (zip)" asset below to download.

### Option 2: Clone Repository
```bash
git clone https://github.com/yourusername/bizanalyst-ai.git
cd bizanalyst-ai
npm install
npm run dev
```

### Option 3: npm (if published)
```bash
npm install -g bizanalyst-ai
bizanalyst-ai
```

## 📋 Full Changelog

[See CHANGELOG.md](CHANGELOG.md)

## 🙏 Thanks

Thanks to all contributors who made this release possible!
```

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Automated Releases (Optional)

To set up automated releases with GitHub Actions, create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

Then create releases by pushing tags:

```bash
git tag v1.0.0
git push origin v1.0.0
```
