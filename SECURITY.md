# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of BizAnalyst AI seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email at [security@yourdomain.com](mailto:security@yourdomain.com) or create a draft security advisory on GitHub.

### What to Include

Please include the following information in your report:

* A description of the vulnerability
* Steps to reproduce the issue
* Affected versions
* Any potential impact
* If possible, suggestions for addressing the issue

### Response Timeline

You should receive a response within 48 hours acknowledging your report. After the initial reply, we will keep you informed of the progress toward a fix and announcement.

### Disclosure Policy

Once a vulnerability is reported:

1. We will confirm receipt of your report within 48 hours
2. We will investigate the issue and determine affected versions
3. We will work on a fix and test it thoroughly
4. We will notify you when the fix is released
5. We request that you keep the vulnerability confidential until a fix is available

We appreciate your responsible disclosure and will acknowledge your contribution when the issue is resolved.

## Security Best Practices for Users

### API Key Security

⚠️ **IMPORTANT**: BizAnalyst AI requires a Gemini API key to function. Follow these security best practices:

1. **Never commit your API key to version control**
   - Add `.env.local` to your `.gitignore`
   - Use environment variables in production

2. **Use separate API keys for development and production**
   - Create different API keys for different environments
   - Rotate keys periodically

3. **Limit API key permissions**
   - Only grant necessary permissions to your API keys
   - Monitor API usage for unusual activity

4. **For production deployments, use a backend proxy**
   - Never expose API keys in client-side code
   - Implement server-side API calls with proper authentication

### Data Privacy

* BizAnalyst AI processes data locally in the browser
* No data is sent to our servers (only to Google's Gemini API for AI features)
* For sensitive data, consider running the application offline without AI features

### Dependencies

We regularly update dependencies to patch security vulnerabilities. To ensure you're running a secure version:

```bash
npm audit
npm update
```

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1, 1.0.2). We recommend always running the latest version.

Subscribe to releases or watch the repository to stay informed about security updates.

## Acknowledgments

We would like to thank the following for their contributions to our security:

* All security researchers who responsibly disclose vulnerabilities
* The open source community for maintaining secure dependencies

---

For general questions about security, please open an issue with the "question" label.
