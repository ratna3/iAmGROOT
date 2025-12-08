// Web Search Service - Ultra Enhanced Edition
// Comprehensive web search and scraping with multiple providers
// Designed to rival Gemini's web search capabilities

class WebSearchService {
    constructor() {
        this.searchEnabled = true;
        this.lastSearchResults = [];
        this.searchCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // ========== SEARCH PROVIDERS ==========
        
        // SearXNG instances (meta-search engine - aggregates Google, Bing, DuckDuckGo, etc.)
        this.searxngInstances = [
            'https://searx.be',
            'https://search.sapti.me',
            'https://searx.tiekoetter.com',
            'https://paulgo.io',
            'https://search.ononoki.org',
            'https://searx.work',
            'https://opnxng.com',
            'https://searx.prvcy.eu',
            'https://search.mdosch.de',
            'https://searx.fmac.xyz',
            'https://northboot.xyz',
            'https://search.neet.works'
        ];
        
        // CORS proxies for web scraping
        this.corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://thingproxy.freeboard.io/fetch/',
            'https://cors-anywhere.herokuapp.com/'
        ];
        
        // RSS feed parsers
        this.rssParsers = [
            'https://api.rss2json.com/v1/api.json?rss_url=',
            'https://rss.app/feeds/'
        ];
        
        // Domain trust scores (higher = more reliable)
        this.trustedDomains = {
            'wikipedia.org': 95,
            'reuters.com': 95,
            'apnews.com': 95,
            'bbc.com': 90,
            'bbc.co.uk': 90,
            'nytimes.com': 90,
            'theguardian.com': 88,
            'wsj.com': 88,
            'bloomberg.com': 88,
            'techcrunch.com': 85,
            'wired.com': 85,
            'theverge.com': 85,
            'arstechnica.com': 85,
            'cnn.com': 82,
            'forbes.com': 80,
            'hindustantimes.com': 80,
            'timesofindia.indiatimes.com': 80,
            'ndtv.com': 80,
            'indianexpress.com': 80,
            'thehindu.com': 82,
            'economictimes.indiatimes.com': 80,
            'moneycontrol.com': 78,
            'livemint.com': 78,
            'news18.com': 75,
            'indiatoday.in': 75,
            'medium.com': 70,
            'dev.to': 70,
            'stackoverflow.com': 85,
            'github.com': 85,
            'docs.microsoft.com': 90,
            'developer.mozilla.org': 92
        };
        
        // ========== SEARCH TRIGGERS ==========
        
        this.newsKeywords = [
            'news', 'headlines', 'breaking', 'latest news', 'today news',
            'yesterday', 'this week', 'current events', 'top stories',
            'updates', 'happening', 'announced', 'reported', 'previous day',
            'previous', 'launched', 'released', 'unveiled', 'introduced',
            '2024', '2025', 'latest', 'recent', 'new launch', 'just',
            'today', 'now', 'currently', 'this morning', 'tonight'
        ];
        
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
            'official', 'source', 'reference', 'cite', 'price', 'cost',
            // Comparison
            'vs', 'versus', 'compare', 'difference', 'better', 'best', 'top'
        ];
        
        this.searchTopics = [
            'programming', 'technology', 'science', 'medicine', 'health',
            'news', 'politics', 'economics', 'finance', 'stocks', 'crypto',
            'sports', 'weather', 'events', 'releases', 'election',
            'car', 'suv', 'vehicle', 'automobile', 'tata', 'mahindra', 'maruti',
            'hyundai', 'kia', 'honda', 'toyota', 'bmw', 'mercedes', 'audi',
            'tesla', 'ford', 'chevrolet', 'volkswagen', 'nissan',
            'government', 'policy', 'law', 'court',
            'iphone', 'android', 'samsung', 'google', 'apple', 'microsoft',
            'ai', 'artificial intelligence', 'machine learning', 'chatgpt', 'gemini',
            'startup', 'ipo', 'merger', 'acquisition', 'funding'
        ];
        
        // Track working instances
        this.workingInstances = new Set();
        this.failedInstances = new Set();
    }

    // ========== QUERY ANALYSIS ==========

    isNewsQuery(query) {
        const lowerQuery = query.toLowerCase();
        
        const hasNewsKeyword = this.newsKeywords.some(keyword => 
            lowerQuery.includes(keyword.toLowerCase())
        );
        
        const newsPatterns = [
            /\b(news|headlines|stories)\b/i,
            /\b(yesterday|today|this week|latest|recent)\b.*\b(news|update|event|happening|launch)/i,
            /\b(launched|released|unveiled|announced|introduced)\b.*\b(in|on)?\s*\d{4}/i,
            /\b(top|latest|recent|new)\s+\d+\b/i,
            /\blatest\s+(\w+\s+)?(car|suv|phone|product|model|version)/i,
            /\b(what|which|whats|what's).*\b(latest|newest|recent)\b/i,
            /\b\d{4}\b.*\b(launch|release|new|model)/i,
            /\b(give|tell|show|list)\b.*\b(latest|recent|new|top)\b/i
        ];
        
        return hasNewsKeyword || newsPatterns.some(pattern => pattern.test(query));
    }

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
        const isQuestion = /^(what|who|when|where|why|how|is|are|can|could|would|should|do|does|did|give|tell|show|list|find|whats|what's)\b/i.test(query.trim());
        
        // Check query length
        const isComplex = query.split(' ').length > 4;
        
        // Check for year references
        const hasYear = /\b(202[3-9]|20[3-9]\d)\b/.test(query);
        
        return hasKeyword || hasTopic || (isQuestion && isComplex) || hasYear;
    }

    // ========== MAIN SEARCH ORCHESTRATOR ==========

    async performSearch(query, maxResults = 6) {
        console.log('[WebSearch] 🔍 Starting comprehensive search for:', query);
        console.log('[WebSearch] Is news query:', this.isNewsQuery(query));
        
        // Check cache first
        const cacheKey = query.toLowerCase().trim();
        const cached = this.searchCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            console.log('[WebSearch] 📦 Using cached results');
            return cached.results;
        }
        
        let allResults = [];
        const searchPromises = [];
        
        // Determine search strategy based on query type
        const isNews = this.isNewsQuery(query);
        
        // 1. SearXNG Search (primary - aggregates multiple search engines)
        searchPromises.push(
            this.searchSearXNG(query, maxResults)
                .then(results => ({ source: 'SearXNG', results }))
                .catch(e => ({ source: 'SearXNG', results: [], error: e.message }))
        );
        
        // 2. News-specific searches for news queries
        if (isNews) {
            searchPromises.push(
                this.searchGoogleNews(query, maxResults)
                    .then(results => ({ source: 'GoogleNews', results }))
                    .catch(e => ({ source: 'GoogleNews', results: [], error: e.message }))
            );
            
            searchPromises.push(
                this.searchBingNews(query, maxResults)
                    .then(results => ({ source: 'BingNews', results }))
                    .catch(e => ({ source: 'BingNews', results: [], error: e.message }))
            );
        }
        
        // 3. DuckDuckGo (instant answers + related topics)
        searchPromises.push(
            this.searchDuckDuckGo(query)
                .then(results => ({ source: 'DuckDuckGo', results }))
                .catch(e => ({ source: 'DuckDuckGo', results: [], error: e.message }))
        );
        
        // 4. Wikipedia (for factual queries)
        searchPromises.push(
            this.searchWikipedia(query, 2)
                .then(results => ({ source: 'Wikipedia', results }))
                .catch(e => ({ source: 'Wikipedia', results: [], error: e.message }))
        );
        
        // Execute all searches in parallel
        const searchResults = await Promise.all(searchPromises);
        
        // Aggregate and log results
        for (const result of searchResults) {
            if (result.results.length > 0) {
                console.log(`[WebSearch] ✅ ${result.source}: ${result.results.length} results`);
                allResults = [...allResults, ...result.results];
            } else if (result.error) {
                console.log(`[WebSearch] ❌ ${result.source}: ${result.error}`);
            }
        }
        
        // Deduplicate and rank results
        allResults = this.deduplicateResults(allResults);
        allResults = this.rankResults(allResults);
        allResults = allResults.slice(0, maxResults);
        
        // Enhance results with content extraction if needed
        if (allResults.length > 0 && allResults.length < 3) {
            console.log('[WebSearch] 📄 Attempting content extraction for better results');
            allResults = await this.enhanceWithContent(allResults);
        }
        
        // Cache results
        this.searchCache.set(cacheKey, {
            results: allResults,
            timestamp: Date.now()
        });
        
        this.lastSearchResults = allResults;
        console.log(`[WebSearch] 🎯 Final: ${allResults.length} results`);
        
        return allResults;
    }

    // ========== SEARCH PROVIDERS ==========

    // SearXNG - Meta search engine (aggregates Google, Bing, DuckDuckGo, etc.)
    async searchSearXNG(query, maxResults = 6) {
        const encodedQuery = encodeURIComponent(query);
        
        // Shuffle instances for load balancing
        const instances = [...this.searxngInstances]
            .filter(i => !this.failedInstances.has(i))
            .sort(() => Math.random() - 0.5);
        
        // Add working instances first
        const prioritizedInstances = [
            ...Array.from(this.workingInstances),
            ...instances.filter(i => !this.workingInstances.has(i))
        ];
        
        for (const instance of prioritizedInstances.slice(0, 5)) {
            try {
                const url = `${instance}/search?q=${encodedQuery}&format=json&categories=general,news&language=en`;
                
                const response = await this.fetchWithTimeout(url, 6000);
                if (!response.ok) continue;
                
                const data = await response.json();
                const results = [];
                
                if (data.results && Array.isArray(data.results)) {
                    for (const item of data.results.slice(0, maxResults)) {
                        if (!item.url || !item.title) continue;
                        
                        results.push({
                            title: this.cleanText(item.title),
                            snippet: this.cleanText(item.content || item.description || ''),
                            url: item.url,
                            source: this.extractDomain(item.url),
                            publishedDate: this.parseDate(item.publishedDate),
                            engine: item.engine || 'SearXNG',
                            score: this.calculateScore(item)
                        });
                    }
                }
                
                if (results.length > 0) {
                    this.workingInstances.add(instance);
                    console.log(`[WebSearch] SearXNG success: ${instance}`);
                    return results;
                }
            } catch (error) {
                this.failedInstances.add(instance);
                continue;
            }
        }
        
        return [];
    }

    // Google News RSS
    async searchGoogleNews(query, maxResults = 5) {
        const encodedQuery = encodeURIComponent(query);
        
        // Detect if query is India-related
        const isIndiaQuery = /\b(india|indian|delhi|mumbai|bangalore|bengaluru|chennai|kolkata|hyderabad|pune|uttar pradesh|up|maharashtra|karnataka|tamil nadu|gujarat|rajasthan|punjab|bihar|bengal|tata|mahindra|reliance|infosys|wipro|hdfc|icici|sensex|nifty|rupee|modi|bjp|congress|aap|nda|upa)\b/i.test(query);
        
        const feeds = isIndiaQuery ? [
            `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-IN&gl=IN&ceid=IN:en`,
            `https://news.google.com/rss/search?q=${encodedQuery}+India&hl=en&gl=US&ceid=US:en`
        ] : [
            `https://news.google.com/rss/search?q=${encodedQuery}&hl=en&gl=US&ceid=US:en`,
            `https://news.google.com/rss/search?q=${encodedQuery}&hl=en&gl=GB&ceid=GB:en`
        ];
        
        for (const feedUrl of feeds) {
            try {
                // Try RSS2JSON first
                const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
                const response = await this.fetchWithTimeout(rss2jsonUrl, 8000);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'ok' && data.items && data.items.length > 0) {
                        return data.items.slice(0, maxResults).map(item => ({
                            title: this.cleanText(item.title || ''),
                            snippet: this.cleanText(item.description || item.content || ''),
                            url: item.link || '',
                            source: item.source || this.extractDomain(item.link || ''),
                            publishedDate: this.parseDate(item.pubDate),
                            engine: 'Google News',
                            score: 85
                        }));
                    }
                }
            } catch (e) {
                continue;
            }
            
            // Fallback: Direct fetch with CORS proxy
            for (const proxy of this.corsProxies.slice(0, 2)) {
                try {
                    const proxyUrl = `${proxy}${encodeURIComponent(feedUrl)}`;
                    const response = await this.fetchWithTimeout(proxyUrl, 8000);
                    
                    if (response.ok) {
                        const xmlText = await response.text();
                        const results = this.parseRssFeed(xmlText, maxResults);
                        if (results.length > 0) {
                            return results.map(r => ({ ...r, engine: 'Google News', score: 85 }));
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
        }
        
        return [];
    }

    // Bing News RSS
    async searchBingNews(query, maxResults = 5) {
        const encodedQuery = encodeURIComponent(query);
        const bingNewsRss = `https://www.bing.com/news/search?q=${encodedQuery}&format=rss`;
        
        for (const proxy of this.corsProxies) {
            try {
                const proxyUrl = `${proxy}${encodeURIComponent(bingNewsRss)}`;
                const response = await this.fetchWithTimeout(proxyUrl, 6000);
                
                if (response.ok) {
                    const xmlText = await response.text();
                    const results = this.parseRssFeed(xmlText, maxResults);
                    if (results.length > 0) {
                        return results.map(r => ({ ...r, engine: 'Bing News', score: 80 }));
                    }
                }
            } catch (e) {
                continue;
            }
        }
        
        return [];
    }

    // DuckDuckGo Instant Answer API
    async searchDuckDuckGo(query) {
        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await this.fetchWithTimeout(
                `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`,
                5000
            );
            
            if (!response.ok) return [];
            
            const data = await response.json();
            const results = [];
            
            // Abstract (main answer)
            if (data.Abstract && data.AbstractURL) {
                results.push({
                    title: data.Heading || 'Summary',
                    snippet: data.Abstract,
                    url: data.AbstractURL,
                    source: data.AbstractSource || 'DuckDuckGo',
                    engine: 'DuckDuckGo',
                    score: 75
                });
            }
            
            // Answer (direct answer)
            if (data.Answer) {
                results.push({
                    title: 'Direct Answer',
                    snippet: data.Answer,
                    url: data.AnswerURL || `https://duckduckgo.com/?q=${encodedQuery}`,
                    source: 'DuckDuckGo',
                    engine: 'DuckDuckGo',
                    score: 80
                });
            }
            
            // Related topics
            if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
                for (const topic of data.RelatedTopics.slice(0, 3)) {
                    if (topic.Text && topic.FirstURL) {
                        results.push({
                            title: topic.Text.split(' - ')[0] || 'Related Topic',
                            snippet: topic.Text,
                            url: topic.FirstURL,
                            source: this.extractDomain(topic.FirstURL),
                            engine: 'DuckDuckGo',
                            score: 65
                        });
                    }
                }
            }
            
            // Infobox (structured data)
            if (data.Infobox && data.Infobox.content) {
                const infoContent = data.Infobox.content
                    .slice(0, 5)
                    .map(item => `${item.label}: ${item.value}`)
                    .join('. ');
                if (infoContent) {
                    results.push({
                        title: data.Heading + ' - Quick Facts',
                        snippet: infoContent,
                        url: data.AbstractURL || `https://duckduckgo.com/?q=${encodedQuery}`,
                        source: 'DuckDuckGo Infobox',
                        engine: 'DuckDuckGo',
                        score: 70
                    });
                }
            }
            
            return results;
        } catch (error) {
            console.warn('[WebSearch] DuckDuckGo failed:', error.message);
            return [];
        }
    }

    // Wikipedia API
    async searchWikipedia(query, maxResults = 3) {
        try {
            const encodedQuery = encodeURIComponent(query);
            
            // Search for articles
            const searchResponse = await this.fetchWithTimeout(
                `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&format=json&origin=*&srlimit=${maxResults}&srprop=snippet|timestamp`,
                5000
            );
            
            if (!searchResponse.ok) return [];
            
            const searchData = await searchResponse.json();
            const results = [];
            
            if (searchData.query && searchData.query.search) {
                for (const item of searchData.query.search) {
                    const snippet = this.cleanText(item.snippet);
                    results.push({
                        title: item.title,
                        snippet: snippet,
                        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
                        source: 'Wikipedia',
                        publishedDate: this.parseDate(item.timestamp),
                        engine: 'Wikipedia',
                        score: 90
                    });
                }
            }
            
            return results;
        } catch (error) {
            console.warn('[WebSearch] Wikipedia failed:', error.message);
            return [];
        }
    }

    // ========== CONTENT EXTRACTION ==========

    async enhanceWithContent(results) {
        const enhanced = [];
        
        for (const result of results) {
            if (result.snippet && result.snippet.length > 100) {
                enhanced.push(result);
                continue;
            }
            
            // Try to extract more content from the URL
            try {
                const content = await this.extractContent(result.url);
                if (content) {
                    enhanced.push({
                        ...result,
                        snippet: content.substring(0, 500) + '...',
                        extractedContent: content
                    });
                } else {
                    enhanced.push(result);
                }
            } catch (e) {
                enhanced.push(result);
            }
        }
        
        return enhanced;
    }

    async extractContent(url) {
        for (const proxy of this.corsProxies.slice(0, 2)) {
            try {
                const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
                const response = await this.fetchWithTimeout(proxyUrl, 5000);
                
                if (!response.ok) continue;
                
                const html = await response.text();
                return this.extractMainContent(html);
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    extractMainContent(html) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Remove unwanted elements
            const removeSelectors = ['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe', 'noscript', 'form', '.ad', '.advertisement', '.sidebar', '.menu', '.navigation'];
            removeSelectors.forEach(sel => {
                doc.querySelectorAll(sel).forEach(el => el.remove());
            });
            
            // Try to find main content
            const contentSelectors = ['article', 'main', '.article-content', '.post-content', '.entry-content', '.content', '#content', '.story-body'];
            
            for (const selector of contentSelectors) {
                const element = doc.querySelector(selector);
                if (element) {
                    const text = element.textContent.trim();
                    if (text.length > 200) {
                        return this.cleanText(text);
                    }
                }
            }
            
            // Fallback: get all paragraph text
            const paragraphs = doc.querySelectorAll('p');
            const text = Array.from(paragraphs)
                .map(p => p.textContent.trim())
                .filter(t => t.length > 50)
                .join(' ');
            
            return text.length > 200 ? this.cleanText(text) : null;
        } catch (e) {
            return null;
        }
    }

    // ========== RSS PARSING ==========

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
                
                if (title && link) {
                    results.push({
                        title: this.cleanText(title),
                        snippet: this.cleanText(description).substring(0, 400),
                        url: link,
                        source: source,
                        publishedDate: this.parseDate(pubDate)
                    });
                }
            });
            
            return results;
        } catch (error) {
            return [];
        }
    }

    // ========== RESULT PROCESSING ==========

    deduplicateResults(results) {
        const seen = new Map();
        
        return results.filter(result => {
            // Create a normalized key from title or URL
            const titleKey = result.title?.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
            const urlKey = result.url?.toLowerCase().replace(/https?:\/\/(www\.)?/, '').split('?')[0];
            
            if (seen.has(titleKey) || seen.has(urlKey)) {
                return false;
            }
            
            if (titleKey) seen.set(titleKey, true);
            if (urlKey) seen.set(urlKey, true);
            return true;
        });
    }

    rankResults(results) {
        return results.sort((a, b) => {
            // Calculate composite score
            const scoreA = this.calculateFinalScore(a);
            const scoreB = this.calculateFinalScore(b);
            return scoreB - scoreA;
        });
    }

    calculateScore(item) {
        let score = 50;
        
        // Domain trust
        const domain = this.extractDomain(item.url || '');
        for (const [trustedDomain, trustScore] of Object.entries(this.trustedDomains)) {
            if (domain.includes(trustedDomain)) {
                score = Math.max(score, trustScore);
                break;
            }
        }
        
        return score;
    }

    calculateFinalScore(result) {
        let score = result.score || 50;
        
        // Boost for trusted domains
        const domain = result.source?.toLowerCase() || '';
        for (const [trustedDomain, trustScore] of Object.entries(this.trustedDomains)) {
            if (domain.includes(trustedDomain)) {
                score += trustScore / 5;
                break;
            }
        }
        
        // Boost for recent content
        if (result.publishedDate) {
            const age = Date.now() - new Date(result.publishedDate).getTime();
            const hourAge = age / (1000 * 60 * 60);
            if (hourAge < 24) score += 20;
            else if (hourAge < 72) score += 15;
            else if (hourAge < 168) score += 10;
        }
        
        // Boost for content length
        if (result.snippet?.length > 200) score += 5;
        if (result.snippet?.length > 400) score += 5;
        
        return score;
    }

    // ========== UTILITY FUNCTIONS ==========

    async fetchWithTimeout(url, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json, text/xml, text/html, */*',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    extractDomain(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace(/^www\./, '');
        } catch {
            return 'Unknown';
        }
    }

    cleanText(text) {
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

    parseDate(dateString) {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date.toISOString();
        } catch {
            return null;
        }
    }

    formatRelativeDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 60) return `${diffMins} minutes ago`;
            if (diffHours < 24) return `${diffHours} hours ago`;
            if (diffDays < 7) return `${diffDays} days ago`;
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return '';
        }
    }

    // ========== AI CONTEXT FORMATTING ==========

    formatResultsForAI(results) {
        if (!results || results.length === 0) return null;
        
        let context = '\n\n---\n🌐 **LIVE WEB SEARCH RESULTS** (Real-time data from the internet):\n\n';
        
        results.forEach((result, index) => {
            const num = index + 1;
            context += `**[${num}] ${result.title}**\n`;
            context += `📍 Source: ${result.source}`;
            if (result.publishedDate) {
                context += ` | 📅 ${this.formatRelativeDate(result.publishedDate)}`;
            }
            context += `\n`;
            context += `📝 ${result.snippet}\n`;
            context += `🔗 ${result.url}\n\n`;
        });
        
        return context;
    }

    getCitationInstructions() {
        return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 IMPORTANT INSTRUCTIONS FOR USING WEB SEARCH RESULTS:

1. **USE THE PROVIDED DATA**: The search results above contain CURRENT, REAL-TIME information from the internet. Base your answer primarily on this data.

2. **CITE YOUR SOURCES**: When using information from search results, cite using [1], [2], etc. format inline.
   Example: "According to recent reports [1], the new Tata car was launched..."

3. **INCLUDE SOURCE DETAILS**: At the end of your response, add a "Sources" section listing all cited sources with their titles and domains.

4. **PRIORITIZE FRESHNESS**: Newer sources should be given more weight for current events questions.

5. **BE SPECIFIC**: Mention dates, names, and specific details from the sources.

6. **ACKNOWLEDGE LIMITATIONS**: If the search results don't fully answer the question, say so.

FORMAT YOUR SOURCES LIKE THIS:
---
📚 **Sources:**
[1] Article Title - domain.com
[2] Article Title - domain.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    getLastSearchResults() {
        return this.lastSearchResults;
    }

    clearLastResults() {
        this.lastSearchResults = [];
    }

    setEnabled(enabled) {
        this.searchEnabled = enabled;
    }

    isEnabled() {
        return this.searchEnabled;
    }

    clearCache() {
        this.searchCache.clear();
    }
}

// Create global instance
const webSearchService = new WebSearchService();
console.log('[WebSearch] 🚀 Ultra Enhanced Web Search Service initialized');
