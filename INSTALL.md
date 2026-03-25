# 🚀 Installation Guide

Multiple ways to install and use BizAnalyst AI.

---

## Option 1: Download from GitHub

### A. Download as ZIP (No Git Required)

1. Go to [GitHub repository](https://github.com/yourusername/bizanalyst-ai)
2. Click **Code** → **Download ZIP**
3. Extract the ZIP file
4. Open terminal in the extracted folder
5. Run:
   ```bash
   npm install
   cp .env.example .env.local
   # Edit .env.local and add your API key
   npm run dev
   ```

### B. Clone Repository (Requires Git)

```bash
git clone https://github.com/yourusername/bizanalyst-ai.git
cd bizanalyst-ai
npm install
cp .env.example .env.local
npm run dev
```

---

## Option 2: Install via npm

```bash
# Install globally
npm install -g bizanalyst-ai

# Run from anywhere
bizanalyst-ai

# Or use npx without installing
npx bizanalyst-ai
```

---

## Option 3: Use as Template

1. Go to [GitHub repository](https://github.com/yourusername/bizanalyst-ai)
2. Click **Use this template**
3. Create your own repository
4. Clone and customize

---

## Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | >= 18.0.0 | `node --version` |
| npm | >= 9.0.0 | `npm --version` |

### Install Node.js

- **All platforms**: [nodejs.org](https://nodejs.org/)
- **Linux (nvm)**:
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 20
  ```

---

## Quick Start

1. **Get API Key** (free):
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create and copy your API key

2. **Configure**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API key
   ```

3. **Run**:
   ```bash
   npm run dev
   ```

4. **Open**: http://localhost:3000

---

## Troubleshooting

### Permission Errors

```bash
# Linux/macOS - Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Port Already in Use

```bash
npm run dev -- --port 3001
```

### Build Errors

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Verify Installation

```bash
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
npm run dev
```

Expected output:
```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

---

## Need Help?

- 📖 [README.md](README.md) - Full documentation
- 🐛 [Report Bug](https://github.com/yourusername/bizanalyst-ai/issues/new?template=bug_report.yml)
- ❓ [Ask Question](https://github.com/yourusername/bizanalyst-ai/issues/new?template=question.yml)
