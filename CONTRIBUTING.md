# Contributing to Chiku

Thank you for your interest in contributing to Chiku! This document provides guidelines and information for contributors.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork
   ```bash
   git clone https://github.com/your-username/Chiku.git
   cd Chiku
   ```
3. **Install** dependencies
   ```bash
   npm install
   ```
4. **Configure** the bot
   ```bash
   cp config.example.yml config.yml
   ```
   Fill in your credentials in `config.yml`.

5. **Create a branch** for your changes
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Development

### Code Style

- Use consistent indentation (2 spaces)
- Follow existing code patterns and conventions
- Use descriptive variable and function names
- Add comments for complex logic
- Keep functions focused and small

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, etc.)
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks

Examples:
```
feat: add playlist shuffle command
fix: resolve voice channel disconnect issue
docs: update installation guide
```

### Testing

- Test your changes locally before submitting
- Ensure the bot starts without errors
- Verify commands work as expected
- Check the dashboard for any UI regressions

## Pull Request Process

1. **Update documentation** if needed
2. **Test thoroughly** on your own server
3. **Write a clear PR description** explaining:
   - What the change does
   - Why it's needed
   - How to test it
4. **Link related issues** if applicable
5. **Request a review** from maintainers

## Reporting Bugs

When reporting bugs, please include:

- **Description** of the bug
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (Node.js version, OS, etc.)

## Feature Requests

We welcome feature requests! Please:

- Check existing issues first
- Clearly describe the feature
- Explain the use case
- Consider implementation details

## Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- No harassment or discrimination

## Questions?

If you have questions, join our [Discord Support Server](https://discord.gg/uskTjqz5ah) or open a [GitHub Issue](https://github.com/Alivelyyy/Chiku/issues).

Thank you for contributing to Chiku! 🎵
