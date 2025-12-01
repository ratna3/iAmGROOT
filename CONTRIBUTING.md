# Contributing to We are GROOTS 🌱

Thank you for your interest in contributing to **We are GROOTS**! We welcome contributions from everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors, regardless of:

- Age, body size, disability, ethnicity, gender identity
- Level of experience, education, socio-economic status
- Nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behaviors include:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**

- Trolling, insulting/derogatory comments, personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could be considered inappropriate

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git installed on your machine
- Basic knowledge of HTML, CSS, JavaScript
- A GitHub account
- (Optional) Supabase account for database features

### Fork the Repository

1. Navigate to [github.com/ratna3/iAmGROOT](https://github.com/ratna3/iAmGROOT)
2. Click the "Fork" button in the top-right corner
3. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/iAmGROOT.git
cd iAmGROOT
```

## 💡 How to Contribute

### Reporting Bugs

Before creating a bug report:

1. Check the [existing issues](https://github.com/ratna3/iAmGROOT/issues)
2. Ensure you're using the latest version
3. Collect information about the bug

**When reporting, include:**

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable
- Console error messages

### Suggesting Features

We love feature suggestions! Please:

1. Check if the feature already exists or is planned
2. Create an issue with the "enhancement" label
3. Describe the feature and its use case
4. Explain why it would benefit users

### Code Contributions

1. Find an issue to work on (or create one)
2. Comment on the issue to claim it
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## 🛠️ Development Setup

### Local Development

1. Clone the repository
2. Configure Supabase (optional):
   - Create a Supabase project
   - Update `js/config.js` with your credentials
   - Run the migration files in `supabase/migrations/`

3. Start a local server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve

# Using PHP
php -S localhost:8080
```

4. Open `http://localhost:8080` in your browser

### Project Structure

```
iAmGROOT/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── config.js       # Configuration
│   ├── supabase.js     # Database client
│   ├── puter-chat.js   # AI chat logic
│   ├── groot-model.js  # 3D model loader
│   └── app.js          # Main application
├── supabase/
│   └── migrations/     # Database migrations
└── assets/             # Images and 3D models
```

## 🔄 Pull Request Process

### Before Submitting

1. Update documentation if needed
2. Test your changes thoroughly
3. Ensure code follows style guidelines
4. Write meaningful commit messages

### Commit Message Format

```
type(scope): brief description

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(chat): add message regeneration feature
fix(ui): resolve dark mode toggle issue
docs(readme): update installation instructions
```

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] Added/updated documentation
- [ ] Tested on multiple browsers
- [ ] No console errors or warnings
- [ ] Meaningful commit messages

### Review Process

1. Submit your PR
2. Maintainers will review within 48-72 hours
3. Address any feedback
4. Once approved, your PR will be merged

## 🎨 Style Guidelines

### JavaScript

- Use ES6+ features
- Prefer `const` and `let` over `var`
- Use descriptive variable names
- Add comments for complex logic
- Handle errors gracefully

```javascript
// Good
const fetchConversations = async () => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to fetch conversations:', err);
    return [];
  }
};

// Avoid
var getData = function() {
  // unclear purpose
}
```

### CSS

- Use CSS custom properties for themes
- Follow BEM-like naming conventions
- Mobile-first responsive design
- Organize properties logically

```css
/* Good */
.chat-message {
  /* Layout */
  display: flex;
  flex-direction: column;
  
  /* Spacing */
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  
  /* Visual */
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}
```

### HTML

- Use semantic elements
- Include ARIA labels for accessibility
- Keep markup clean and minimal

## 🌐 Community

### Get Help

- Join our [Discord](https://discord.gg/6nkRSETm)
- Open a [GitHub Discussion](https://github.com/ratna3/iAmGROOT/discussions)
- Tweet at [@RatnaKirti1](https://twitter.com/RatnaKirti1)

### Stay Updated

- Star the repository
- Watch for releases
- Follow the maintainers

---

## 🙏 Thank You!

Every contribution, no matter how small, makes a difference. Thank you for being part of the GROOTS community!

**I am Groot. We are GROOT!** 🌱

---

[Back to README](README.md) | [Security Policy](SECURITY.md) | [License](LICENSE)
