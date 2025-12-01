// Configuration file for the AI Chatbot
// Replace these values with your actual Supabase credentials

const CONFIG = {
    // Supabase Configuration
    // Get these from your Supabase project dashboard: https://supabase.com/dashboard
    SUPABASE_URL: 'YOUR_SUPABASE_URL', // e.g., 'https://xxxxx.supabase.co'
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY', // Your project's anon/public key
    
    // Default AI Model
    DEFAULT_MODEL: 'claude-sonnet-4-5',
    
    // Available Models
    AVAILABLE_MODELS: [
        { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', description: 'Balanced performance' },
        { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', description: 'Fast and capable' },
        { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', description: 'Most capable' },
        { id: 'claude-opus-4-1', name: 'Claude Opus 4.1', description: 'High capability' },
        { id: 'claude-opus-4', name: 'Claude Opus 4', description: 'Advanced reasoning' },
        { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', description: 'Fastest responses' }
    ],
    
    // App Settings
    APP_NAME: 'AI Chat',
    ENABLE_STREAMING: true,
    MAX_MESSAGE_LENGTH: 10000,
    
    // Local Storage Keys
    STORAGE_KEYS: {
        USER_ID: 'ai_chat_user_id',
        THEME: 'ai_chat_theme',
        CURRENT_CONVERSATION: 'ai_chat_current_conversation'
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.AVAILABLE_MODELS);
Object.freeze(CONFIG.STORAGE_KEYS);
