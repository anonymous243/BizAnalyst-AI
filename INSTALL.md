# 🚀 How to Get BizAnalyst AI

There are multiple ways to download and use BizAnalyst AI. Choose the method that works best for you!

---

## Option 1: Download from GitHub (Recommended for Most Users)

### A. Download as ZIP (No Git Required)

1. Go to the [GitHub repository](https://github.com/anonymous243/bizanalyst-ai)
2. Click the green **Code** button
3. Select **Download ZIP**
4. Extract the ZIP file to your desired location
5. Open terminal in the extracted folder
6. Run:
   ```bash
   npm install
   cp .env.example .env.local
   # Edit .env.local and add your Gemini API key
   npm run dev
   ```

### B. Clone Repository (Requires Git)

```bash
# Clone the repository
git clone https://github.com/anonymous243/bizanalyst-ai.git

# Navigate to the project folder
cd bizanalyst-ai

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local and add your Gemini API key

# Start the development server
npm run dev
```

---

## Option 2: Install via npm (For Advanced Users)

```bash
# Install globally
npm install -g bizanalyst-ai

# Run the application
bizanalyst-ai

# Or run in current directory
npx bizanalyst-ai
```

> **Note:** npm package is coming soon! Check the [npm page](https://www.npmjs.com/package/bizanalyst-ai) for availability.

---

## Option 3: Use as a Template

1. Go to the [GitHub repository](https://github.com/anonymous243/bizanalyst-ai)
2. Click **Use this template** button
3. Create a new repository in your account
4. Clone your new repository and customize as needed

This is great if you want to:
- Create a custom version
- Contribute back with a fork
- Keep your own modified version

---

## Prerequisites

Before installing, make sure you have:

| Requirement | Version | How to Check |
|-------------|---------|--------------|
| **Node.js** | >= 18.0.0 | `node --version` |
| **npm** | >= 9.0.0 | `npm --version` |
| **Git** (optional) | Any | `git --version` |

### Install Node.js

If you don't have Node.js installed:

- **Windows/macOS**: Download from [nodejs.org](https://nodejs.org/)
- **Linux**: 
  ```bash
  # Ubuntu/Debian
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  
  # Or use nvm (recommended)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 20
  ```

---

## Quick Start After Installation

1. **Get a Gemini API Key** (free):
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Copy it to your clipboard

2. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and paste your API key
   ```

3. **Run the App**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   - Navigate to `http://localhost:3000`
   - Upload your first dataset!

---

## Installation Troubleshooting

### Permission Errors (npm)

```bash
# Fix npm permissions (Linux/macOS)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

Or use sudo (not recommended):
```bash
sudo npm install -g bizanalyst-ai
```

### Port 3000 Already in Use

```bash
# Use a different port
npm run dev -- --port 3001
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Verify Installation

After installation, verify everything works:

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check npm version
npm --version  # Should be >= 9.0.0

# Run the app
npm run dev
```

You should see:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## Next Steps

- 📖 Read the [README.md](README.md) for full documentation
- 🤝 Check out [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute
- 🐛 Report issues on [GitHub Issues](https://github.com/anonymous243/bizanalyst-ai/issues)
- 💬 Ask questions in [GitHub Discussions](https://github.com/anonymous243/bizanalyst-ai/discussions)

---

## Need Help?

- **Installation issues?** → Open an issue with the [bug report template](https://github.com/anonymous243/bizanalyst-ai/issues/new?template=bug_report.yml)
- **Have questions?** → Use the [question template](https://github.com/anonymous243/bizanalyst-ai/issues/new?template=question.yml)
- **Check existing issues** → [GitHub Issues](https://github.com/anonymous243/bizanalyst-ai/issues)

Happy analyzing! 📊
