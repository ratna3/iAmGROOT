# Security Policy

## 🔒 Reporting a Vulnerability

We take the security of **We are GROOTS** seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email us directly at: **ratnakirtiscr@gmail.com**
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge your report within 48 hours
- **Investigation**: We will investigate and validate the issue within 7 days
- **Resolution**: We aim to resolve critical issues within 14 days
- **Credit**: We will credit you in our security acknowledgments (unless you prefer anonymity)

## 🛡️ Security Best Practices

When using or contributing to this project, please follow these guidelines:

### For Users

1. **API Keys**: Never expose your Supabase keys publicly
2. **Environment Variables**: Use `.env` files for sensitive configuration
3. **HTTPS**: Always access the application over HTTPS
4. **Updates**: Keep your browser updated for the latest security patches

### For Contributors

1. **Dependencies**: Only add well-maintained, trusted dependencies
2. **Secrets**: Never commit API keys, passwords, or tokens
3. **Input Validation**: Always validate and sanitize user inputs
4. **XSS Prevention**: Escape all user-generated content before rendering
5. **CORS**: Be mindful of Cross-Origin Resource Sharing configurations

## 🔐 Current Security Measures

### Frontend Security

- Content Security Policy (CSP) headers via Vercel
- XSS protection through proper DOM manipulation
- No inline JavaScript execution
- Secure external resource loading

### Database Security

- Row Level Security (RLS) enabled on all Supabase tables
- User-specific data isolation
- Anonymous authentication with session management
- Prepared statements prevent SQL injection

### API Security

- Puter.js handles AI API authentication
- No sensitive API keys stored client-side
- Rate limiting through Puter.js infrastructure

## 📋 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## 🔄 Security Updates

Security updates will be released as needed:

- **Critical**: Immediate patch release
- **High**: Within 7 days
- **Medium**: Within 30 days
- **Low**: Next regular release

## 📜 Compliance

This project follows:

- OWASP Top 10 guidelines
- Modern web security best practices
- Responsible disclosure policy

---

<div align="center">

**Thank you for helping keep We are GROOTS secure! 🌱**

[Back to README](README.md)

</div>
