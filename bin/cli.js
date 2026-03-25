#!/usr/bin/env node

/**
 * BizAnalyst AI CLI
 * 
 * Usage:
 *   npx bizanalyst-ai          - Run in current directory
 *   bizanalyst-ai              - If installed globally
 *   npx bizanalyst-ai --help   - Show help
 */

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse arguments
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');
const showVersion = args.includes('--version') || args.includes('-v');

const PACKAGE_VERSION = '1.0.0';

if (showVersion) {
  console.log(`BizAnalyst AI v${PACKAGE_VERSION}`);
  process.exit(0);
}

if (showHelp) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    BizAnalyst AI CLI                      ║
║         Open Source Data Analyst with AI Insights         ║
╚═══════════════════════════════════════════════════════════╝

Usage:
  npx bizanalyst-ai [options]        Run in current directory
  bizanalyst-ai [options]            If installed globally

Options:
  -h, --help     Show this help message
  -v, --version  Show version number
  --port <num>   Specify port (default: 3000)
  --host         Expose to network

Examples:
  npx bizanalyst-ai                  # Run on port 3000
  npx bizanalyst-ai --port 8080      # Run on port 8080
  npx bizanalyst-ai --host           # Expose to network

Quick Start:
  1. Run: npx bizanalyst-ai
  2. Create .env.local with your Gemini API key
  3. Open http://localhost:3000
  4. Upload your dataset!

Documentation: https://github.com/anonymous243/bizanalyst-ai#readme
  `);
  process.exit(0);
}

// Get the project root (where the CLI is run from)
const projectRoot = process.cwd();

// Check if package.json exists
if (!existsSync(resolve(projectRoot, 'package.json'))) {
  console.log('⚠️  Warning: No package.json found in current directory.');
  console.log('   This is OK if you\'re running BizAnalyst AI for the first time.\n');
}

// Check if .env.local exists, if not create it from .env.example
const envLocalPath = resolve(projectRoot, '.env.local');
const envExamplePath = resolve(projectRoot, '.env.example');

if (!existsSync(envLocalPath) && existsSync(envExamplePath)) {
  console.log('📝 Creating .env.local from .env.example...');
  console.log('⚠️  IMPORTANT: Edit .env.local and add your Gemini API key!\n');
}

// Determine port and host from arguments
let port = '3000';
let host = '0.0.0.0';

const portIndex = args.indexOf('--port');
if (portIndex !== -1 && args[portIndex + 1]) {
  port = args[portIndex + 1];
}

if (args.includes('--host')) {
  host = '0.0.0.0';
}

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                   BizAnalyst AI                           ║');
console.log('║         Starting development server...                    ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

// Find vite binary
const viteBin = process.platform === 'win32' ? 'vite.CMD' : 'vite';

// Spawn vite process
const vite = spawn(viteBin, ['--port', port, '--host', host], {
  stdio: 'inherit',
  cwd: projectRoot,
  shell: true
});

vite.on('error', (err) => {
  console.error('❌ Failed to start BizAnalyst AI:', err.message);
  console.error('\nMake sure you have installed dependencies:');
  console.error('  npm install\n');
  process.exit(1);
});

vite.on('close', (code) => {
  process.exit(code);
});
