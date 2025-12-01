// Main Application Logic
// Handles UI interactions and coordinates between Puter.js and Supabase

class ChatApp {
    constructor() {
        // State
        this.currentConversation = null;
        this.conversations = [];
        this.messages = [];
        this.isLoading = false;
        
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
        
        // Initialize theme
        this.initTheme();
        
        // Initialize services
        await this.initServices();
        
        // Load conversations
        await this.loadConversations();
        
        console.log('Chat app initialized');
    }

    cacheElements() {
        this.elements = {
            // Sidebar
            sidebar: document.getElementById('sidebar'),
            newChatBtn: document.getElementById('newChatBtn'),
            conversationList: document.getElementById('conversationList'),
            modelSelect: document.getElementById('modelSelect'),
            themeToggle: document.getElementById('themeToggle'),
            
            // Main area
            chatTitle: document.getElementById('chatTitle'),
            chatMessages: document.getElementById('chatMessages'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            chatForm: document.getElementById('chatForm'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            
            // Mobile
            menuToggle: document.getElementById('menuToggle'),
            
            // Actions
            exportBtn: document.getElementById('exportBtn'),
            
            // Overlays
            loadingOverlay: document.getElementById('loadingOverlay'),
            toastContainer: document.getElementById('toastContainer')
        };
    }

    setupEventListeners() {
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
        if (!message || puterChat.isCurrentlyGenerating()) return;
        
        // Create conversation if none exists
        if (!this.currentConversation) {
            await this.createNewConversation();
        }
        
        // Clear input
        this.elements.messageInput.value = '';
        this.autoResizeInput();
        
        // Hide welcome screen
        this.hideWelcomeScreen();
        
        // Add user message to UI
        this.addMessageToUI('user', message);
        
        // Save user message
        await supabaseService.saveMessage(
            this.currentConversation.id,
            'user',
            message
        );
        
        // Update conversation title on first message
        if (this.messages.length === 0) {
            const title = supabaseService.generateTitleFromMessage(message);
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
        
        // Get AI response with streaming
        const model = this.elements.modelSelect.value;
        const responseElement = this.createAssistantMessage();
        
        await puterChat.sendMessageStreaming(
            message,
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
            }
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

    addMessageToUI(role, content, timestamp = null) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;
        
        const time = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
        const avatar = role === 'user' ? '👤' : '🤖';
        const author = role === 'user' ? 'You' : 'AI Assistant';
        
        messageEl.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${author}</span>
                    <span class="message-time">${time}</span>
                </div>
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
