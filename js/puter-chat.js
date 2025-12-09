// Puter.js Chat Integration
// Handles AI communication using Puter.js for free, unlimited Claude API access

class PuterChat {
    constructor() {
        this.isReady = false;
        this.currentModel = CONFIG.DEFAULT_MODEL;
        this.conversationHistory = [];
        this.isGenerating = false;
        this.abortController = null;
        this.pendingAttachments = []; // Store pending file attachments
        this.webSearchEnabled = true; // Enable web search by default
        this.lastSearchResults = []; // Store last search results for citations
    }

    // Wait for Puter.js to be available
    async waitForPuter(maxAttempts = 50, interval = 100) {
        for (let i = 0; i < maxAttempts; i++) {
            if (typeof puter !== 'undefined') {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        return false;
    }

    // Initialize Puter.js
    async init() {
        try {
            // Wait for Puter.js to load (up to 5 seconds)
            const puterLoaded = await this.waitForPuter();
            
            if (!puterLoaded) {
                throw new Error('Puter.js not loaded. Please check your internet connection.');
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

    // Add pending attachments (images/files)
    addAttachments(attachments) {
        this.pendingAttachments = attachments;
    }

    // Clear pending attachments
    clearAttachments() {
        this.pendingAttachments = [];
    }

    // Get pending attachments
    getPendingAttachments() {
        return this.pendingAttachments;
    }

    // Convert file to base64 data URL (full data URL format)
    async fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Return the full data URL (e.g., "data:image/png;base64,...")
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Convert file to base64 (just the base64 part without prefix)
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove the data URL prefix (e.g., "data:image/png;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Build multimodal content array for vision
    // Note: Puter.js uses a simpler format - image URL as second parameter
    async buildMultimodalContent(textMessage, attachments) {
        const content = [];

        // Add images first
        for (const attachment of attachments) {
            if (attachment.type.startsWith('image/')) {
                const base64Data = await this.fileToBase64(attachment.file);
                content.push({
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: attachment.type,
                        data: base64Data
                    }
                });
            }
        }

        // Add text message
        if (textMessage) {
            content.push({
                type: 'text',
                text: textMessage
            });
        }

        return content;
    }

    // Get image data URLs from attachments (for Puter.js vision API)
    async getImageDataURLs(attachments) {
        const imageURLs = [];
        for (const attachment of attachments) {
            if (attachment.type.startsWith('image/')) {
                const dataURL = await this.fileToDataURL(attachment.file);
                imageURLs.push(dataURL);
            }
        }
        return imageURLs;
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
    async sendMessageStreaming(message, onChunk, onComplete, onError, attachments = []) {
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
            // Add user message to history (store text version for history)
            this.addToHistory('user', message);

            // Prepare messages for API (without current message)
            const messages = this.conversationHistory.slice(0, -1).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Add current message
            messages.push({
                role: 'user',
                content: message
            });

            // Check if we have image attachments
            const imageAttachments = attachments.filter(a => a.type.startsWith('image/'));
            
            if (imageAttachments.length > 0) {
                // VISION REQUEST: Use gpt-5-nano model (required for vision in Puter.js)
                // Format: puter.ai.chat(prompt, imageURL, { model: 'gpt-5-nano' })
                const imageDataURLs = await this.getImageDataURLs(imageAttachments);
                
                console.log('[PuterChat] 🖼️ Sending VISION request with', imageDataURLs.length, 'images');
                console.log('[PuterChat] 🖼️ Using gpt-5-nano model for vision (required)');
                
                const prompt = message || 'What do you see in this image? Please describe it in detail.';
                
                try {
                    // Vision uses NON-STREAMING format with gpt-5-nano
                    let visionResponse;
                    if (imageDataURLs.length === 1) {
                        visionResponse = await puter.ai.chat(prompt, imageDataURLs[0], {
                            model: 'gpt-5-nano'  // Vision ONLY works with gpt-5-nano
                        });
                    } else {
                        // Multiple images - process each one
                        const imageDescriptions = [];
                        for (let i = 0; i < imageDataURLs.length; i++) {
                            const imgResponse = await puter.ai.chat(
                                `Describe image ${i + 1}: ${prompt}`, 
                                imageDataURLs[i], 
                                { model: 'gpt-5-nano' }
                            );
                            const text = imgResponse?.message?.content?.[0]?.text || imgResponse?.message?.content || '';
                            imageDescriptions.push(`**Image ${i + 1}:**\n${text}`);
                        }
                        // Combine descriptions
                        fullResponse = imageDescriptions.join('\n\n');
                        onChunk(fullResponse, fullResponse);
                        this.addToHistory('assistant', fullResponse);
                        this.clearAttachments();
                        onComplete(fullResponse);
                        return;
                    }
                    
                    // Extract response text from vision API
                    console.log('[PuterChat] 🖼️ Vision response received:', visionResponse);
                    fullResponse = visionResponse?.message?.content?.[0]?.text || 
                                   visionResponse?.message?.content || 
                                   visionResponse?.text ||
                                   (typeof visionResponse === 'string' ? visionResponse : '');
                    
                    if (!fullResponse) {
                        console.error('[PuterChat] ❌ Vision response was empty:', visionResponse);
                        fullResponse = 'I apologize, but I was unable to analyze the image. Please try uploading it again.';
                    }
                    
                    // Send the complete response
                    onChunk(fullResponse, fullResponse);
                    this.addToHistory('assistant', fullResponse);
                    this.clearAttachments();
                    onComplete(fullResponse);
                    return;
                    
                } catch (visionError) {
                    console.error('[PuterChat] ❌ Vision error:', visionError);
                    onError(new Error('Failed to analyze image: ' + visionError.message));
                    return;
                }
            }
            
            // TEXT-ONLY MESSAGE: Use streaming with selected model
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

            // Clear attachments after successful send
            this.clearAttachments();

            // Call completion callback
            onComplete(fullResponse);
        } catch (error) {
            console.error('Streaming error:', error);
            onError(error);
        } finally {
            this.isGenerating = false;
        }
    }

    // Send message with web search enhancement
    async sendMessageWithSearch(message, onChunk, onComplete, onError, onSearchStart, onSearchComplete, attachments = []) {
        if (!this.isReady) {
            onError(new Error('Puter.js not initialized'));
            return;
        }

        if (this.isGenerating) {
            onError(new Error('Already generating a response'));
            return;
        }

        this.isGenerating = true;
        this.lastSearchResults = [];
        let fullResponse = '';
        let searchContext = '';

        try {
            // Check if we have image attachments FIRST - skip web search for image analysis
            const imageAttachments = attachments.filter(a => a.type.startsWith('image/'));
            const hasImages = imageAttachments.length > 0;
            
            // Skip web search for image analysis queries
            if (hasImages) {
                console.log('[PuterChat] 🖼️ Image attachments detected - skipping web search for image analysis');
            }
            
            // Check if web search would help with this query (ONLY for text-only queries)
            if (!hasImages && this.webSearchEnabled && typeof webSearchService !== 'undefined' && webSearchService.needsWebSearch(message)) {
                console.log('[PuterChat] Query may benefit from web search');
                console.log('[PuterChat] needsWebSearch returned true for:', message);
                
                // Notify UI that search is starting
                if (onSearchStart) onSearchStart();
                
                try {
                    // Perform web search
                    const searchResults = await webSearchService.performSearch(message);
                    this.lastSearchResults = searchResults;
                    console.log('[PuterChat] Search returned', searchResults.length, 'results');
                    
                    // Notify UI that search is complete
                    if (onSearchComplete) onSearchComplete(searchResults);
                    
                    if (searchResults.length > 0) {
                        searchContext = webSearchService.formatResultsForAI(searchResults);
                        searchContext += '\n' + webSearchService.getCitationInstructions() + '\n\n---\n\n';
                        console.log('[PuterChat] Added search context with', searchResults.length, 'results');
                    } else {
                        // If no results, still tell AI to search online
                        console.log('[PuterChat] No search results, adding fallback instruction');
                        searchContext = `\n\n---\nNote: I attempted to search for current information about "${message}" but couldn't retrieve results. Please provide the most up-to-date information you have based on your training data, and clearly indicate that this may not reflect the latest developments.\n---\n\n`;
                    }
                } catch (searchError) {
                    console.error('[PuterChat] Search error:', searchError);
                    // Continue without search context if search fails
                }
            } else {
                console.log('[PuterChat] Web search not triggered. Enabled:', this.webSearchEnabled, 'Service exists:', typeof webSearchService !== 'undefined');
            }

            // Build user message content
            const enhancedMessage = searchContext ? searchContext + 'User Question: ' + message : message;

            // Add user message to history (store original text for history)
            this.addToHistory('user', message);

            // Prepare messages for API (without current message)
            const messages = this.conversationHistory.slice(0, -1).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Add current message
            messages.push({
                role: 'user',
                content: enhancedMessage
            });

            let response;
            
            // Check if we have image attachments (already checked above)
            if (hasImages) {
                // VISION REQUEST: Use gpt-5-nano model (required for vision in Puter.js)
                // Format: puter.ai.chat(prompt, imageURL, { model: 'gpt-5-nano' })
                const imageDataURLs = await this.getImageDataURLs(imageAttachments);
                
                console.log('[PuterChat] 🖼️ Sending VISION request with', imageDataURLs.length, 'images');
                console.log('[PuterChat] 🖼️ Using gpt-5-nano model for vision (required)');
                
                const prompt = message || 'What do you see in this image? Please describe it in detail.';
                
                try {
                    // Vision uses NON-STREAMING format with gpt-5-nano
                    let visionResponse;
                    if (imageDataURLs.length === 1) {
                        visionResponse = await puter.ai.chat(prompt, imageDataURLs[0], {
                            model: 'gpt-5-nano'  // Vision ONLY works with gpt-5-nano
                        });
                    } else {
                        // Multiple images - process each one
                        const imageDescriptions = [];
                        for (let i = 0; i < imageDataURLs.length; i++) {
                            const imgResponse = await puter.ai.chat(
                                `Describe image ${i + 1}: ${prompt}`, 
                                imageDataURLs[i], 
                                { model: 'gpt-5-nano' }
                            );
                            const text = imgResponse?.message?.content?.[0]?.text || imgResponse?.message?.content || '';
                            imageDescriptions.push(`**Image ${i + 1}:**\n${text}`);
                        }
                        // Combine descriptions
                        fullResponse = imageDescriptions.join('\n\n');
                        onChunk(fullResponse, fullResponse);
                        this.addToHistory('assistant', fullResponse);
                        this.clearAttachments();
                        onComplete(fullResponse, []);
                        return;
                    }
                    
                    // Extract response text from vision API
                    console.log('[PuterChat] 🖼️ Vision response received:', visionResponse);
                    fullResponse = visionResponse?.message?.content?.[0]?.text || 
                                   visionResponse?.message?.content || 
                                   visionResponse?.text ||
                                   (typeof visionResponse === 'string' ? visionResponse : '');
                    
                    if (!fullResponse) {
                        console.error('[PuterChat] ❌ Vision response was empty:', visionResponse);
                        fullResponse = 'I apologize, but I was unable to analyze the image. Please try uploading it again.';
                    }
                    
                    // Send the complete response
                    onChunk(fullResponse, fullResponse);
                    this.addToHistory('assistant', fullResponse);
                    this.clearAttachments();
                    onComplete(fullResponse, []);
                    return;
                    
                } catch (visionError) {
                    console.error('[PuterChat] ❌ Vision error:', visionError);
                    onError(new Error('Failed to analyze image: ' + visionError.message));
                    return;
                }
            }
            
            // TEXT-ONLY MESSAGE: Use streaming with selected model
            response = await puter.ai.chat(messages, {
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

            // Clear attachments after successful send
            this.clearAttachments();

            // Call completion callback with search results
            onComplete(fullResponse, this.lastSearchResults);
        } catch (error) {
            console.error('Streaming with search error:', error);
            onError(error);
        } finally {
            this.isGenerating = false;
        }
    }

    // Get last search results
    getLastSearchResults() {
        return this.lastSearchResults;
    }

    // Enable/disable web search
    setWebSearchEnabled(enabled) {
        this.webSearchEnabled = enabled;
    }

    // Check if web search is enabled
    isWebSearchEnabled() {
        return this.webSearchEnabled;
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
