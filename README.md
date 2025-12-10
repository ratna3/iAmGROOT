<div align="center">

# 🌱 We are GROOTS

### AI Chatbot Powered by Puter.js & Supabase

<img src="assets/groot.jpg" alt="Baby Groot" width="200" height="200" style="border-radius: 20px;">

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Made with Puter.js](https://img.shields.io/badge/Made%20with-Puter.js-7c3aed)](https://github.com/heyPuter/puter/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://i-am-groot-lp4qnoxbv-ratna-kirtis-projects.vercel.app/)
[![Three.js](https://img.shields.io/badge/3D%20Graphics-Three.js-000000)](https://threejs.org)

**A free, unlimited AI chatbot with Claude API access - no API keys required!**

[🚀 Live Demo](https://i-am-groot-lp4qnoxbv-ratna-kirtis-projects.vercel.app/) • [📖 Documentation](#-documentation) • [🤝 Contributing](#-contributing)

</div>

---

## 🏆 Key Achievements

<div align="center">

| Achievement | Description |
|:-----------:|-------------|
| 🧠 **Superior AI Reasoning** | Powered by Claude AI models (Sonnet 4.5, Opus 4) through Puter.js, delivering exceptional reasoning, coding assistance, and analytical capabilities that surpass competing AI chatbots |
| 🌐 **Advanced Real-Time Web Search** | Ultra-enhanced web scraping capabilities leveraging **12 parallel SearXNG instances**, Google News RSS, Bing News RSS, DuckDuckGo API, and Wikipedia—outperforming Gemini's web search in accuracy, speed, and source diversity |
| 📚 **Intelligent Source Citations** | Every web-powered response includes properly cited sources with trust-scored rankings from 50+ verified domains |
| 💰 **100% Free & Unlimited** | No API keys, no subscriptions, no hidden costs—complete Claude AI access at zero cost |

</div>

---

## 📖 Table of Contents

- [🏆 Key Achievements](#-key-achievements)
- [✨ Features](#-features)
- [🔍 Web Search Architecture](#-web-search-architecture)
- [🎬 Demo](#-demo)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [🗃️ Database Schema](#️-database-schema)
- [🤖 Available AI Models](#-available-ai-models)
- [📱 Usage Guide](#-usage-guide)
- [🌐 How Puter.js Works](#-how-puterjs-works)
- [📚 Technology Stack & API Reference](#-technology-stack--api-reference)
- [🎨 Customization](#-customization)
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
| 🔍 **Ultra Web Search** | Real-time web scraping with 12 SearXNG instances + news APIs |
| 📰 **Live News Access** | Google News RSS, Bing News RSS for breaking news |
| 📚 **Source Citations** | Every web search response includes cited sources |
| 💾 **Chat History** | Conversations automatically saved to Supabase database |
| 🔐 **Google OAuth** | Secure authentication via Supabase Google OAuth |
| 🌓 **Dark/Light Theme** | Toggle between themes for comfortable viewing |
| 📤 **Export Chats** | Export conversations as JSON files |
| 🔄 **Regenerate Response** | Regenerate AI responses with one click |
| 📱 **Responsive Design** | Works seamlessly on desktop and mobile |
| 🌱 **Dancing Groot 3D** | Interactive 3D animated Groot model using Three.js |
| 🔒 **No Backend Required** | Runs entirely in the browser |

---

## 🔍 Web Search Architecture

Our ultra-enhanced web search system surpasses traditional AI web search capabilities through a multi-source parallel architecture:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Ultra-Enhanced Web Search Engine                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐        │
│  │   SearXNG       │   │  Google News    │   │   Bing News     │        │
│  │  (12 Instances) │   │     RSS         │   │     RSS         │        │
│  │  Meta-Search    │   │  Breaking News  │   │  Latest News    │        │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘        │
│           │                     │                     │                  │
│           └─────────────────────┼─────────────────────┘                  │
│                                 ▼                                        │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐        │
│  │   DuckDuckGo    │   │    Wikipedia    │   │  Trust Scoring  │        │
│  │   Instant API   │   │      API        │   │   (50+ Sites)   │        │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘        │
│           │                     │                     │                  │
│           └─────────────────────┼─────────────────────┘                  │
│                                 ▼                                        │
│                    ┌─────────────────────────┐                          │
│                    │    Result Aggregator    │                          │
│                    │  Ranking & Deduplication│                          │
│                    │    Citation Generator   │                          │
│                    └─────────────────────────┘                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Search Sources

| Source | Purpose | Instances/Endpoints |
|--------|---------|---------------------|
| **SearXNG** | Open-source meta-search engine | 12 public instances (parallel) |
| **Google News RSS** | Real-time breaking news | Via CORS proxies |
| **Bing News RSS** | Latest news coverage | Via allorigins proxy |
| **DuckDuckGo API** | Instant answers & general search | Direct API |
| **Wikipedia API** | Factual knowledge base | Direct API |

### Intelligent Features

- **🎯 Auto-Detection**: Automatically detects when queries need web search
- **⚡ Parallel Processing**: Searches multiple sources simultaneously
- **🔒 Trust Scoring**: 50+ trusted domains ranked for credibility
- **🇮🇳 India-Specific Detection**: Enhanced coverage for Indian news
- **💾 Smart Caching**: 5-minute cache for repeated queries
- **📊 Result Ranking**: Combines freshness, relevance, and trust scores

---

## 🎬 Demo

Visit the live demo: **[i-am-groot-lp4qnoxbv-ratna-kirtis-projects.vercel.app](https://i-am-groot-lp4qnoxbv-ratna-kirtis-projects.vercel.app/)**

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
│   ├── 🗄️ supabase.js       # Database & Google OAuth
│   ├── 🤖 puter-chat.js     # Puter.js AI integration
│   ├── 🔍 web-search.js     # Ultra-enhanced web search engine
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

## 📚 Technology Stack & API Reference

### Core Technologies

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Puter.js** | Latest | Free AI API Access (Claude) | [docs.puter.com](https://docs.puter.com) |
| **Supabase** | Latest | Database + Google OAuth | [supabase.com/docs](https://supabase.com/docs) |
| **Three.js** | r128 | 3D Graphics & Animation | [threejs.org/docs](https://threejs.org/docs) |
| **SearXNG** | Multiple | Meta-Search Engine | [docs.searxng.org](https://docs.searxng.org) |

---

### 🤖 Puter.js AI Integration

Puter.js provides **free, unlimited access** to Claude AI models with streaming support.

#### Basic Chat

```javascript
// Simple message
const response = await puter.ai.chat('Hello, how are you?');
console.log(response.message.content);
```

#### Streaming Responses

```javascript
// Real-time streaming with model selection
const response = await puter.ai.chat('Tell me a story', {
    model: 'claude-sonnet-4-5',
    stream: true
});

// Handle streaming chunks
for await (const chunk of response) {
    if (chunk?.text) {
        console.log(chunk.text);
    }
}
```

#### Available Models

```javascript
// Supported Claude models through Puter.js
const models = [
    'claude-sonnet-4-5',  // Balanced - recommended
    'claude-sonnet-4',    // Fast general-purpose
    'claude-opus-4-5',    // Most capable
    'claude-opus-4-1',    // Advanced reasoning
    'claude-opus-4',      // Deep analytical
    'claude-haiku-4-5'    // Fastest
];
```

#### Usage in Project (`js/puter-chat.js`)

```javascript
async function sendMessage(message, conversationHistory = []) {
    const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
    messages.push({ role: 'user', content: message });

    const response = await puter.ai.chat(messages, {
        model: CONFIG.DEFAULT_MODEL,
        stream: true
    });

    return response;
}
```

---

### 🔐 Supabase Authentication

Supabase provides PostgreSQL database with built-in Google OAuth.

#### Google OAuth Setup

```javascript
// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in with Google
async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent'
            }
        }
    });
    return { data, error };
}
```

#### Auth State Management

```javascript
// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        // User signed in
        const user = session.user;
    } else if (event === 'SIGNED_OUT') {
        // User signed out
    }
});
```

#### Database Operations

```javascript
// Save message
async saveMessage(conversationId, role, content, model) {
    const { data, error } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, role, content, model });
    return { data, error };
}

// Load conversations
async loadConversations(userId) {
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
    return data;
}
```

---

### 🌱 Three.js 3D Model

Three.js powers the animated 3D Groot model on the welcome screen.

#### GLTFLoader Setup

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

const loader = new GLTFLoader();
let mixer;

loader.load('assets/groot_dancing.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Setup animations
    mixer = new AnimationMixer(model);
    const clips = gltf.animations;

    if (clips.length > 0) {
        const action = mixer.clipAction(clips[0]);
        action.play();
    }
});
```

#### Animation Loop

```javascript
// Update animations in render loop
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) {
        mixer.update(delta);
    }

    renderer.render(scene, camera);
}
```

#### Usage in Project (`js/groot-model.js`)

```javascript
class GrootModel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.loadModel();
    }

    loadModel() {
        const loader = new THREE.GLTFLoader();
        loader.load('assets/groot_dancing.glb', (gltf) => {
            this.model = gltf.scene;
            this.scene.add(this.model);
            this.setupAnimation(gltf.animations);
        });
    }
}
```

---

### 🔍 Web Search API

Our custom web search module (`js/web-search.js`) aggregates multiple sources.

#### Core Search Function

```javascript
async performSearch(query) {
    const searches = [
        this.searchSearXNG(query),
        this.searchGoogleNews(query),
        this.searchBingNews(query),
        this.searchDuckDuckGo(query),
        this.searchWikipedia(query)
    ];

    const results = await Promise.allSettled(searches);
    return this.aggregateResults(results);
}
```

#### SearXNG Integration (12 Instances)

```javascript
const SEARXNG_INSTANCES = [
    'https://search.bus-hit.me',
    'https://search.sapti.me',
    'https://searx.be',
    'https://searx.tiekoetter.com',
    'https://searx.work',
    // ... 7 more instances
];

async searchSearXNG(query) {
    // Parallel search across all instances
    const promises = SEARXNG_INSTANCES.map(instance =>
        fetch(`${instance}/search?q=${encodeURIComponent(query)}&format=json`)
    );
    const results = await Promise.race(promises);
    return this.parseResults(results);
}
```

#### Trust Scoring System

```javascript
const TRUSTED_DOMAINS = {
    // Tier 1 - Highest Trust (score: 100)
    'reuters.com': 100, 'apnews.com': 100, 'bbc.com': 100,

    // Tier 2 - Major News (score: 90)
    'nytimes.com': 90, 'theguardian.com': 90, 'washingtonpost.com': 90,

    // Tier 3 - Tech/Business (score: 85)
    'techcrunch.com': 85, 'bloomberg.com': 85, 'forbes.com': 85,

    // India-specific sources
    'ndtv.com': 85, 'hindustantimes.com': 85, 'thehindu.com': 90
    // ... 40+ more trusted domains
};
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
| **Supabase** | Database & Google OAuth | [supabase.com](https://supabase.com) |
| **Three.js** | 3D Graphics & Animation | [threejs.org](https://threejs.org) |
| **SearXNG** | Open-Source Meta-Search | [docs.searxng.org](https://docs.searxng.org) |
| **DuckDuckGo API** | Instant Answers | [duckduckgo.com](https://duckduckgo.com) |
| **Wikipedia API** | Knowledge Base | [mediawiki.org/wiki/API](https://www.mediawiki.org/wiki/API:Main_page) |
| **Vercel** | Hosting & Deployment | [vercel.com](https://vercel.com) |

---

## 👨‍💻 Author

<div align="center">

**Ratna Kirti**

[![Email](https://img.shields.io/badge/Email-ratnakirtiscr%40gmail.com-red?style=for-the-badge&logo=gmail)](mailto:ratnakirtiscr@gmail.com)
[![Discord](https://img.shields.io/badge/Discord-Ratna-For-Nerds%20Community-5865F2?style=for-the-badge&logo=discord)](https://discord.gg/zUWK77Yn)
[![GitHub](https://img.shields.io/badge/GitHub-%40ratna3-181717?style=for-the-badge&logo=github)](https://github.com/ratna3)
[![Twitter](https://img.shields.io/badge/X-%40RatnaKirti1-000000?style=for-the-badge&logo=x)](https://x.com/RatnaKirti1)

</div>

---

<div align="center">

### ⭐ Star this repo if you find it useful!

Made with 💜 and 🌱 by [Ratna Kirti](https://github.com/ratna3)

**"I am Groot!" 🌱**

</div>
