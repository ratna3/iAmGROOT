// Web Search Service
// Provides web search capabilities for enhancing AI responses with citations

class WebSearchService {
    constructor() {
        this.searchEnabled = true;
        this.lastSearchResults = [];
        
        // Keywords that suggest a question might benefit from web search
        this.searchTriggerKeywords = [
            // Time-sensitive
            'latest', 'recent', 'current', 'today', 'now', '2024', '2025', 'new', 'update',
            // Factual queries
            'what is', 'who is', 'when did', 'where is', 'how to', 'why does',
            'define', 'explain', 'meaning of', 'definition',
            // Course/Academic
            'course', 'tutorial', 'learn', 'study', 'lecture', 'university', 'college',
            'research', 'paper', 'article', 'journal', 'academic',
            // Technical
            'documentation', 'api', 'library', 'framework', 'version',
            'install', 'setup', 'configure', 'error', 'bug', 'fix',
            // Specific knowledge
            'statistics', 'data', 'report', 'study shows', 'according to',
            'official', 'source', 'reference', 'cite'
        ];
        
        // Topics that typically need up-to-date information
        this.searchTopics = [
            'programming', 'technology', 'science', 'medicine', 'health',
            'news', 'politics', 'economics', 'finance', 'stocks',
            'sports', 'weather', 'events', 'releases'
        ];
    }

    // Check if a query might benefit from web search
    needsWebSearch(query) {
        if (!query || !this.searchEnabled) return false;
        
        const lowerQuery = query.toLowerCase();
        
        // Check for trigger keywords
        const hasKeyword = this.searchTriggerKeywords.some(keyword => 
            lowerQuery.includes(keyword.toLowerCase())
        );
        
        // Check for topic matches
        const hasTopic = this.searchTopics.some(topic => 
            lowerQuery.includes(topic.toLowerCase())
        );
        
        // Check for question patterns
        const isQuestion = /^(what|who|when|where|why|how|is|are|can|could|would|should|do|does|did)\b/i.test(query.trim());
        
        // Check query length (longer queries often need more context)
        const isComplex = query.split(' ').length > 8;
        
        return hasKeyword || hasTopic || (isQuestion && isComplex);
    }

    // Perform web search using DuckDuckGo API
    async performSearch(query, maxResults = 5) {
        try {
            console.log('[WebSearch] Searching for:', query);
            
            // Try DuckDuckGo Instant Answer API first
            const ddgResults = await this.searchDuckDuckGo(query);
            if (ddgResults.length > 0) {
                this.lastSearchResults = ddgResults.slice(0, maxResults);
                return this.lastSearchResults;
            }
            
            // Fallback: Use a simple search extraction approach
            const fallbackResults = await this.searchWithFallback(query);
            this.lastSearchResults = fallbackResults.slice(0, maxResults);
            return this.lastSearchResults;
            
        } catch (error) {
            console.error('[WebSearch] Search failed:', error);
            return [];
        }
    }

    // DuckDuckGo Instant Answer API
    async searchDuckDuckGo(query) {
        try {
            // DuckDuckGo Instant Answer API (limited but CORS-friendly)
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(
                `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`,
                { 
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                }
            );
            
            if (!response.ok) throw new Error('DuckDuckGo API failed');
            
            const data = await response.json();
            const results = [];
            
            // Abstract (main answer)
            if (data.Abstract) {
                results.push({
                    title: data.Heading || 'Summary',
                    snippet: data.Abstract,
                    url: data.AbstractURL || data.AbstractSource,
                    source: data.AbstractSource || 'DuckDuckGo'
                });
            }
            
            // Related topics
            if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
                data.RelatedTopics.forEach(topic => {
                    if (topic.Text && topic.FirstURL) {
                        results.push({
                            title: topic.Text.split(' - ')[0] || 'Related',
                            snippet: topic.Text,
                            url: topic.FirstURL,
                            source: new URL(topic.FirstURL).hostname
                        });
                    }
                });
            }
            
            // Infobox data
            if (data.Infobox && data.Infobox.content) {
                const infoContent = data.Infobox.content
                    .filter(item => item.value)
                    .map(item => `${item.label}: ${item.value}`)
                    .join('; ');
                if (infoContent) {
                    results.push({
                        title: 'Quick Facts',
                        snippet: infoContent,
                        url: data.AbstractURL || '',
                        source: 'DuckDuckGo'
                    });
                }
            }
            
            return results;
        } catch (error) {
            console.warn('[WebSearch] DuckDuckGo search failed:', error);
            return [];
        }
    }

    // Fallback search using Wikipedia API (always available)
    async searchWithFallback(query) {
        try {
            const encodedQuery = encodeURIComponent(query);
            
            // Wikipedia API search
            const response = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&format=json&origin=*&srlimit=5`
            );
            
            if (!response.ok) throw new Error('Wikipedia API failed');
            
            const data = await response.json();
            const results = [];
            
            if (data.query && data.query.search) {
                for (const item of data.query.search) {
                    // Clean up snippet (remove HTML tags)
                    const snippet = item.snippet.replace(/<[^>]*>/g, '');
                    results.push({
                        title: item.title,
                        snippet: snippet,
                        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
                        source: 'Wikipedia'
                    });
                }
            }
            
            return results;
        } catch (error) {
            console.warn('[WebSearch] Fallback search failed:', error);
            return [];
        }
    }

    // Format search results for AI context
    formatResultsForAI(results) {
        if (!results || results.length === 0) {
            return null;
        }

        let context = '\n\n---\n📚 **Web Search Results:**\n\n';
        
        results.forEach((result, index) => {
            context += `[${index + 1}] **${result.title}**\n`;
            context += `   ${result.snippet}\n`;
            context += `   Source: ${result.source} (${result.url})\n\n`;
        });
        
        return context;
    }

    // Get citation instructions for AI
    getCitationInstructions() {
        return `
IMPORTANT: I have provided web search results above. When answering:
1. Use the information from the search results to provide accurate, up-to-date information
2. Cite your sources using [1], [2], etc. format that corresponds to the search results
3. If the search results don't fully answer the question, supplement with your knowledge but note what comes from search vs your training
4. At the end of your response, list the sources you cited in a "Sources:" section with clickable links
5. Be accurate and don't make up information not in the sources`;
    }

    // Get last search results (for displaying sources in UI)
    getLastSearchResults() {
        return this.lastSearchResults;
    }

    // Clear last search results
    clearLastResults() {
        this.lastSearchResults = [];
    }

    // Enable/disable search
    setEnabled(enabled) {
        this.searchEnabled = enabled;
    }

    // Check if search is enabled
    isEnabled() {
        return this.searchEnabled;
    }
}

// Create global instance
const webSearchService = new WebSearchService();
