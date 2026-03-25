<div align="center">

# BizAnalyst AI

**Open Source Business Data Analyst with AI-Powered Insights**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![npm](https://img.shields.io/badge/npm-%3E%3D9.0.0-CB3837?logo=npm&logoColor=white)](https://www.npmjs.com/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

A professional-grade, open-source Business Data analysis tool for automated data cleaning, visualization, and AI-powered insights.

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 📊 Features

- **Interactive Visualizations** - Distributions, correlations, trends, and scatter plots
- **AI-Powered Insights** - Ask questions about your data using generative AI
- **Smart Data Cleaning** - Professional auto-clean with outlier detection and imputation
- **Multiple File Formats** - Support for CSV and Excel files (.csv, .xlsx, .xls)
- **Export Charts** - Download any visualization as high-quality PNG
- **Presentation Mode** - Clean, distraction-free view for presentations
- **Global Filters** - Filter data across all views simultaneously
- **Predictive Forecasting** - Time series forecasting capabilities

---

## 📦 Installation

### Option 1: Clone from GitHub

```bash
git clone https://github.com/anonymous243/BizAnalyst-AI
cd BizAnalyst-AI
npm install
```

### Option 2: Download ZIP

1. Click **Code** → **Download ZIP** on GitHub
2. Extract the ZIP file
3. Run `npm install` in the extracted folder

### Option 3: Install via npm

```bash
npm install -g bizanalyst-ai
```

### Option 4: Use npx (No Installation)

```bash
npx bizanalyst-ai
```

---

## 🚀 Usage

### 1. Set Up Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

> Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. Start Development Server

```bash
npm run dev
```

Open your browser to **http://localhost:3001**

### 3. Upload Your Data

- Click **Upload CSV/XLSX** or drag and drop a file
- Review auto-generated insights
- Use one-click cleaning actions if needed
- Explore visualizations across different tabs
- Ask the AI Analyst questions about your data
- Download charts using the 📷 camera icon

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Remove build artifacts |

---

## 🏗️ Architecture

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Visualization**: Recharts
- **AI Integration**: Google Gemini API
- **Data Processing**: Papa Parse (CSV), XLSX (Excel)
- **Icons**: Lucide React

### Project Structure

```
bizanalyst-ai/
├── src/
│   ├── App.tsx           # Main application component
│   ├── analyst.ts        # Data analysis utilities
│   ├── types.ts          # TypeScript type definitions
│   └── lib/
│       └── utils.ts      # Utility functions
├── .github/              # GitHub templates and workflows
├── bin/                  # CLI executables
├── dist/                 # Production build output
└── docs/                 # Documentation files
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/anonymous243/BizAnalyst-AI
cd BizAnalyst-AI

# Install dependencies
npm install

# Create a branch
git checkout -b feature/your-feature-name

# Make changes and test
npm run dev

# Commit using conventional commits
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### Ways to Contribute

- 🐛 Report bugs and suggest features
- 📝 Improve documentation
- 💻 Submit pull requests
- 🔍 Review code changes
- 💬 Help others in issues

---

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).


---

## 🔒 Security

### API Key Security

⚠️ **Important**: This application requires an API key for AI features.

- Never commit your API key to version control
- Use `.env.local` for local development (already gitignored)
- For production, implement a backend proxy
- Monitor API usage for unusual activity

See [SECURITY.md](SECURITY.md) for our full security policy.

### Reporting Vulnerabilities

Please report security vulnerabilities responsibly. **Do not** create public issues for security concerns. See [SECURITY.md](SECURITY.md) for reporting guidelines.

---

## 📞 Support

- **Documentation**: See files in this repository
- **Issues**: [GitHub Issues](https://github.com/anonymous243/BizAnalyst-AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/anonymous243/BizAnalyst-AI/discussions)

---

## 🙏 Acknowledgments

Built with amazing open source libraries:

- [React](https://react.dev/) - UI framework
- [Recharts](https://recharts.org/) - Charting library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Icon library
- [Papa Parse](https://www.papaparse.com/) - CSV parsing
- [XLSX](https://sheetjs.com/) - Excel file processing

---

<div align="center">

**Made with ❤️**

[Report Bug](https://github.com/anonymous243/BizAnalyst-AI/issues/new?template=bug_report.yml) • [Request Feature](https://github.com/anonymous243/BizAnalyst-AI/issues/new?template=feature_request.yml) • [Ask Question](https://github.com/anonymous243/BizAnalyst-AI/issues/new?template=question.yml)

</div>
