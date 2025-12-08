// Web Search Service - Enhanced Edition
// Provides real web search and news scraping capabilities using open-source tools

class WebSearchService {
    constructor() {
        this.searchEnabled = true;
        this.lastSearchResults = [];
        
        // SearXNG public instances (open-source meta-search engine)
        this.searxngInstances = [
            'https://searx.be',
            'https://search.sapti.me',
            'https://searx.tiekoetter.com',
            'https://paulgo.io',
            'https://search.ononoki.org',
            'https://searx.work',
            'https://opnxng.com'
        ];
        
        // CORS proxy for fetching external content
        this.corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://thingproxy.freeboard.io/fetch/'
        ];
        
        // RSS2JSON API for parsing RSS feeds (free tier)
        this.rss2jsonUrl = 'https://api.rss2json.com/v1/api.json?rss_url=';
        
        // News-specific keywords
        this.newsKeywords = [
            'news', 'headlines', 'breaking', 'latest news', 'today news',
            'yesterday', 'this week', 'current events', 'top stories',
            'updates', 'happening', 'announced', 'reported', 'previous day',
            'previous', 'launched', 'released', 'unveiled', 'introduced',
            '2024', '2025', 'latest', 'recent', 'new launch', 'just'
        ];
        
        // Keywords that suggest a question might benefit from web search
        this.searchTriggerKeywords = [
            // Time-sensitive
            'latest', 'recent', 'current', 'today', 'now', '2024', '2025', 'new', 'update',
            'yesterday', 'this week', 'this month', 'breaking', 'previous day', 'previous',
            // Factual queries
            'what is', 'who is', 'when did', 'where is', 'how to', 'why does',
            'define', 'explain', 'meaning of', 'definition',
            // News & Events
            'news', 'headlines', 'announced', 'released', 'launched', 'unveiled',
            'introduced', 'debuted',
            // Products & Companies
            'car', 'suv', 'vehicle', 'phone', 'smartphone', 'laptop', 'product',
            'model', 'price', 'specs', 'features', 'review',
            // Course/Academic
            'course', 'tutorial', 'learn', 'study', 'lecture', 'university', 'college',
            'research', 'paper', 'article', 'journal', 'academic',
            // Technical
            'documentation', 'api', 'library', 'framework', 'version',
            'install', 'setup', 'configure', 'error', 'bug', 'fix',
            // Specific knowledge
            'statistics', 'data', 'report', 'study shows', 'according to',
            'official', 'source', 'reference', 'cite', 'price', 'cost'
        ];
        
        // Topics that typically need up-to-date information
        this.searchTopics = [
            'programming', 'technology', 'science', 'medicine', 'health',
            'news', 'politics', 'economics', 'finance', 'stocks', 'crypto',
            'sports', 'weather', 'events', 'releases', 'election',
            // Automotive - for questions like "latest tata car"
            'car', 'suv', 'vehicle', 'automobile', 'tata', 'mahindra', 'maruti',
            'hyundai', 'kia', 'honda', 'toyota', 'bmw', 'mercedes', 'audi',
            'government', 'policy', 'law', 'court'
        ];
    }

    // Check if query is news-related
    isNewsQuery(query) {
        const lowerQuery = query.toLowerCase();
        
        // Check for explicit news keywords
        const hasNewsKeyword = this.newsKeywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
        
        // Check for patterns like "latest X", "new X in 2025", "X launched"
        const newsPatterns = [
            /\b(news|headlines|stories)\b/i,
            /\b(yesterday|today|this week|latest|recent)\b.*\b(news|update|event|happening|launch)/i,
            /\b(launched|released|unveiled|announced|introduced)\b.*\b(in|on)?\s*\d{4}/i,
            /\b(top|latest|recent|new)\s+\d+\b/i,
            /\blatest\s+(\w+\s+)?(car|suv|phone|product|model|version)/i,
            /\b(what|which).*\b(latest|newest|recent)\b/i,
            /\b\d{4}\b.*\b(launch|release|new|model)/i
        ];
        
        const matchesPattern = newsPatterns.some(pattern => pattern.test(query));
        
        return hasNewsKeyword || matchesPattern;
    }

    // Check if a query might benefit from web search
    needsWebSearch(query) {
        if (!query || !this.searchEnabled) return false;
        
        const lowerQuery = query.toLowerCase();
        
        // Always search for news queries
        if (this.isNewsQuery(query)) return true;
        
        // Check for trigger keywords
        const hasKeyword = this.searchTriggerKeywords.some(keyword => 
            lowerQuery.includes(keyword.toLowerCase())
        );
        
        // Check for topic matches
        const hasTopic = this.searchTopics.some(topic => 
            lowerQuery.includes(topic.toLowerCase())
        );
        
        // Check for question patterns
        const isQuestion = /^(what|who|when|where|why|how|is|are|can|could|would|should|do|does|did|give|tell|show|list|find)\b/i.test(query.trim());
        
        // Check query length (longer queries often need more context)
        const isComplex = query.split(' ').length > 5;
        
        return hasKeyword || hasTopic || (isQuestion && isComplex);
    }

    // Main search function - routes to appropriate search method
    async performSearch(query, maxResults = 5) {
        try {
            console.log('[WebSearch] Searching for:', query);
            console.log('[WebSearch] Is news query:', this.isNewsQuery(query));
            
            let results = [];
            
            // Check if this is a news query
            if (this.isNewsQuery(query)) {
                console.log('[WebSearch] Detected news query, using news search');
                results = await this.searchNews(query, maxResults);
                
                // Try Bing News as fallback for news queries
                if (results.length < 2) {
                    console.log('[WebSearch] Trying Bing News fallback');
                    const bingResults = await this.searchBingNews(query, maxResults);
                    results = [...results, ...bingResults];
                }
            }
            
            // If news search didn't return enough results, try general search
            if (results.length < maxResults) {
                console.log('[WebSearch] Trying SearXNG search');
                const searxResults = await this.searchSearXNG(query, maxResults - results.length);
                results = [...results, ...searxResults];
            }
            
            // Fallback to DuckDuckGo if needed
            if (results.length < 2) {
                console.log('[WebSearch] Trying DuckDuckGo fallback');
                const ddgResults = await this.searchDuckDuckGo(query);
                results = [...results, ...ddgResults];
            }
            
            // Final fallback to Wikipedia
            if (results.length < 2) {
                console.log('[WebSearch] Trying Wikipedia fallback');
                const wikiResults = await this.searchWikipedia(query);
                results = [...results, ...wikiResults];
            }
            
            // Remove duplicates and limit results
            results = this.deduplicateResults(results).slice(0, maxResults);
            
            this.lastSearchResults = results;
            console.log('[WebSearch] Found', results.length, 'results');
            return results;
            
        } catch (error) {
            console.error('[WebSearch] Search failed:', error);
            return [];
        }
    }

    // Search using SearXNG (open-source meta-search engine)
    async searchSearXNG(query, maxResults = 5) {
        const encodedQuery = encodeURIComponent(query);
        
        // Try each SearXNG instance until one works
        for (const instance of this.searxngInstances) {
            try {
                const url = `${instance}/search?q=${encodedQuery}&format=json&categories=general`;
                
                const response = await this.fetchWithTimeout(url, 5000);
                if (!response.ok) continue;
                
                const data = await response.json();
                const results = [];
                
                if (data.results && Array.isArray(data.results)) {
                    for (const item of data.results.slice(0, maxResults)) {
                        results.push({
                            title: item.title || 'Untitled',
                            snippet: item.content || item.description || '',
                            url: item.url || item.href || '',
                            source: this.extractDomain(item.url || ''),
                            publishedDate: item.publishedDate || null
                        });
                    }
                }
                
                if (results.length > 0) {
                    console.log('[WebSearch] SearXNG success from:', instance);
                    return results;
                }
            } catch (error) {
                console.warn('[WebSearch] SearXNG instance failed:', instance, error.message);
                continue;
            }
        }
        
        return [];
    }

    // Search for news using Google News RSS
    async searchNews(query, maxResults = 5) {
        try {
            // Build Google News RSS URL - try India edition first if query seems India-related
            const encodedQuery = encodeURIComponent(query);
            const isIndiaQuery = /\b(india|indian|delhi|mumbai|bangalore|chennai|kolkata|hyderabad|pune|uttar pradesh|up|maharashtra|karnataka|tamil nadu|gujarat|rajasthan|punjab|bihar|bengal|tata|reliance|infosys|wipro|hdfc|icici|sensex|nifty|rupee|modi|bjp|congress|aap)\b/i.test(query);
            
            // Use appropriate Google News edition
            const googleNewsRss = isIndiaQuery
                ? `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-IN&gl=IN&ceid=IN:en`
                : `https://news.google.com/rss/search?q=${encodedQuery}&hl=en&gl=US&ceid=US:en`;
            
            console.log('[WebSearch] Using Google News RSS:', isIndiaQuery ? 'India edition' : 'US edition');
            
            // Try RSS2JSON API first (most reliable)
            const rss2jsonUrl = `${this.rss2jsonUrl}${encodeURIComponent(googleNewsRss)}`;
            
            try {
                const response = await this.fetchWithTimeout(rss2jsonUrl, 8000);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'ok' && data.items) {
                        const results = data.items.slice(0, maxResults).map(item => ({
                            title: this.cleanHtml(item.title || ''),
                            snippet: this.cleanHtml(item.description || item.content || ''),
                            url: item.link || '',
                            source: item.source || this.extractDomain(item.link || ''),
                            publishedDate: item.pubDate || null
                        }));
                        
                        if (results.length > 0) {
                            console.log('[WebSearch] Google News RSS success');
                            return results;
                        }
                    }
                }
            } catch (e) {
                console.warn('[WebSearch] RSS2JSON failed:', e.message);
            }
            
            // Fallback: Try fetching RSS directly via CORS proxy
            for (const proxy of this.corsProxies) {
                try {
                    const proxyUrl = `${proxy}${encodeURIComponent(googleNewsRss)}`;
                    const response = await this.fetchWithTimeout(proxyUrl, 8000);
                    
                    if (response.ok) {
                        const xmlText = await response.text();
                        const results = this.parseRssFeed(xmlText, maxResults);
                        if (results.length > 0) {
                            console.log('[WebSearch] Google News via proxy success');
                            return results;
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
            
            return [];
        } catch (error) {
            console.warn('[WebSearch] News search failed:', error);
            return [];
        }
    }

    // Search Bing News as additional fallback
    async searchBingNews(query, maxResults = 5) {
        try {
            const encodedQuery = encodeURIComponent(query);
            // Use Bing News RSS feed
            const bingNewsRss = `https://www.bing.com/news/search?q=${encodedQuery}&format=rss`;
            
            for (const proxy of this.corsProxies) {
                try {
                    const proxyUrl = `${proxy}${encodeURIComponent(bingNewsRss)}`;
                    const response = await this.fetchWithTimeout(proxyUrl, 6000);
                    
                    if (response.ok) {
                        const xmlText = await response.text();
                        const results = this.parseRssFeed(xmlText, maxResults);
                        if (results.length > 0) {
                            console.log('[WebSearch] Bing News success');
                            return results;
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
            return [];
        } catch (error) {
            console.warn('[WebSearch] Bing News search failed:', error);
            return [];
        }
    }

    // Parse RSS XML feed
    parseRssFeed(xmlText, maxResults = 5) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');
            const results = [];
            
            items.forEach((item, index) => {
                if (index >= maxResults) return;
                
                const title = item.querySelector('title')?.textContent || '';
                const link = item.querySelector('link')?.textContent || '';
                const description = item.querySelector('description')?.textContent || '';
                const pubDate = item.querySelector('pubDate')?.textContent || '';
                const source = item.querySelector('source')?.textContent || this.extractDomain(link);
                
                results.push({
                    title: this.cleanHtml(title),
                    snippet: this.cleanHtml(description).substring(0, 300),
                    url: link,
                    source: source,
                    publishedDate: pubDate
                });
            });
            
            return results;
        } catch (error) {
            console.warn('[WebSearch] RSS parsing failed:', error);
            return [];
        }
    }

    // DuckDuckGo Instant Answer API
    async searchDuckDuckGo(query) {
        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await this.fetchWithTimeout(
                `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`,
                5000
            );
            
            if (!response.ok) throw new Error('DuckDuckGo API failed');
            
            const data = await response.json();
            const results = [];
            
            // Abstract (main answer)
            if (data.Abstract) {
                results.push({
                    title: data.Heading || 'Summary',
                    snippet: data.Abstract,
                    url: data.AbstractURL || '',
                    source: data.AbstractSource || 'DuckDuckGo'
                });
            }
            
            // Related topics
            if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
                data.RelatedTopics.slice(0, 3).forEach(topic => {
                    if (topic.Text && topic.FirstURL) {
                        results.push({
                            title: topic.Text.split(' - ')[0] || 'Related',
                            snippet: topic.Text,
                            url: topic.FirstURL,
                            source: this.extractDomain(topic.FirstURL)
                        });
                    }
                });
            }
            
            return results;
        } catch (error) {
            console.warn('[WebSearch] DuckDuckGo search failed:', error);
            return [];
        }
    }

    // Wikipedia API search
    async searchWikipedia(query) {
        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await this.fetchWithTimeout(
                `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&format=json&origin=*&srlimit=3`,
                5000
            );
            
            if (!response.ok) throw new Error('Wikipedia API failed');
            
            const data = await response.json();
            const results = [];
            
            if (data.query && data.query.search) {
                for (const item of data.query.search) {
                    const snippet = this.cleanHtml(item.snippet);
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
            console.warn('[WebSearch] Wikipedia search failed:', error);
            return [];
        }
    }

    // Fetch with timeout
    async fetchWithTimeout(url, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json, text/xml, */*' }
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // Extract domain from URL
    extractDomain(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return 'Unknown';
        }
    }

    // Clean HTML tags from text
    cleanHtml(text) {
        if (!text) return '';
        return text
            .replace(/<[^>]*>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Remove duplicate results
    deduplicateResults(results) {
        const seen = new Set();
        return results.filter(result => {
            const key = result.url || result.title;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    // Format search results for AI context
    formatResultsForAI(results) {
        if (!results || results.length === 0) {
            return null;
        }

        let context = '\n\n---\n📚 **Web Search Results (Live Data):**\n\n';
        
        results.forEach((result, index) => {
            context += `[${index + 1}] **${result.title}**\n`;
            if (result.publishedDate) {
                context += `   Published: ${new Date(result.publishedDate).toLocaleDateString()}\n`;
            }
            context += `   ${result.snippet}\n`;
            context += `   Source: ${result.source} (${result.url})\n\n`;
        });
        
        return context;
    }

    // Get citation instructions for AI
    getCitationInstructions() {
        return `
IMPORTANT: I have provided LIVE web search results above from current sources. When answering:
1. USE the information from these search results - they contain CURRENT, UP-TO-DATE data
2. Cite your sources using [1], [2], etc. format that corresponds to the search results
3. Prioritize information from the search results over your training data for current events
4. If a result has a published date, mention how recent the information is
5. At the end of your response, list the sources you cited in a "Sources:" section
6. Be accurate and base your response primarily on the provided search results
7. If the search results contain news articles, summarize the key points from them`;
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
