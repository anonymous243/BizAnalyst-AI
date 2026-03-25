<div align="center">

# BizAnalyst AI

**Open Source Data Analyst with AI-Powered Insights**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![npm](https://img.shields.io/badge/npm-%3E%3D9.0.0-CB3837?logo=npm&logoColor=white)](https://www.npmjs.com/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

A professional-grade, open-source data analysis tool for automated data cleaning, visualization, and AI-powered insights.

[Features](#features) • [Install](#-installation) • [Documentation](#documentation) • [Contributing](#contributing) • [Security](#security)

</div>

---

## Features

- 📊 **Interactive Visualizations** - Distributions, correlations, trends, and scatter plots
- 🤖 **AI-Powered Insights** - Ask questions about your data using Google's Gemini AI
- 🧹 **Smart Data Cleaning** - Professional auto-clean with outlier detection and imputation
- 📁 **Multiple File Formats** - Support for CSV and Excel files (.csv, .xlsx, .xls)
- 📷 **Export Charts** - Download any visualization as high-quality PNG
- 🎨 **Presentation Mode** - Clean, distraction-free view for presentations
- 🔍 **Global Filters** - Filter data across all views simultaneously
- 📈 **Predictive Forecasting** - 30-day forecasting for time series data

## 📦 Installation

Choose the method that works best for you:

### Option 1: Download from GitHub (Recommended)

```bash
# Clone the repository
git clone https://github.com/anonymous243/bizanalyst-ai.git
cd bizanalyst-ai

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local and add your Gemini API key

# Start development server
npm run dev
```

**Or download as ZIP:** Click **Code** → **Download ZIP** on [GitHub](https://github.com/anonymous243/bizanalyst-ai)

### Option 2: Use npx (No Installation)

```bash
npx bizanalyst-ai
```

### Option 3: Install Globally via npm

```bash
npm install -g bizanalyst-ai
bizanalyst-ai
```

> 📖 See [INSTALL.md](INSTALL.md) for detailed installation guide and troubleshooting.

---

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Gemini API Key** (free from [Google AI Studio](https://makersuite.google.com/app/apikey))

### First Time Setup

```bash
# Set up environment
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### Run the App

```bash
npm run dev
```

Open your browser to **http://localhost:3000**

### Build for Production

```bash
npm run build
npm run preview
```

---

## Documentation

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Remove build artifacts |

### Usage Guide

1. **Upload Your Data**: Click "Upload CSV/XLSX" or drag and drop a file
2. **Review Insights**: Check the Auto Insights panel for data quality issues
3. **Clean Data**: Use one-click cleaning actions or enable "Professional Auto-Clean"
4. **Explore Visualizations**: Navigate through Distributions, Correlations, and Trends tabs
5. **Ask AI Questions**: Use the AI Analyst tab to ask questions about your data
6. **Export Charts**: Click the 📷 camera icon on any chart to download as PNG

### Global Filters

Filter your dataset by categorical columns with low cardinality (<15 unique values). Filters apply across all views.

### Expert Mode: Professional Auto-Clean

When enabled, automatically:
- Removes duplicate rows
- Imputes missing values (median for numeric, mode for categorical)
- Clips outliers using IQR method
- Groups high-cardinality categories

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/bizanalyst-ai.git
cd bizanalyst-ai

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

## Security

⚠️ **IMPORTANT: API Key Security**

BizAnalyst AI requires a Gemini API key. Follow these security best practices:

1. **Never commit your API key** - `.env.local` is gitignored by default
2. **Use separate keys** for development and production
3. **For production**, implement a backend proxy to avoid exposing keys client-side
4. **Monitor API usage** for unusual activity

See our [Security Policy](SECURITY.md) for more details.

### Reporting Vulnerabilities

Please report security vulnerabilities responsibly via GitHub Security Advisories or email. **Do not** create public issues for security concerns.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Visualization**: Recharts
- **AI**: Google Gemini API
- **Data Processing**: Papa Parse (CSV), XLSX (Excel)
- **Icons**: Lucide React

---

## License

This project is licensed under the [Apache License 2.0](LICENSE).

```
Copyright 2024 BizAnalyst AI Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

## Acknowledgments

- Built with [Google Gemini AI](https://ai.google.dev/)
- UI components from [Lucide Icons](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">

**Made with ❤️ by the BizAnalyst AI Contributors**

[Report Bug](https://github.com/anonymous243/bizanalyst-ai/issues/new?template=bug_report.yml) • [Request Feature](https://github.com/anonymous243/bizanalyst-ai/issues/new?template=feature_request.yml) • [Ask Question](https://github.com/anonymous243/bizanalyst-ai/issues/new?template=question.yml)

</div>
