// Main Application Logic
// Handles UI interactions and coordinates between Puter.js and Supabase

class ChatApp {
    constructor() {
        // State
        this.currentConversation = null;
        this.conversations = [];
        this.messages = [];
        this.isLoading = false;
        this.pendingFiles = []; // Store files to be sent
        this.conversationsChannel = null; // Real-time subscription
        this.messagesChannel = null; // Real-time subscription
        this.isAuthenticated = false;
        
        // DOM Elements
        this.elements = {};
        
        // Initialize
        this.init();
    }

    async init() {
        // Cache DOM elements
        this.cacheElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up file handling
        this.setupFileHandling();
        
        // Initialize theme
        this.initTheme();
        
        // Initialize services
        await this.initServices();
        
        // Setup auth state listener
        this.setupAuthListener();
        
        // Check authentication state
        await this.checkAuthState();
        
        console.log('Chat app initialized');
    }

    // Setup authentication state listener
    setupAuthListener() {
        supabaseService.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.isAuthenticated = true;
                this.showApp();
                await this.loadConversations();
                this.setupRealtimeSubscriptions();
                this.updateUserInfo(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.isAuthenticated = false;
                this.showLoginScreen();
            }
        });
    }

    // Check current authentication state
    async checkAuthState() {
        const session = await supabaseService.getSession();
        
        if (session) {
            this.isAuthenticated = true;
            this.showApp();
            await this.loadConversations();
            this.setupRealtimeSubscriptions();
            this.updateUserInfo(session.user);
        } else {
            this.isAuthenticated = false;
            this.showLoginScreen();
        }
    }

    // Show login screen
    showLoginScreen() {
        this.elements.loginScreen.classList.add('active');
        this.elements.appContainer.style.display = 'none';
        this.elements.loadingOverlay.classList.remove('active');
    }

    // Show main app
    showApp() {
        this.elements.loginScreen.classList.remove('active');
        this.elements.appContainer.style.display = 'flex';
    }

    // Update user info in sidebar
    updateUserInfo(user) {
        if (user && this.elements.userEmail) {
            this.elements.userEmail.textContent = user.email || 'User';
        }
    }

    // Handle Google sign in
    async handleGoogleSignIn() {
        try {
            this.elements.loadingOverlay.classList.add('active');
            await supabaseService.signInWithGoogle();
        } catch (error) {
            console.error('Sign in failed:', error);
            this.showToast('Sign in failed. Please try again.', 'error');
            this.elements.loadingOverlay.classList.remove('active');
        }
    }

    // Handle sign out
    async handleSignOut() {
        try {
            await supabaseService.signOut();
            this.conversations = [];
            this.currentConversation = null;
            this.messages = [];
            this.showLoginScreen();
            this.showToast('Signed out successfully', 'success');
        } catch (error) {
            console.error('Sign out failed:', error);
            this.showToast('Sign out failed. Please try again.', 'error');
        }
    }

    cacheElements() {
        this.elements = {
            // App container
            appContainer: document.querySelector('.app-container'),
            
            // Login screen
            loginScreen: document.getElementById('loginScreen'),
            googleLoginBtn: document.getElementById('googleLoginBtn'),
            
            // User info
            userInfo: document.getElementById('userInfo'),
            userEmail: document.getElementById('userEmail'),
            logoutBtn: document.getElementById('logoutBtn'),
            
            // Sidebar
            sidebar: document.getElementById('sidebar'),
            newChatBtn: document.getElementById('newChatBtn'),
            conversationList: document.getElementById('conversationList'),
            modelSelect: document.getElementById('modelSelect'),
            themeToggle: document.getElementById('themeToggle'),
            searchInput: document.getElementById('searchInput'),
            
            // Main area
            chatTitle: document.getElementById('chatTitle'),
            chatMessages: document.getElementById('chatMessages'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            chatForm: document.getElementById('chatForm'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            
            // File handling
            attachBtn: document.getElementById('attachBtn'),
            fileInput: document.getElementById('fileInput'),
            filePreviewContainer: document.getElementById('filePreviewContainer'),
            dragDropOverlay: document.getElementById('dragDropOverlay'),
            
            // Mobile
            menuToggle: document.getElementById('menuToggle'),
            
            // Actions
            exportBtn: document.getElementById('exportBtn'),
            regenerateBtn: document.getElementById('regenerateBtn'),
            
            // Overlays
            loadingOverlay: document.getElementById('loadingOverlay'),
            toastContainer: document.getElementById('toastContainer')
        };
    }

    setupEventListeners() {
        // Google login button
        if (this.elements.googleLoginBtn) {
            this.elements.googleLoginBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }
        
        // Logout button
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => this.handleSignOut());
        }
        
        // New chat button
        this.elements.newChatBtn.addEventListener('click', () => this.createNewConversation());
        
        // Chat form submission
        this.elements.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Message input auto-resize
        this.elements.messageInput.addEventListener('input', () => this.autoResizeInput());
        
        // Enter to send (Shift+Enter for new line)
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.elements.chatForm.dispatchEvent(new Event('submit'));
            }
        });
        
        // Model selection
        this.elements.modelSelect.addEventListener('change', (e) => {
            puterChat.setModel(e.target.value);
            if (this.currentConversation) {
                this.currentConversation.model = e.target.value;
            }
        });
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Mobile menu toggle
        this.elements.menuToggle.addEventListener('click', () => this.toggleSidebar());
        
        // Export button
        this.elements.exportBtn.addEventListener('click', () => this.exportConversation());
        
        // Regenerate button
        this.elements.regenerateBtn.addEventListener('click', () => this.regenerateLastResponse());
        
        // Search input
        this.elements.searchInput.addEventListener('input', (e) => this.filterConversations(e.target.value));
        
        // Close sidebar on outside click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!this.elements.sidebar.contains(e.target) && 
                    !this.elements.menuToggle.contains(e.target) &&
                    this.elements.sidebar.classList.contains('open')) {
                    this.elements.sidebar.classList.remove('open');
                }
            }
        });
    }

    // ============ File Handling Setup ============

    setupFileHandling() {
        const attachBtn = document.getElementById('attachBtn');
        let fileInput = document.getElementById('fileInput');
        
        console.log('Setting up file handling:', { attachBtn, fileInput });
        
        // If file input doesn't exist, create it dynamically
        if (!fileInput) {
            console.log('Creating file input dynamically');
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'fileInput';
            fileInput.multiple = true;
            fileInput.accept = 'image/*,.pdf,.txt,.md';
            fileInput.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';
            document.body.appendChild(fileInput);
        }

        // Store references
        this.elements.attachBtn = attachBtn;
        this.elements.fileInput = fileInput;

        // Attach button click handler - trigger file input
        if (attachBtn) {
            attachBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Attach button clicked, triggering file input');
                fileInput.click();
            });
        }

        // File input change handler - use both inline and addEventListener
        const handleChange = (e) => {
            console.log('=== FILE INPUT CHANGE EVENT ===');
            console.log('Event target:', e.target);
            console.log('Files object:', e.target.files);
            console.log('Number of files:', e.target.files ? e.target.files.length : 0);
            
            if (e.target.files && e.target.files.length > 0) {
                console.log('Processing files...');
                for (let i = 0; i < e.target.files.length; i++) {
                    console.log(`File ${i}:`, e.target.files[i].name, e.target.files[i].type, e.target.files[i].size);
                }
                this.handleFileSelection(e.target.files);
            } else {
                console.log('No files in selection');
            }
            // Reset input for same file selection after a short delay
            setTimeout(() => {
                e.target.value = '';
                console.log('File input reset');
            }, 100);
        };

        // Remove any existing listeners and add new one
        fileInput.onchange = null;
        fileInput.addEventListener('change', handleChange.bind(this));
        
        // Also set onchange as backup
        fileInput.onchange = handleChange.bind(this);
        
        console.log('File handling setup complete');
    }

    handleFileSelection(files) {
        console.log('handleFileSelection called with files:', files);
        
        const allowedTypes = [
            'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml',
            'application/pdf', 'text/plain', 'text/markdown', 'text/md'
        ];
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.pdf', '.txt', '.md'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        for (const file of files) {
            console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
            
            // Check file type by MIME type or extension
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            const isAllowedType = allowedTypes.includes(file.type) || 
                                  allowedExtensions.includes(fileExtension) ||
                                  file.type.startsWith('image/');
            
            if (!isAllowedType) {
                console.log('File type not allowed:', file.type, fileExtension);
                this.showToast(`File type not supported: ${file.name}`, 'error');
                continue;
            }

            // Check file size
            if (file.size > maxSize) {
                console.log('File too large:', file.size);
                this.showToast(`File too large: ${file.name} (max 10MB)`, 'error');
                continue;
            }

            // Add to pending files
            console.log('Adding file to pendingFiles:', file.name);
            this.pendingFiles.push({
                file: file,
                type: file.type || 'application/octet-stream',
                name: file.name,
                preview: null
            });
        }

        console.log('Pending files after selection:', this.pendingFiles);
        this.updateFilePreview();
    }

    updateFilePreview() {
        console.log('updateFilePreview called, pendingFiles:', this.pendingFiles);
        
        const container = this.elements.filePreviewContainer || document.getElementById('filePreviewContainer');
        const attachBtn = this.elements.attachBtn || document.getElementById('attachBtn');
        
        if (!container) {
            console.error('File preview container not found!');
            return;
        }
        
        container.innerHTML = '';
        
        if (this.pendingFiles.length === 0) {
            container.classList.remove('has-files');
            if (attachBtn) attachBtn.classList.remove('has-files');
            return;
        }

        container.classList.add('has-files');
        if (attachBtn) attachBtn.classList.add('has-files');
        
        console.log('Building file previews for', this.pendingFiles.length, 'files');

        this.pendingFiles.forEach((fileData, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'file-preview-item';

            if (fileData.type.startsWith('image/')) {
                // Create image preview
                const img = document.createElement('img');
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                    fileData.preview = e.target.result;
                };
                reader.readAsDataURL(fileData.file);
                previewItem.appendChild(img);
            } else {
                // Create file icon
                const iconDiv = document.createElement('div');
                iconDiv.className = 'file-icon';
                iconDiv.textContent = fileData.type.includes('pdf') ? '📄' : '📝';
                previewItem.appendChild(iconDiv);
            }

            // File name
            const fileName = document.createElement('span');
            fileName.className = 'file-name';
            fileName.textContent = fileData.name;
            fileName.title = fileData.name;
            previewItem.appendChild(fileName);

            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => this.removeFile(index);
            previewItem.appendChild(removeBtn);

            container.appendChild(previewItem);
            console.log('Added preview for file:', fileData.name);
        });
    }

    removeFile(index) {
        this.pendingFiles.splice(index, 1);
        this.updateFilePreview();
    }

    clearPendingFiles() {
        this.pendingFiles = [];
        this.updateFilePreview();
    }

    // ============ Real-time Subscriptions ============

    setupRealtimeSubscriptions() {
        const user = supabaseService.getCurrentUser();
        if (!user || !supabaseService.isAvailable()) {
            console.log('Real-time subscriptions not available (no user or Supabase)');
            return;
        }

        // Subscribe to conversation changes
        this.conversationsChannel = supabaseService.subscribeToConversations(
            user.id,
            // On insert
            (newConv) => {
                // Check if conversation already exists (we might have added it locally)
                if (!this.conversations.find(c => c.id === newConv.id)) {
                    this.conversations.unshift(newConv);
                    this.renderConversationList();
                }
            },
            // On update
            (updatedConv) => {
                const index = this.conversations.findIndex(c => c.id === updatedConv.id);
                if (index !== -1) {
                    this.conversations[index] = updatedConv;
                    this.renderConversationList();
                    // Update title if current conversation
                    if (this.currentConversation?.id === updatedConv.id) {
                        this.updateChatTitle(updatedConv.title);
                    }
                }
            },
            // On delete
            (deletedConv) => {
                this.conversations = this.conversations.filter(c => c.id !== deletedConv.id);
                this.renderConversationList();
            }
        );

        console.log('Real-time subscriptions initialized');
    }

    subscribeToCurrentConversationMessages() {
        if (!this.currentConversation || !supabaseService.isAvailable()) return;

        // Unsubscribe from previous conversation
        if (this.messagesChannel) {
            supabaseService.unsubscribe(this.messagesChannel);
        }

        // Subscribe to new conversation messages
        this.messagesChannel = supabaseService.subscribeToMessages(
            this.currentConversation.id,
            // On insert - only handle if from another source (not our own send)
            (newMsg) => {
                // Check if message already exists locally
                if (!this.messages.find(m => m.id === newMsg.id)) {
                    this.messages.push(newMsg);
                    this.addMessageToUI(newMsg.role, newMsg.content, newMsg.created_at);
                }
            },
            // On delete
            (deletedMsg) => {
                this.messages = this.messages.filter(m => m.id !== deletedMsg.id);
                this.renderMessages();
            }
        );
    }

    async initServices() {
        this.showLoading();
        
        try {
            // Initialize Puter.js
            const puterReady = await puterChat.init();
            if (!puterReady) {
                this.showToast('Failed to initialize AI service', 'error');
            }
            
            // Initialize Supabase
            const supabaseReady = await supabaseService.init();
            if (!supabaseReady) {
                this.showToast('Running in offline mode - chats won\'t be saved', 'warning');
            }
        } catch (error) {
            console.error('Service initialization error:', error);
            this.showToast('Error initializing services', 'error');
        }
        
        this.hideLoading();
    }

    // ============ Theme Management ============

    initTheme() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
    }

    // ============ Sidebar Management ============

    toggleSidebar() {
        this.elements.sidebar.classList.toggle('open');
    }

    // ============ Conversation Management ============

    async loadConversations() {
        try {
            this.conversations = await supabaseService.getConversations();
            this.renderConversationList();
            
            // Restore last conversation if exists
            const lastConvId = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_CONVERSATION);
            if (lastConvId && this.conversations.find(c => c.id === lastConvId)) {
                await this.loadConversation(lastConvId);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    }

    renderConversationList() {
        if (this.conversations.length === 0) {
            this.elements.conversationList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <p>No conversations yet</p>
                </div>
            `;
            return;
        }

        this.elements.conversationList.innerHTML = this.conversations.map(conv => `
            <div class="conversation-item ${this.currentConversation?.id === conv.id ? 'active' : ''}" 
                 data-id="${conv.id}">
                <span class="conversation-title">${this.escapeHtml(conv.title)}</span>
                <button class="conversation-delete" data-id="${conv.id}" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `).join('');

        // Add click handlers
        this.elements.conversationList.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.conversation-delete')) {
                    this.loadConversation(item.dataset.id);
                }
            });
        });

        // Add delete handlers
        this.elements.conversationList.querySelectorAll('.conversation-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteConversation(btn.dataset.id);
            });
        });
    }

    async createNewConversation() {
        const model = this.elements.modelSelect.value;
        const conversation = await supabaseService.createConversation('New Conversation', model);
        
        this.currentConversation = conversation;
        this.messages = [];
        
        // Add to list if using Supabase
        if (!conversation.isLocal) {
            this.conversations.unshift(conversation);
        }
        
        // Update UI
        this.renderConversationList();
        this.clearChatMessages();
        this.showWelcomeScreen();
        this.updateChatTitle('New Conversation');
        
        // Clear Puter chat history
        puterChat.clearHistory();
        
        // Save current conversation
        localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_CONVERSATION, conversation.id);
        
        // Focus input
        this.elements.messageInput.focus();
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.elements.sidebar.classList.remove('open');
        }
    }

    async loadConversation(conversationId) {
        this.showLoading();
        
        try {
            // Find conversation in list
            const conversation = this.conversations.find(c => c.id === conversationId);
            if (!conversation) {
                throw new Error('Conversation not found');
            }
            
            this.currentConversation = conversation;
            
            // Load messages
            this.messages = await supabaseService.getMessages(conversationId);
            
            // Subscribe to real-time message updates for this conversation
            this.subscribeToCurrentConversationMessages();
            
            // Update Puter chat history
            puterChat.clearHistory();
            puterChat.loadHistory(this.messages);
            
            // Update model selector
            this.elements.modelSelect.value = conversation.model || CONFIG.DEFAULT_MODEL;
            puterChat.setModel(conversation.model || CONFIG.DEFAULT_MODEL);
            
            // Update UI
            this.renderConversationList();
            this.renderMessages();
            this.updateChatTitle(conversation.title);
            
            // Save current conversation
            localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_CONVERSATION, conversationId);
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                this.elements.sidebar.classList.remove('open');
            }
        } catch (error) {
            console.error('Failed to load conversation:', error);
            this.showToast('Failed to load conversation', 'error');
        }
        
        this.hideLoading();
    }

    async deleteConversation(conversationId) {
        if (!confirm('Are you sure you want to delete this conversation?')) {
            return;
        }
        
        const success = await supabaseService.deleteConversation(conversationId);
        
        if (success) {
            // Remove from list
            this.conversations = this.conversations.filter(c => c.id !== conversationId);
            
            // If deleted current conversation, clear UI
            if (this.currentConversation?.id === conversationId) {
                this.currentConversation = null;
                this.messages = [];
                this.clearChatMessages();
                this.showWelcomeScreen();
                this.updateChatTitle('New Conversation');
                puterChat.clearHistory();
                localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_CONVERSATION);
            }
            
            this.renderConversationList();
            this.showToast('Conversation deleted', 'success');
        } else {
            this.showToast('Failed to delete conversation', 'error');
        }
    }

    // ============ Message Handling ============

    async handleSubmit(e) {
        e.preventDefault();
        
        const message = this.elements.messageInput.value.trim();
        const hasAttachments = this.pendingFiles.length > 0;
        
        if ((!message && !hasAttachments) || puterChat.isCurrentlyGenerating()) return;
        
        // Create conversation if none exists
        if (!this.currentConversation) {
            await this.createNewConversation();
        }
        
        // Store attachments before clearing
        const attachments = [...this.pendingFiles];
        
        // Clear input and files
        this.elements.messageInput.value = '';
        this.autoResizeInput();
        this.clearPendingFiles();
        
        // Hide welcome screen
        this.hideWelcomeScreen();
        
        // Add user message to UI (with attachments preview)
        this.addMessageToUI('user', message, null, attachments);
        
        // Save user message (text only for now)
        await supabaseService.saveMessage(
            this.currentConversation.id,
            'user',
            message + (hasAttachments ? ` [${attachments.length} file(s) attached]` : '')
        );
        
        // Update conversation title on first message
        if (this.messages.length === 0) {
            const title = supabaseService.generateTitleFromMessage(message || 'Image analysis');
            await supabaseService.updateConversationTitle(this.currentConversation.id, title);
            this.currentConversation.title = title;
            this.updateChatTitle(title);
            this.renderConversationList();
        }
        
        // Add to local messages array
        this.messages.push({ role: 'user', content: message });
        
        // Disable send button
        this.elements.sendBtn.disabled = true;
        
        // Add typing indicator
        const typingElement = this.addTypingIndicator();
        
        // Get AI response with streaming (include attachments)
        const model = this.elements.modelSelect.value;
        const responseElement = this.createAssistantMessage();
        
        await puterChat.sendMessageStreaming(
            message || 'What do you see in this image?',
            // On chunk
            (chunk, fullText) => {
                // Remove typing indicator on first chunk
                if (typingElement.parentNode) {
                    typingElement.remove();
                }
                // Update response text
                responseElement.querySelector('.message-text').textContent = fullText;
                this.scrollToBottom();
            },
            // On complete
            async (fullResponse) => {
                // Save assistant message
                await supabaseService.saveMessage(
                    this.currentConversation.id,
                    'assistant',
                    fullResponse,
                    model
                );
                
                // Add to local messages
                this.messages.push({ role: 'assistant', content: fullResponse });
                
                // Re-enable send button
                this.elements.sendBtn.disabled = false;
                this.elements.messageInput.focus();
            },
            // On error
            (error) => {
                typingElement.remove();
                responseElement.remove();
                this.showToast('Failed to get response: ' + error.message, 'error');
                this.elements.sendBtn.disabled = false;
            },
            attachments // Pass attachments to puter chat
        );
    }

    // ============ UI Rendering ============

    renderMessages() {
        this.clearChatMessages();
        
        if (this.messages.length === 0) {
            this.showWelcomeScreen();
            return;
        }
        
        this.hideWelcomeScreen();
        
        this.messages.forEach(msg => {
            this.addMessageToUI(msg.role, msg.content, msg.created_at);
        });
        
        this.scrollToBottom();
    }

    addMessageToUI(role, content, timestamp = null, attachments = []) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;
        
        const time = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
        const avatar = role === 'user' ? '👤' : '🤖';
        const author = role === 'user' ? 'You' : 'AI Assistant';
        
        // Build attachments HTML
        let attachmentsHtml = '';
        if (attachments.length > 0) {
            attachmentsHtml = '<div class="message-attachments">';
            attachments.forEach(att => {
                if (att.type.startsWith('image/') && att.preview) {
                    attachmentsHtml += `<img src="${att.preview}" alt="${att.name}" class="message-attachment-img">`;
                } else if (att.type.startsWith('image/')) {
                    // Create preview on the fly
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = messageEl.querySelector('.message-attachment-img[data-name="' + att.name + '"]');
                        if (img) img.src = e.target.result;
                    };
                    reader.readAsDataURL(att.file);
                    attachmentsHtml += `<img src="" alt="${att.name}" class="message-attachment-img" data-name="${att.name}">`;
                } else {
                    attachmentsHtml += `
                        <div class="message-attachment-file">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            ${att.name}
                        </div>
                    `;
                }
            });
            attachmentsHtml += '</div>';
        }
        
        messageEl.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${author}</span>
                    <span class="message-time">${time}</span>
                </div>
                ${attachmentsHtml}
                <div class="message-text">${this.escapeHtml(content)}</div>
                <div class="message-actions">
                    <button class="message-action-btn copy-btn" title="Copy">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    </button>
                </div>
            </div>
        `;
        
        // Add copy handler
        messageEl.querySelector('.copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(content);
            this.showToast('Copied to clipboard', 'success');
        });
        
        this.elements.chatMessages.appendChild(messageEl);
        this.scrollToBottom();
        
        return messageEl;
    }

    createAssistantMessage() {
        const messageEl = document.createElement('div');
        messageEl.className = 'message assistant';
        
        messageEl.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">AI Assistant</span>
                    <span class="message-time">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="message-text"></div>
                <div class="message-actions">
                    <button class="message-action-btn copy-btn" title="Copy">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    </button>
                </div>
            </div>
        `;
        
        // Add copy handler (will copy current content)
        messageEl.querySelector('.copy-btn').addEventListener('click', () => {
            const content = messageEl.querySelector('.message-text').textContent;
            navigator.clipboard.writeText(content);
            this.showToast('Copied to clipboard', 'success');
        });
        
        this.elements.chatMessages.appendChild(messageEl);
        return messageEl;
    }

    addTypingIndicator() {
        const typingEl = document.createElement('div');
        typingEl.className = 'message assistant typing';
        typingEl.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.elements.chatMessages.appendChild(typingEl);
        this.scrollToBottom();
        return typingEl;
    }

    clearChatMessages() {
        // Remove all messages but keep welcome screen
        const messages = this.elements.chatMessages.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());
    }

    showWelcomeScreen() {
        this.elements.welcomeScreen.style.display = 'flex';
    }

    hideWelcomeScreen() {
        this.elements.welcomeScreen.style.display = 'none';
    }

    updateChatTitle(title) {
        this.elements.chatTitle.textContent = title;
    }

    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    autoResizeInput() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }

    // ============ Export Functionality ============

    exportConversation() {
        if (!this.currentConversation || this.messages.length === 0) {
            this.showToast('No conversation to export', 'warning');
            return;
        }
        
        const exportData = {
            title: this.currentConversation.title,
            model: this.currentConversation.model,
            exportedAt: new Date().toISOString(),
            messages: this.messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.created_at
            }))
        };
        
        // Create and download file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Conversation exported', 'success');
    }

    // ============ Search & Regenerate ============

    filterConversations(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const conversationItems = document.querySelectorAll('.conversation-item');
        
        conversationItems.forEach(item => {
            const title = item.querySelector('.conversation-title')?.textContent.toLowerCase() || '';
            const preview = item.querySelector('.conversation-preview')?.textContent.toLowerCase() || '';
            
            if (term === '' || title.includes(term) || preview.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    async regenerateLastResponse() {
        // Find the last user message
        const lastUserMessage = [...this.messages].reverse().find(m => m.role === 'user');
        
        if (!lastUserMessage || !this.currentConversation) {
            this.showToast('No message to regenerate', 'error');
            return;
        }
        
        if (puterChat.isCurrentlyGenerating()) {
            this.showToast('Already generating a response', 'warning');
            return;
        }
        
        // Remove the last assistant message from UI
        const messageElements = this.elements.chatMessages.querySelectorAll('.message.assistant');
        if (messageElements.length > 0) {
            const lastAssistantElement = messageElements[messageElements.length - 1];
            lastAssistantElement.remove();
        }
        
        // Remove last assistant message from local array
        const lastAssistantIndex = this.messages.map(m => m.role).lastIndexOf('assistant');
        if (lastAssistantIndex !== -1) {
            this.messages.splice(lastAssistantIndex, 1);
        }
        
        // Clear puter chat history and rebuild without last assistant message
        puterChat.clearHistory();
        for (const msg of this.messages) {
            if (msg.role === 'user') {
                puterChat.conversationHistory.push({ role: 'user', content: msg.content });
            } else if (msg.role === 'assistant') {
                puterChat.conversationHistory.push({ role: 'assistant', content: msg.content });
            }
        }
        
        // Disable regenerate button during generation
        this.elements.regenerateBtn.disabled = true;
        this.elements.regenerateBtn.classList.add('loading');
        this.elements.sendBtn.disabled = true;
        
        // Add typing indicator
        const typingElement = this.addTypingIndicator();
        
        // Get new AI response with streaming
        const model = this.elements.modelSelect.value;
        const responseElement = this.createAssistantMessage();
        
        await puterChat.sendMessageStreaming(
            lastUserMessage.content,
            // On chunk
            (chunk, fullText) => {
                if (typingElement.parentNode) {
                    typingElement.remove();
                }
                responseElement.querySelector('.message-text').textContent = fullText;
                this.scrollToBottom();
            },
            // On complete
            async (fullResponse) => {
                await supabaseService.saveMessage(
                    this.currentConversation.id,
                    'assistant',
                    fullResponse,
                    model
                );
                this.messages.push({ role: 'assistant', content: fullResponse });
                this.elements.sendBtn.disabled = false;
                this.elements.regenerateBtn.disabled = false;
                this.elements.regenerateBtn.classList.remove('loading');
            },
            // On error
            (error) => {
                if (typingElement.parentNode) {
                    typingElement.remove();
                }
                responseElement.remove();
                this.showToast(`Error: ${error}`, 'error');
                this.elements.sendBtn.disabled = false;
                this.elements.regenerateBtn.disabled = false;
                this.elements.regenerateBtn.classList.remove('loading');
            },
            model
        );
    }

    // ============ Loading & Notifications ============

    showLoading() {
        this.isLoading = true;
        this.elements.loadingOverlay.classList.add('active');
    }

    hideLoading() {
        this.isLoading = false;
        this.elements.loadingOverlay.classList.remove('active');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ============ Utility Functions ============

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});
