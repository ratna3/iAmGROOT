// Supabase Client and Database Operations

class SupabaseService {
    constructor() {
        this.client = null;
        this.currentUser = null;
        this.initialized = false;
    }

    // Initialize Supabase client
    async init() {
        if (this.initialized) return;
        
        try {
            // Check if Supabase is configured
            if (CONFIG.SUPABASE_URL === 'YOUR_SUPABASE_URL' || 
                CONFIG.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
                console.warn('Supabase not configured. Running in local-only mode.');
                this.initialized = true;
                return false;
            }
            
            // Initialize Supabase client
            this.client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            
            // Get or create user
            await this.getOrCreateUser();
            
            this.initialized = true;
            console.log('Supabase initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            this.initialized = true;
            return false;
        }
    }

    // Check if Supabase is available
    isAvailable() {
        return this.client !== null;
    }

    // Get or create anonymous user
    async getOrCreateUser() {
        if (!this.client) return null;
        
        try {
            // Check for existing user ID in local storage
            let userId = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ID);
            
            if (userId) {
                // Verify user exists in database
                const { data: existingUser, error } = await this.client
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();
                
                if (!error && existingUser) {
                    this.currentUser = existingUser;
                    return existingUser;
                }
            }
            
            // Create new anonymous user
            const anonymousId = this.generateAnonymousId();
            const { data: newUser, error } = await this.client
                .from('users')
                .insert([{ anonymous_id: anonymousId }])
                .select()
                .single();
            
            if (error) throw error;
            
            // Store user ID
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ID, newUser.id);
            this.currentUser = newUser;
            
            return newUser;
        } catch (error) {
            console.error('Failed to get/create user:', error);
            return null;
        }
    }

    // Generate unique anonymous ID
    generateAnonymousId() {
        return 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // ============ Conversation Operations ============

    // Create new conversation
    async createConversation(title = 'New Conversation', model = CONFIG.DEFAULT_MODEL) {
        if (!this.client || !this.currentUser) {
            return this.createLocalConversation(title, model);
        }
        
        try {
            const { data, error } = await this.client
                .from('conversations')
                .insert([{
                    user_id: this.currentUser.id,
                    title: title,
                    model: model
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to create conversation:', error);
            return this.createLocalConversation(title, model);
        }
    }

    // Create local conversation (fallback)
    createLocalConversation(title, model) {
        return {
            id: 'local_' + Date.now(),
            title: title,
            model: model,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isLocal: true
        };
    }

    // Get all conversations for current user
    async getConversations() {
        if (!this.client || !this.currentUser) {
            return [];
        }
        
        try {
            const { data, error } = await this.client
                .from('conversations')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('updated_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to get conversations:', error);
            return [];
        }
    }

    // Get single conversation
    async getConversation(conversationId) {
        if (!this.client) return null;
        
        try {
            const { data, error } = await this.client
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to get conversation:', error);
            return null;
        }
    }

    // Update conversation title
    async updateConversationTitle(conversationId, title) {
        if (!this.client) return false;
        
        try {
            const { error } = await this.client
                .from('conversations')
                .update({ title: title })
                .eq('id', conversationId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Failed to update conversation title:', error);
            return false;
        }
    }

    // Delete conversation
    async deleteConversation(conversationId) {
        if (!this.client) return false;
        
        try {
            const { error } = await this.client
                .from('conversations')
                .delete()
                .eq('id', conversationId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            return false;
        }
    }

    // ============ Message Operations ============

    // Save message to database
    async saveMessage(conversationId, role, content, model = null) {
        if (!this.client || conversationId.startsWith('local_')) {
            return this.createLocalMessage(conversationId, role, content, model);
        }
        
        try {
            const { data, error } = await this.client
                .from('messages')
                .insert([{
                    conversation_id: conversationId,
                    role: role,
                    content: content,
                    model: model
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to save message:', error);
            return this.createLocalMessage(conversationId, role, content, model);
        }
    }

    // Create local message (fallback)
    createLocalMessage(conversationId, role, content, model) {
        return {
            id: 'local_msg_' + Date.now(),
            conversation_id: conversationId,
            role: role,
            content: content,
            model: model,
            created_at: new Date().toISOString(),
            isLocal: true
        };
    }

    // Get all messages for a conversation
    async getMessages(conversationId) {
        if (!this.client || conversationId.startsWith('local_')) {
            return [];
        }
        
        try {
            const { data, error } = await this.client
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to get messages:', error);
            return [];
        }
    }

    // Delete message
    async deleteMessage(messageId) {
        if (!this.client) return false;
        
        try {
            const { error } = await this.client
                .from('messages')
                .delete()
                .eq('id', messageId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Failed to delete message:', error);
            return false;
        }
    }

    // ============ Utility Functions ============

    // Auto-generate conversation title from first message
    generateTitleFromMessage(message) {
        // Take first 50 characters of the message
        let title = message.substring(0, 50);
        
        // If truncated, add ellipsis
        if (message.length > 50) {
            title += '...';
        }
        
        return title;
    }

    // ============ Real-time Subscriptions ============

    // Subscribe to conversation changes
    subscribeToConversations(userId, onInsert, onUpdate, onDelete) {
        if (!this.client) return null;

        const channel = this.client
            .channel('conversations-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'conversations',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('New conversation:', payload.new);
                    if (onInsert) onInsert(payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'conversations',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('Conversation updated:', payload.new);
                    if (onUpdate) onUpdate(payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'conversations'
                },
                (payload) => {
                    console.log('Conversation deleted:', payload.old);
                    if (onDelete) onDelete(payload.old);
                }
            )
            .subscribe((status) => {
                console.log('Conversations subscription status:', status);
            });

        return channel;
    }

    // Subscribe to messages for a specific conversation
    subscribeToMessages(conversationId, onInsert, onDelete) {
        if (!this.client) return null;

        const channel = this.client
            .channel(`messages-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    console.log('New message:', payload.new);
                    if (onInsert) onInsert(payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    console.log('Message deleted:', payload.old);
                    if (onDelete) onDelete(payload.old);
                }
            )
            .subscribe((status) => {
                console.log(`Messages subscription status for ${conversationId}:`, status);
            });

        return channel;
    }

    // Unsubscribe from a channel
    unsubscribe(channel) {
        if (this.client && channel) {
            this.client.removeChannel(channel);
        }
    }

    // Unsubscribe from all channels
    unsubscribeAll() {
        if (this.client) {
            this.client.removeAllChannels();
        }
    }
}

// Create global instance
const supabaseService = new SupabaseService();
