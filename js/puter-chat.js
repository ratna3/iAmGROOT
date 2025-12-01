// Puter.js Chat Integration
// Handles AI communication using Puter.js for free, unlimited Claude API access

class PuterChat {
    constructor() {
        this.isReady = false;
        this.currentModel = CONFIG.DEFAULT_MODEL;
        this.conversationHistory = [];
        this.isGenerating = false;
        this.abortController = null;
    }

    // Initialize Puter.js
    async init() {
        try {
            // Check if Puter.js is loaded
            if (typeof puter === 'undefined') {
                throw new Error('Puter.js not loaded. Please include the Puter.js script.');
            }
            
            this.isReady = true;
            console.log('Puter.js initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Puter.js:', error);
            return false;
        }
    }

    // Set the current model
    setModel(model) {
        this.currentModel = model;
        console.log(`Model set to: ${model}`);
    }

    // Get current model
    getModel() {
        return this.currentModel;
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
    }

    // Load conversation history
    loadHistory(messages) {
        this.conversationHistory = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    // Add message to history
    addToHistory(role, content) {
        this.conversationHistory.push({ role, content });
    }

    // Send message and get response (non-streaming)
    async sendMessage(message) {
        if (!this.isReady) {
            throw new Error('Puter.js not initialized');
        }

        if (this.isGenerating) {
            throw new Error('Already generating a response');
        }

        this.isGenerating = true;

        try {
            // Add user message to history
            this.addToHistory('user', message);

            // Prepare messages for API
            const messages = this.conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Call Puter.js AI
            const response = await puter.ai.chat(messages, {
                model: this.currentModel
            });

            // Extract response text
            const assistantMessage = response.message.content[0].text;

            // Add assistant response to history
            this.addToHistory('assistant', assistantMessage);

            return assistantMessage;
        } finally {
            this.isGenerating = false;
        }
    }

    // Send message with streaming response
    async sendMessageStreaming(message, onChunk, onComplete, onError) {
        if (!this.isReady) {
            onError(new Error('Puter.js not initialized'));
            return;
        }

        if (this.isGenerating) {
            onError(new Error('Already generating a response'));
            return;
        }

        this.isGenerating = true;
        let fullResponse = '';

        try {
            // Add user message to history
            this.addToHistory('user', message);

            // Prepare messages for API
            const messages = this.conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Call Puter.js AI with streaming
            const response = await puter.ai.chat(messages, {
                model: this.currentModel,
                stream: true
            });

            // Process streaming response
            for await (const part of response) {
                if (part?.text) {
                    fullResponse += part.text;
                    onChunk(part.text, fullResponse);
                }
            }

            // Add complete response to history
            this.addToHistory('assistant', fullResponse);

            // Call completion callback
            onComplete(fullResponse);
        } catch (error) {
            console.error('Streaming error:', error);
            onError(error);
        } finally {
            this.isGenerating = false;
        }
    }

    // Stop current generation
    stopGeneration() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        this.isGenerating = false;
    }

    // Check if currently generating
    isCurrentlyGenerating() {
        return this.isGenerating;
    }

    // Simple text generation (without conversation context)
    async generateText(prompt) {
        if (!this.isReady) {
            throw new Error('Puter.js not initialized');
        }

        const response = await puter.ai.chat(prompt, {
            model: this.currentModel
        });

        return response.message.content[0].text;
    }

    // Simple text generation with streaming
    async generateTextStreaming(prompt, onChunk) {
        if (!this.isReady) {
            throw new Error('Puter.js not initialized');
        }

        let fullText = '';
        const response = await puter.ai.chat(prompt, {
            model: this.currentModel,
            stream: true
        });

        for await (const part of response) {
            if (part?.text) {
                fullText += part.text;
                onChunk(part.text, fullText);
            }
        }

        return fullText;
    }

    // Get available models
    getAvailableModels() {
        return CONFIG.AVAILABLE_MODELS;
    }
}

// Create global instance
const puterChat = new PuterChat();
