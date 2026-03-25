# Contributing to BizAnalyst AI

First off, thank you for considering contributing to BizAnalyst AI! It's people like you that make BizAnalyst AI such a great tool for the community.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible.
* **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets.
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.
* **Include details about your environment** (browser version, OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a detailed description of the suggested enhancement** including what problem it solves.
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Include screenshots and mockups** if applicable.
* **Explain why this enhancement would be useful** to most BizAnalyst AI users.

### Pull Requests

* Fill in the required template
* Follow the TypeScript style guide
* Include comments in your code where necessary
* Update documentation as needed
* Test your changes thoroughly
* Ensure all lint checks pass

## Development Setup

### Prerequisites

* Node.js >= 18.0.0
* npm >= 9.0.0

### Installation

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/bizanalyst-ai.git
   cd bizanalyst-ai
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to `http://localhost:3000`

## Style Guidelines

### TypeScript

* Use TypeScript for all new code
* Avoid `any` type when possible
* Use proper type definitions for props and state
* Follow the existing code style

### Code Formatting

* Use 2 spaces for indentation
* Maximum line length of 100 characters
* Use single quotes for strings
* Semicolons are required

### Component Structure

```tsx
import React, { useState } from 'react';
import { cn } from './lib/utils';

interface MyComponentProps {
  title: string;
  children?: React.ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div className={cn('container-class')}>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
```

## Testing

Before submitting a PR, ensure:

* The application builds without errors: `npm run build`
* TypeScript compilation passes: `npm run lint`
* All features work as expected in the browser
* No console errors or warnings

## Documentation

* Update README.md if you change functionality
* Add JSDoc comments for complex functions
* Update inline code comments where necessary

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat:` - New features
* `fix:` - Bug fixes
* `docs:` - Documentation changes
* `style:` - Code style changes (formatting, etc.)
* `refactor:` - Code refactoring
* `test:` - Test additions or changes
* `chore:` - Maintenance tasks

Example:
```
feat: add export to CSV functionality

- Added CSV export button to data table
- Implemented Papa Parse for CSV generation
- Added unit tests for export function
```

## Questions?

Feel free to open an issue with the "question" label if you have any questions about contributing!

## License

By contributing to BizAnalyst AI, you agree that your contributions will be licensed under the [Apache 2.0 License](LICENSE).
