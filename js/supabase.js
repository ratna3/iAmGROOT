// Supabase Client and Database Operations

class SupabaseService {
    constructor() {
        this.client = null;
        this.currentUser = null;
        this.authUser = null;
        this.initialized = false;
        this.authStateCallbacks = [];
        this.lastAuthEvent = null;  // Store last auth event for late subscribers
        this.lastSession = null;    // Store last session for late subscribers
    }

    // Initialize Supabase client
    async init() {
        console.log('[Supabase] init() called, initialized:', this.initialized);
        
        if (this.initialized) {
            console.log('[Supabase] Already initialized, returning true');
            return true;
        }
        
        try {
            // Check if Supabase is configured
            if (CONFIG.SUPABASE_URL === 'YOUR_SUPABASE_URL' || 
                CONFIG.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
                console.warn('[Supabase] Not configured. Running in local-only mode.');
                this.initialized = true;
                return false;
            }
            
            console.log('[Supabase] Creating client with URL:', CONFIG.SUPABASE_URL);
            
            // Initialize Supabase client with auth options for OAuth
            this.client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true,  // Critical for OAuth callback handling
                    flowType: 'pkce'  // Use PKCE flow for better security
                }
            });
            
            console.log('[Supabase] Client created successfully');
            
            // Setup auth state listener
            this.setupAuthListener();
            console.log('[Supabase] Auth listener set up');
            
            // Check for existing session
            console.log('[Supabase] Checking for existing session...');
            const { data: { session }, error: sessionError } = await this.client.auth.getSession();
            
            if (sessionError) {
                console.error('[Supabase] Error getting session:', sessionError);
            }
            
            console.log('[Supabase] Session check complete:', session ? 'Session found' : 'No session');
            
            if (session) {
                this.authUser = session.user;
                console.log('[Supabase] User from session:', session.user.email);
                await this.getOrCreateUser();
            }
            
            this.initialized = true;
            console.log('[Supabase] Initialization complete!');
            return true;
        } catch (error) {
            console.error('[Supabase] Failed to initialize:', error);
            this.initialized = true;
            return false;
        }
    }

    // Setup authentication state listener
    setupAuthListener() {
        if (!this.client) return;
        
        this.client.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
            
            // Store the last event and session for late subscribers
            this.lastAuthEvent = event;
            this.lastSession = session;
            
            if (event === 'SIGNED_IN' && session) {
                console.log('User signed in:', session.user.email);
                this.authUser = session.user;
                await this.getOrCreateUser();
            } else if (event === 'SIGNED_OUT') {
                console.log('User signed out');
                this.authUser = null;
                this.currentUser = null;
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('Token refreshed');
            } else if (event === 'INITIAL_SESSION') {
                console.log('Initial session detected:', session ? session.user.email : 'No session');
                if (session) {
                    this.authUser = session.user;
                    await this.getOrCreateUser();
                }
            }
            
            // Notify all callbacks
            this.authStateCallbacks.forEach(callback => callback(event, session));
        });
    }

    // Register auth state change callback
    // If the auth state has already been set, immediately notify the new callback
    onAuthStateChange(callback) {
        this.authStateCallbacks.push(callback);
        
        // If we already have an auth state, immediately notify this callback
        // This ensures late subscribers don't miss the initial auth event
        if (this.lastAuthEvent !== null) {
            console.log('Replaying auth event to new subscriber:', this.lastAuthEvent);
            callback(this.lastAuthEvent, this.lastSession);
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        if (!this.client) {
            throw new Error('Supabase client not initialized');
        }
        
        try {
            console.log('Starting Google OAuth flow...');
            console.log('Redirect URL:', CONFIG.REDIRECT_URL);
            
            const { data, error } = await this.client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: CONFIG.REDIRECT_URL,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });
            
            if (error) {
                console.error('OAuth error:', error);
                throw error;
            }
            
            console.log('OAuth initiated:', data);
            return data;
        } catch (error) {
            console.error('Google sign in failed:', error);
            throw error;
        }
    }

    // Sign out
    async signOut() {
        if (!this.client) return;
        
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            
            this.authUser = null;
            this.currentUser = null;
            localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ID);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_CONVERSATION);
            
            return true;
        } catch (error) {
            console.error('Sign out failed:', error);
            throw error;
        }
    }

    // Get current auth session
    async getSession() {
        if (!this.client) return null;
        
        try {
            const { data: { session }, error } = await this.client.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('Failed to get session:', error);
            return null;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.authUser !== null;
    }

    // Get authenticated user
    getAuthUser() {
        return this.authUser;
    }

    // Check if Supabase is available
    isAvailable() {
        return this.client !== null;
    }

    // Get or create user in users table (linked to auth user)
    async getOrCreateUser() {
        if (!this.client || !this.authUser) return null;
        
        try {
            // Check for existing user by auth ID
            const { data: existingUser, error: fetchError } = await this.client
                .from('users')
                .select('*')
                .eq('auth_id', this.authUser.id)
                .single();
            
            if (!fetchError && existingUser) {
                this.currentUser = existingUser;
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ID, existingUser.id);
                return existingUser;
            }
            
            // Create new user linked to auth user
            const { data: newUser, error: insertError } = await this.client
                .from('users')
                .insert([{ 
                    auth_id: this.authUser.id,
                    email: this.authUser.email,
                    anonymous_id: null
                }])
                .select()
                .single();
            
            if (insertError) throw insertError;
            
            // Store user ID
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ID, newUser.id);
            this.currentUser = newUser;
            
            return newUser;
        } catch (error) {
            console.error('Failed to get/create user:', error);
            return null;
        }
    }

    // Generate unique anonymous ID (kept for backwards compatibility)
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
