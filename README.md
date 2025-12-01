# 🤖 AI Chatbot with Puter.js

A free, unlimited AI chatbot powered by Puter.js for Claude API access and Supabase for data persistence.

## ✨ Features

- **Free & Unlimited**: Uses Puter.js for free, unlimited access to Claude AI models
- **Multiple Models**: Support for Claude Sonnet, Opus, and Haiku variants
- **Streaming Responses**: Real-time streaming for longer queries
- **Chat History**: Conversations saved to Supabase database
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Export Chats**: Export conversations as JSON files
- **Responsive Design**: Works on desktop and mobile devices
- **No Backend Required**: Runs entirely in the browser

## 🚀 Quick Start

### Option 1: Run Locally (Without Supabase)

1. Open `index.html` in your browser
2. Start chatting! (Conversations won't be saved)

### Option 2: With Supabase Integration

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update `js/config.js` with your credentials:

```javascript
SUPABASE_URL: 'https://your-project.supabase.co',
SUPABASE_ANON_KEY: 'your-anon-key'
```

4. Open `index.html` in your browser
5. Your conversations will now be saved!

## 📁 Project Structure

```
iAmGROOT/
├── index.html          # Main chatbot interface
├── css/
│   └── styles.css      # All styling with dark/light theme
├── js/
│   ├── config.js       # Configuration (Supabase credentials)
│   ├── supabase.js     # Database operations
│   ├── puter-chat.js   # Puter.js AI integration
│   └── app.js          # Main application logic
├── progress.md         # Project progress tracker
└── README.md           # This file
```

## 🗃️ Database Schema

### Tables

**users**
- `id` (UUID, Primary Key)
- `created_at` (Timestamp)
- `email` (Text, optional)
- `anonymous_id` (Text)
- `display_name` (Text)

**conversations**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `title` (Text)
- `model` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**messages**
- `id` (UUID, Primary Key)
- `conversation_id` (UUID, Foreign Key)
- `role` (Text: user/assistant)
- `content` (Text)
- `model` (Text)
- `created_at` (Timestamp)

## 🤖 Available AI Models

| Model | Description |
|-------|-------------|
| `claude-sonnet-4-5` | Claude Sonnet 4.5 - Balanced performance |
| `claude-sonnet-4` | Claude Sonnet 4 - Fast and capable |
| `claude-opus-4-5` | Claude Opus 4.5 - Most capable |
| `claude-opus-4-1` | Claude Opus 4.1 - High capability |
| `claude-opus-4` | Claude Opus 4 - Advanced reasoning |
| `claude-haiku-4-5` | Claude Haiku 4.5 - Fastest responses |

## 🔧 Configuration Options

Edit `js/config.js` to customize:

- `DEFAULT_MODEL`: Default AI model to use
- `ENABLE_STREAMING`: Enable/disable streaming responses
- `MAX_MESSAGE_LENGTH`: Maximum message length
- `APP_NAME`: Application name

## 📱 Usage

1. **Start a New Chat**: Click the + button in the sidebar
2. **Select Model**: Choose your preferred Claude model from the dropdown
3. **Send Message**: Type your message and press Enter (or click Send)
4. **Switch Conversations**: Click on any conversation in the sidebar
5. **Delete Conversation**: Hover over a conversation and click the trash icon
6. **Export Chat**: Click the download icon to export as JSON
7. **Toggle Theme**: Click the sun/moon icon to switch themes

## 🌐 How Puter.js Works

Puter.js uses the "User-Pays" model:
- Developers get free, unlimited API access
- Users cover their own usage costs through Puter
- No API keys or server-side setup required

Learn more: [Puter.js Documentation](https://docs.puter.com)

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
