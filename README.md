<div align="center">

# 🌱 We are GROOTS

### AI Chatbot Powered by Puter.js & Supabase

<img src="assets/groot.jpg" alt="Baby Groot" width="200" height="200" style="border-radius: 20px;">

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Made with Puter.js](https://img.shields.io/badge/Made%20with-Puter.js-7c3aed)](https://github.com/heyPuter/puter/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://i-am-groot-eight.vercel.app)

**A free, unlimited AI chatbot with Claude API access - no API keys required!**

[🚀 Live Demo](https://i-am-groot-eight.vercel.app) • [📖 Documentation](#-documentation) • [🤝 Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🎬 Demo](#-demo)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [🗃️ Database Schema](#️-database-schema)
- [🤖 Available AI Models](#-available-ai-models)
- [📱 Usage Guide](#-usage-guide)
- [🌐 How Puter.js Works](#-how-puterjs-works)
- [🎨 Customization](#-customization)
- [📝 API Reference](#-api-reference)
- [🔒 Security](#-security)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [🙏 Credits & Attributions](#-credits--attributions)
- [👨‍💻 Author](#-author)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🆓 **Free & Unlimited** | Uses Puter.js for free, unlimited access to Claude AI models |
| 🤖 **Multiple Models** | Support for Claude Sonnet, Opus, and Haiku variants |
| ⚡ **Streaming Responses** | Real-time streaming for natural conversation flow |
| 💾 **Chat History** | Conversations automatically saved to Supabase database |
| 🌓 **Dark/Light Theme** | Toggle between themes for comfortable viewing |
| 📤 **Export Chats** | Export conversations as JSON files |
| 🔍 **Search Conversations** | Quickly find past conversations |
| 🔄 **Regenerate Response** | Regenerate AI responses with one click |
| 📱 **Responsive Design** | Works seamlessly on desktop and mobile |
| 🌱 **Dancing Groot 3D** | Interactive 3D animated Groot model using Three.js |
| 🔒 **No Backend Required** | Runs entirely in the browser |

---

## 🎬 Demo

Visit the live demo: **[i-am-groot-eight.vercel.app](https://i-am-groot-eight.vercel.app)**

### Features Showcase

- **3D Dancing Groot** - Animated GLB model on the welcome screen
- **Real-time AI Chat** - Instant responses with streaming
- **Conversation Management** - Create, search, and delete conversations
- **Theme Toggle** - Switch between dark and light modes

---

## 🚀 Quick Start

### Option 1: Run Locally (Without Supabase)

```bash
# Clone the repository
git clone https://github.com/ratna3/iAmGROOT.git

# Navigate to the project
cd iAmGROOT

# Open in browser (or use a local server)
open index.html
# or
python -m http.server 8000
```

> **Note:** Without Supabase, conversations won't be persisted.

### Option 2: With Supabase Integration

1. **Create a Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key from Settings → API

2. **Configure the Application**
   
   Update `js/config.js` with your credentials:
   ```javascript
   SUPABASE_URL: 'https://your-project.supabase.co',
   SUPABASE_ANON_KEY: 'your-anon-key'
   ```

3. **Run the Database Migrations**
   
   Execute the SQL files in the `migrations/` folder in your Supabase SQL Editor.

4. **Launch the Application**
   ```bash
   open index.html
   ```

---

## 📁 Project Structure

```
iAmGROOT/
├── 📄 index.html           # Main chatbot interface
├── 📁 assets/
│   ├── 🖼️ groot.jpg         # Baby Groot logo
│   └── 🎬 groot_dancing.glb # 3D animated Groot model
├── 📁 css/
│   └── 🎨 styles.css        # Complete styling with themes
├── 📁 js/
│   ├── ⚙️ config.js         # Configuration settings
│   ├── 🗄️ supabase.js       # Database operations
│   ├── 🤖 puter-chat.js     # Puter.js AI integration
│   ├── 🌱 groot-model.js    # Three.js 3D model loader
│   └── 📱 app.js            # Main application logic
├── 📁 migrations/
│   └── 📊 *.sql             # Supabase migration files
├── 📄 vercel.json           # Vercel deployment config
├── 📄 progress.md           # Project progress tracker
├── 📄 LICENSE               # MIT License
├── 📄 SECURITY.md           # Security policy
├── 📄 CONTRIBUTING.md       # Contribution guidelines
└── 📄 README.md             # This file
```

---

## 🔧 Configuration

Edit `js/config.js` to customize the application:

```javascript
const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'your-supabase-url',
    SUPABASE_ANON_KEY: 'your-anon-key',
    
    // AI Settings
    DEFAULT_MODEL: 'claude-sonnet-4-5',
    ENABLE_STREAMING: true,
    
    // App Settings
    APP_NAME: 'We are GROOTS',
    MAX_MESSAGE_LENGTH: 32000,
    
    // Storage Keys
    STORAGE_KEYS: {
        THEME: 'theme',
        USER_ID: 'userId',
        CURRENT_CONVERSATION: 'currentConversation'
    }
};
```

---

## 🗃️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   users     │       │  conversations  │       │  messages   │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)         │──┐    │ id (PK)     │
│ created_at  │  └───>│ user_id (FK)    │  └───>│ conv_id(FK) │
│ email       │       │ title           │       │ role        │
│ anonymous_id│       │ model           │       │ content     │
│ display_name│       │ created_at      │       │ model       │
└─────────────┘       │ updated_at      │       │ created_at  │
                      └─────────────────┘       └─────────────┘
```

### Tables

| Table | Description |
|-------|-------------|
| `users` | Stores user information (anonymous or authenticated) |
| `conversations` | Stores chat threads with titles and model info |
| `messages` | Stores individual messages with role and content |

---

## 🤖 Available AI Models

Puter.js provides free, unlimited access to these Claude models:

| Model | ID | Best For |
|-------|-----|----------|
| **Claude Sonnet 4.5** | `claude-sonnet-4-5` | Balanced performance & speed |
| **Claude Sonnet 4** | `claude-sonnet-4` | Fast, general-purpose tasks |
| **Claude Opus 4.5** | `claude-opus-4-5` | Most capable, complex reasoning |
| **Claude Opus 4.1** | `claude-opus-4-1` | Advanced reasoning tasks |
| **Claude Opus 4** | `claude-opus-4` | Deep analytical work |
| **Claude Haiku 4.5** | `claude-haiku-4-5` | Fastest responses |

### Usage Example with Puter.js

```javascript
// Simple chat
const response = await puter.ai.chat('Hello, how are you?');

// With streaming
const stream = await puter.ai.chat('Tell me a story', {
    model: 'claude-sonnet-4-5',
    stream: true
});

for await (const chunk of stream) {
    console.log(chunk);
}
```

---

## 📱 Usage Guide

### Basic Operations

| Action | How To |
|--------|--------|
| 🆕 **New Chat** | Click the `+` button in the sidebar |
| 📝 **Send Message** | Type and press `Enter` (or click Send) |
| 🔄 **Switch Conversations** | Click any conversation in the sidebar |
| 🗑️ **Delete Conversation** | Hover and click the trash icon |
| 📤 **Export Chat** | Click the download icon in the header |
| 🌓 **Toggle Theme** | Click the sun/moon icon |
| 🔍 **Search** | Use the search box in the sidebar |
| 🔄 **Regenerate** | Click the regenerate button in the header |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line in message |

---

## 🌐 How Puter.js Works

```
┌─────────────────────────────────────────────────────────┐
│                    Puter.js Architecture                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────┐    ┌─────────────┐    ┌───────────┐  │
│   │  Your App   │───>│  Puter.js   │───>│  Claude   │  │
│   │  (Browser)  │<───│   (SDK)     │<───│    API    │  │
│   └─────────────┘    └─────────────┘    └───────────┘  │
│                                                         │
│   • No API keys needed                                  │
│   • Free & unlimited for developers                     │
│   • Users authenticate through Puter                    │
│   • Runs entirely in the browser                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Puter.js uses the **"User-Pays"** model:
- ✅ **Developers** get free, unlimited API access
- ✅ **Users** authenticate through Puter and cover their usage
- ✅ **No server-side setup** required
- ✅ **No API key management** headaches

Learn more: [Puter.js Documentation](https://docs.puter.com) | [GitHub](https://github.com/heyPuter/puter/)

---

## 🎨 Customization

### Themes

The app supports automatic theme detection and manual toggle. Customize colors in `css/styles.css`:

```css
:root {
    /* Light Theme */
    --accent-color: #7c3aed;
    --bg-primary: #ffffff;
    --text-primary: #1a1a1a;
}

[data-theme="dark"] {
    /* Dark Theme */
    --bg-primary: #1a1a1a;
    --text-primary: #ffffff;
}
```

### 3D Model

Replace `assets/groot_dancing.glb` with your own GLB model. Update `js/groot-model.js` if needed.

---

## 📝 API Reference

### Puter.js AI Chat

```javascript
// Basic usage
await puter.ai.chat(message, options);

// With options
await puter.ai.chat('Hello', {
    model: 'claude-sonnet-4-5',
    stream: true,
    tools: [] // Optional function calling
});
```

### Supabase Operations

```javascript
// Save message
await supabaseService.saveMessage(conversationId, role, content, model);

// Load conversations
const conversations = await supabaseService.loadConversations(userId);

// Delete conversation
await supabaseService.deleteConversation(conversationId);
```

---

## 🔒 Security

### Best Practices Implemented

- ✅ Row Level Security (RLS) enabled on all Supabase tables
- ✅ No sensitive data stored in client-side code
- ✅ HTTPS enforced via Vercel
- ✅ Security headers configured in `vercel.json`
- ✅ Input validation and sanitization

### Reporting Vulnerabilities

Please report security vulnerabilities to: [ratnakirtiscr@gmail.com](mailto:ratnakirtiscr@gmail.com)

See [SECURITY.md](SECURITY.md) for our full security policy.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/iAmGROOT.git

# Install dependencies (if any)
# This is a static site, no npm install needed!

# Start a local server
python -m http.server 8000
# or
npx serve .
```

### Code Style

- Use consistent indentation (2 or 4 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Test your changes before submitting

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Ratna Kirti

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Credits & Attributions

### 3D Model

| | |
|---|---|
| ![GLB](https://img.shields.io/badge/3D-GLB-orange) | **"Groot dancing"** by **Сhemaron** |
| | 🔗 Source: [Sketchfab](https://skfb.ly/6yDDF) |
| | 📜 License: [Creative Commons Attribution 4.0](http://creativecommons.org/licenses/by/4.0/) |

### Logo Artwork

| | |
|---|---|
| <img src="assets/groot.jpg" alt="Baby Groot" width="80"> | **"Baby Groot - Voodoo Doll Series: Marvel Universe"** by **Sylvain Drolet** |
| | 🔗 Source: [Dribbble](https://dribbble.com/shots/3004574-Baby-Groot-Voodoo-Doll-Series-Marvel-Universe) |
| | 🎨 Artist: [Sylvain Drolet](https://dribbble.com/sylvaindrolet) |

### Core Technology

| | |
|---|---|
| ![Puter.js](https://img.shields.io/badge/Puter.js-7c3aed) | **Puter.js** - Free, Unlimited AI API Access |
| | 🔗 GitHub: [github.com/heyPuter/puter](https://github.com/heyPuter/puter/) |
| | 📖 Docs: [docs.puter.com](https://docs.puter.com) |
| | 📜 License: AGPL-3.0 |

### Other Technologies

| Technology | Purpose | Link |
|------------|---------|------|
| **Supabase** | Database & Authentication | [supabase.com](https://supabase.com) |
| **Three.js** | 3D Graphics | [threejs.org](https://threejs.org) |
| **Vercel** | Hosting & Deployment | [vercel.com](https://vercel.com) |

---

## 👨‍💻 Author

<div align="center">

**Ratna Kirti**

[![Email](https://img.shields.io/badge/Email-ratnakirtiscr%40gmail.com-red?style=for-the-badge&logo=gmail)](mailto:ratnakirtiscr@gmail.com)
[![Discord](https://img.shields.io/badge/Discord-MinimeAI%20Community-5865F2?style=for-the-badge&logo=discord)](https://discord.gg/6nkRSETm)
[![GitHub](https://img.shields.io/badge/GitHub-%40ratna3-181717?style=for-the-badge&logo=github)](https://github.com/ratna3)
[![Twitter](https://img.shields.io/badge/X-%40RatnaKirti1-000000?style=for-the-badge&logo=x)](https://x.com/RatnaKirti1)

</div>

---

<div align="center">

### ⭐ Star this repo if you find it useful!

Made with 💜 and 🌱 by [Ratna Kirti](https://github.com/ratna3)

**"I am Groot!" 🌱**

</div>
