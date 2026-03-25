#!/bin/bash

# BizAnalyst AI - GitHub Setup Script
# This script helps you push your project to GitHub

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          BizAnalyst AI - GitHub Setup                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first:"
    echo "   Ubuntu/Debian: sudo apt install git"
    echo "   macOS: brew install git"
    echo "   Windows: Download from https://git-scm.com/"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Check if already a git repository
if [ -d ".git" ]; then
    echo "⚠️  This directory is already a git repository"
    read -p "Do you want to reinitialize? (y/N): " reinit
    if [[ $reinit =~ ^[Yy]$ ]]; then
        rm -rf .git
        echo "🗑️  Removed existing .git directory"
    else
        echo "Skipping git init..."
    fi
fi

# Initialize git repository
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
fi

echo ""

# Get GitHub username
read -p "Enter your GitHub username: " gh_username

if [ -z "$gh_username" ]; then
    echo "❌ GitHub username cannot be empty"
    exit 1
fi

echo ""
echo "📝 Updating configuration files with your username: $gh_username"

# Update package.json
sed -i "s|yourusername|$gh_username|g" package.json

# Update README.md
sed -i "s|yourusername|$gh_username|g" README.md

# Update INSTALL.md
sed -i "s|yourusername|$gh_username|g" INSTALL.md

# Update bin/cli.js
sed -i "s|yourusername|$gh_username|g" bin/cli.js

# Update DISTRIBUTION_GUIDE.md
sed -i "s|yourusername|$gh_username|g" DISTRIBUTION_GUIDE.md

echo "✅ Configuration files updated"
echo ""

# Add all files
echo "📦 Adding files to git..."
git add .
echo "✅ Files added"
echo ""

# Initial commit
echo "📝 Creating initial commit..."
git commit -m "Initial release: BizAnalyst AI v1.0.0

Features:
- Interactive data visualizations
- AI-powered insights with Gemini AI
- Professional auto-clean functionality
- Chart export to PNG
- Upload progress for large files
- Comprehensive documentation

License: Apache-2.0"

echo "✅ Initial commit created"
echo ""

# Ask if user wants to create GitHub repo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📢 Next Steps:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   → https://github.com/new"
echo "   → Repository name: bizanalyst-ai"
echo "   → Description: Open source data analyst tool with AI-powered insights"
echo "   → Public repository"
echo "   → DO NOT initialize with README, .gitignore, or license"
echo ""
read -p "Press Enter after you've created the repository..."

echo ""
echo "2. Add the GitHub remote and push:"
echo ""
echo "   git remote add origin https://github.com/$gh_username/bizanalyst-ai.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
read -p "Do you want to run these commands now? (Y/n): " push_now

if [[ ! $push_now =~ ^[Nn]$ ]]; then
    git remote add origin "https://github.com/$gh_username/bizanalyst-ai.git" 2>/dev/null || true
    git branch -M main
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "╔═══════════════════════════════════════════════════════════╗"
        echo "║              🎉 Successfully pushed to GitHub!            ║"
        echo "╚═══════════════════════════════════════════════════════════╝"
        echo ""
        echo "📬 Your project is now live at:"
        echo "   https://github.com/$gh_username/bizanalyst-ai"
        echo ""
        echo "📦 Next: Create your first release"
        echo "   → https://github.com/$gh_username/bizanalyst-ai/releases/new"
        echo "   → Tag: v1.0.0"
        echo "   → Title: BizAnalyst AI v1.0.0 - Initial Release"
        echo ""
    else
        echo ""
        echo "⚠️  Push failed. Make sure you created the GitHub repository."
        echo "   Then run: git push -u origin main"
        echo ""
    fi
else
    echo ""
    echo "Manual commands to push:"
    echo ""
    echo "   git remote add origin https://github.com/$gh_username/bizanalyst-ai.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Don't forget to:"
echo "   • Add your Gemini API key to .env.local"
echo "   • Test the app: npm run dev"
echo "   • Share your project with the world!"
echo ""
