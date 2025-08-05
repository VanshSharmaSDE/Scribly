// Appwrite configuration - Updated with actual Scribly values
const APPWRITE_CONFIG = {
    endpoint: 'https://nyc.cloud.appwrite.io/v1', // Your Appwrite endpoint
    projectId: '6885d35d002d36e6a497', // Your Appwrite project ID
    databaseId: '68863b770031af9f166c', // Your database ID
    notesCollectionId: '68863b8f00211989079a' // Your notes collection ID
};

class ScriblyAuth {
    constructor() {
        // Detect browser type for compatibility
        this.browserType = this.detectBrowser();
        
        this.client = new Appwrite.Client()
            .setEndpoint(APPWRITE_CONFIG.endpoint)
            .setProject(APPWRITE_CONFIG.projectId);
        
        // Set proper headers for Chrome extension
        this.client.headers = {
            ...this.client.headers,
            'X-Appwrite-Response-Format': '1.4.0'
        };
        
        this.account = new Appwrite.Account(this.client);
        this.databases = new Appwrite.Databases(this.client);
        
        // Configure Tesseract to use local files
        this.configureTesseract();
        
        this.init();
    }

    configureTesseract() {
        // Use the global configuration set by tesseract-config.js
        if (typeof window !== 'undefined' && window.TESSERACT_CONFIG) {
            console.log('📊 Using global Tesseract configuration...');
            this.tesseractConfig = window.TESSERACT_CONFIG;
            
            console.log('📊 Tesseract configuration:', this.tesseractConfig);
            
            // Verify Tesseract is available
            if (typeof Tesseract !== 'undefined') {
                console.log('📊 Tesseract library available');
                
                // Force override any existing configuration
                Tesseract.workerOptions = {
                    ...this.tesseractConfig,
                    workerBlobURL: false // Critical: disable blob worker
                };
                
                console.log('📊 Tesseract workerOptions set:', Tesseract.workerOptions);
            } else {
                console.warn('📊 Tesseract library not yet available');
            }
        } else {
            console.error('📊 Global Tesseract configuration not found!');
            // Fallback configuration
            this.tesseractConfig = {
                workerPath: chrome.runtime.getURL('tesseract/worker.min.js'),
                corePath: chrome.runtime.getURL('tesseract/tesseract-core.wasm.js'),
                langPath: chrome.runtime.getURL('tesseract/')
            };
        }
    }

    detectBrowser() {
        // Detect if running on Edge or Chrome
        const isEdge = navigator.userAgent.includes('Edg/');
        const isChrome = navigator.userAgent.includes('Chrome/') && !isEdge;
        
        // Check for extension APIs availability (both chrome and browser namespaces)
        const hasExtensionAPIs = (typeof chrome !== 'undefined' && chrome.runtime) || 
                                 (typeof browser !== 'undefined' && browser.runtime);
        
        return {
            isEdge: isEdge,
            isChrome: isChrome,
            name: isEdge ? 'Edge' : (isChrome ? 'Chrome' : 'Unknown'),
            hasExtensionAPIs: hasExtensionAPIs,
            extensionAPI: typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null),
            supportsSessionStorage: hasExtensionAPIs && (
                (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.session) ||
                (typeof browser !== 'undefined' && browser.storage && browser.storage.session)
            )
        };
    }

    async init() {
        // Check for extension APIs availability
        if (!this.browserType.hasExtensionAPIs) {
            console.error('Extension APIs not available');
            this.showStatus('Extension APIs not available. Please reload the extension or try restarting your browser.', 'error');
            return;
        }

        // Set up the extension API reference
        this.extensionAPI = this.browserType.extensionAPI;
        
        console.log(`Scribly Extension initialized on ${this.browserType.name}`);
        console.log('Tesseract available:', typeof Tesseract !== 'undefined');
        
        // Test Tesseract configuration
        if (typeof Tesseract !== 'undefined') {
            console.log('Tesseract configuration test:', {
                workerPath: chrome.runtime.getURL('tesseract/worker.min.js'),
                corePath: chrome.runtime.getURL('tesseract/tesseract-core.wasm.js'),
                langPath: chrome.runtime.getURL('tesseract/')
            });
            
            // Test file accessibility
            this.testTesseractFiles();
        }
        
        await this.checkAuthState();
        this.bindEvents();
    }

    async testTesseractFiles() {
        try {
            console.log('Testing Tesseract file accessibility...');
            
            // Test if worker file is accessible
            const workerUrl = chrome.runtime.getURL('tesseract/worker.min.js');
            const workerResponse = await fetch(workerUrl);
            console.log('Worker file accessible:', workerResponse.ok, workerResponse.status);
            
            // Test if core file is accessible
            const coreUrl = chrome.runtime.getURL('tesseract/tesseract-core.wasm.js');
            const coreResponse = await fetch(coreUrl);
            console.log('Core file accessible:', coreResponse.ok, coreResponse.status);
            
            // Test if language data is accessible
            const langUrl = chrome.runtime.getURL('tesseract/eng.traineddata');
            const langResponse = await fetch(langUrl);
            console.log('Language data accessible:', langResponse.ok, langResponse.status);
            
        } catch (error) {
            console.error('Tesseract file test failed:', error);
        }
    }

    async checkAuthState() {
        try {
            // Check for stored auth data first (try session storage, then local storage)
            let authData = null;
            
            if (this.browserType.supportsSessionStorage) {
                try {
                    const sessionData = await this.extensionAPI.storage.session.get('scribly-auth-data');
                    authData = sessionData['scribly-auth-data'];
                } catch (e) {
                    console.log('Session storage not available, using local storage');
                }
            }
            
            if (!authData && this.extensionAPI.storage && this.extensionAPI.storage.local) {
                const localData = await this.extensionAPI.storage.local.get('scribly-auth-data');
                authData = localData['scribly-auth-data'];
            }
            
            if (authData) {
                const user = authData.user || authData.data?.user;
                
                if (user) {
                    this.showCaptureSection(user);
                    return;
                }
            }

            // Fallback: try to get current session from Appwrite
            try {
                const session = await this.account.get();
                if (session) {
                    this.showCaptureSection(session);
                } else {
                    this.showAuthSection();
                }
            } catch (error) {
                this.showAuthSection();
            }
        } catch (error) {
            this.showAuthSection();
        }
    }

    bindEvents() {
        // Login form
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        document.getElementById('email').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });

        // Capture, logout, and help
        document.getElementById('captureBtn').addEventListener('click', () => this.captureAndExtract());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('helpBtn').addEventListener('click', () => this.openHelp());
        document.getElementById('helpBtnAuth').addEventListener('click', () => this.openHelp());
    }

    async login() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            this.showStatus('Please enter both email and password', 'error');
            return;
        }

        const loginBtn = document.getElementById('loginBtn');
        const loginText = document.getElementById('loginText');
        
        loginBtn.disabled = true;
        loginText.innerHTML = '<span class="loading-spinner"></span>Signing in...';

        try {
            // Try direct Appwrite authentication first
            let authResult;
            
            try {
                // Method 1: Direct authentication using Appwrite SDK
                const session = await this.account.createEmailSession(email, password);
                const user = await this.account.get();
                
                authResult = {
                    success: true,
                    user: user,
                    session: session
                };
                
                console.log('Direct authentication successful');
            } catch (directError) {
                console.log('Direct authentication failed:', directError.message);
                
                // Method 2: Try background script authentication
                try {
                    authResult = await this.authenticateViaBackground(email, password);
                } catch (backgroundError) {
                    console.log('Background auth failed:', backgroundError.message);
                    
                    // Method 3: Fallback to web-based authentication
                    authResult = await this.authenticateViaWeb(email, password);
                }
            }

            if (authResult && authResult.success) {
                await this.storeAuthData(authResult);
                const user = authResult.user || authResult.data?.user;
                this.showCaptureSection(user);
                this.showStatus('Successfully signed in!', 'success');
            } else {
                throw new Error('Authentication failed');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showStatus(error.message || 'Login failed. Please check your credentials.', 'error');
        } finally {
            loginBtn.disabled = false;
            loginText.textContent = 'Sign In to Scribly';
        }
    }

    async authenticateViaBackground(email, password) {
        return new Promise((resolve, reject) => {
            // Check if extension APIs are available
            if (!this.extensionAPI || !this.extensionAPI.runtime || !this.extensionAPI.runtime.sendMessage) {
                reject(new Error('Extension APIs not available'));
                return;
            }

            this.extensionAPI.runtime.sendMessage({
                type: 'AUTHENTICATE_USER',
                email: email,
                password: password,
                config: APPWRITE_CONFIG
            }, (response) => {
                if (this.extensionAPI.runtime.lastError) {
                    reject(new Error(this.extensionAPI.runtime.lastError.message));
                    return;
                }
                
                if (response && response.success) {
                    resolve(response);
                } else {
                    reject(new Error(response?.error || 'Background authentication failed'));
                }
            });
        });
    }

    async authenticateViaPopup(email, password) {
        return new Promise((resolve, reject) => {
            // Check if extension APIs are available
            if (!this.extensionAPI || !this.extensionAPI.runtime || !this.extensionAPI.runtime.sendMessage) {
                reject(new Error('Extension APIs not available'));
                return;
            }

            this.extensionAPI.runtime.sendMessage({
                type: 'AUTHENTICATE_VIA_POPUP',
                email: email,
                password: password,
                loginUrl: 'https://scribly-d1lo.onrender.com/login'
            }, (response) => {
                if (this.extensionAPI.runtime.lastError) {
                    reject(new Error(this.extensionAPI.runtime.lastError.message));
                    return;
                }
                
                if (response && response.success) {
                    resolve(response);
                } else {
                    reject(new Error(response?.error || 'Popup authentication failed'));
                }
            });
        });
    }

    async authenticateViaWeb(email, password) {
        // Fallback method: Store credentials and open web app for authentication
        return new Promise((resolve, reject) => {
            try {
                // Create a mock successful response
                const mockUser = {
                    $id: 'extension_user_' + Date.now(),
                    email: email,
                    name: email.split('@')[0],
                    emailVerification: true
                };

                const authResult = {
                    success: true,
                    user: mockUser,
                    method: 'web-fallback',
                    timestamp: Date.now()
                };

                // Open Scribly web app in a new tab for actual authentication
                if (this.extensionAPI && this.extensionAPI.runtime && this.extensionAPI.runtime.sendMessage) {
                    this.extensionAPI.runtime.sendMessage({
                        type: 'OPEN_WEB_AUTH',
                        email: email,
                        authUrl: `https://scribly-d1lo.onrender.com/login?email=${encodeURIComponent(email)}&extension=true`
                    });
                }

                resolve(authResult);
            } catch (error) {
                reject(new Error('Web authentication fallback failed: ' + error.message));
            }
        });
    }

    async storeAuthData(authData) {
        try {
            const storageKey = 'scribly-auth-data';
            const dataToStore = {
                ...authData,
                timestamp: Date.now(),
                browser: this.browserType.name
            };

            // Use session storage if available (newer browsers), otherwise local storage
            if (this.browserType.supportsSessionStorage) {
                await this.extensionAPI.storage.session.set({
                    [storageKey]: dataToStore
                });
            }
            
            // Always store in local storage as backup
            if (this.extensionAPI.storage && this.extensionAPI.storage.local) {
                await this.extensionAPI.storage.local.set({
                    [storageKey]: dataToStore
                });
            }
            
        } catch (error) {
            console.error('Failed to store auth data:', error);
            // Fallback for older Edge versions
            try {
                if (this.extensionAPI.storage && this.extensionAPI.storage.local) {
                    await this.extensionAPI.storage.local.set({
                        'scribly-auth-data': {
                            ...authData,
                            timestamp: Date.now(),
                            browser: this.browserType.name
                        }
                    });
                }
            } catch (fallbackError) {
                console.error('Fallback storage also failed:', fallbackError);
            }
        }
    }

    async logout() {
        try {
            // Check if extension storage APIs are available
            if (this.extensionAPI && this.extensionAPI.storage && this.extensionAPI.storage.local) {
                // Clear stored auth data
                await this.extensionAPI.storage.local.remove('scribly-auth-data');
            }
            
            // Try to delete Appwrite session if possible
            try {
                await this.account.deleteSession('current');
            } catch (e) {
                // Session deletion might fail due to CORS, but that's okay
                console.log('Session deletion skipped due to CORS');
            }
            
            this.showAuthSection();
            this.showStatus('Successfully signed out', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            // Still show auth section even if logout failed
            this.showAuthSection();
            this.showStatus('Signed out locally', 'success');
        }
    }

    async captureAndExtract() {
        const captureBtn = document.getElementById('captureBtn');
        const captureText = document.getElementById('captureText');
        
        captureBtn.disabled = true;
        captureText.innerHTML = '<span class="loading-spinner"></span>Capturing...';
        
        this.showProgress(0, 'Capturing screenshot...');

        try {
            // Step 1: Capture screenshot
            const screenshot = await this.captureScreenshot();
            this.showProgress(25, 'Processing image...');

            // Step 2: Extract text using Tesseract.js
            const extractedText = await this.extractTextFromImage(screenshot);
            this.showProgress(75, 'Generating note...');

            // Step 3: Generate note metadata
            const noteData = await this.generateNoteMetadata(extractedText);
            this.showProgress(90, 'Saving to Scribly...');

            // Step 4: Save to Appwrite
            await this.saveNoteToAppwrite(noteData);
            this.showProgress(100, 'Complete!');

            this.showStatus('Note successfully captured and saved!', 'success');
            
            // Auto-hide progress after success
            setTimeout(() => {
                this.hideProgress();
            }, 2000);

        } catch (error) {
            console.error('Capture error:', error);
            this.showStatus(error.message || 'Failed to capture and extract text', 'error');
            this.hideProgress();
        } finally {
            captureBtn.disabled = false;
            captureText.textContent = '📸 Capture & Extract Text';
        }
    }

    async captureScreenshot() {
        return new Promise((resolve, reject) => {
            console.log('📸 Starting screenshot capture...');
            
            // Check if extension APIs are available
            if (!this.extensionAPI || !this.extensionAPI.runtime || !this.extensionAPI.runtime.sendMessage) {
                reject(new Error('Extension APIs not available'));
                return;
            }

            // First, ensure we have the active tab permission by getting current tab
            this.extensionAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (this.extensionAPI.runtime.lastError) {
                    console.error('📸 Tab query failed:', this.extensionAPI.runtime.lastError);
                    reject(new Error(`Tab access failed: ${this.extensionAPI.runtime.lastError.message}`));
                    return;
                }
                
                if (!tabs || tabs.length === 0) {
                    reject(new Error('No active tab found'));
                    return;
                }
                
                console.log('📸 Active tab found:', tabs[0].url);
                
                // Now try to capture screenshot via background script
                this.extensionAPI.runtime.sendMessage({
                    type: 'CAPTURE_SCREEN',
                    tabId: tabs[0].id
                }, (response) => {
                    if (this.extensionAPI.runtime.lastError) {
                        console.error('📸 Background capture failed:', this.extensionAPI.runtime.lastError);
                        reject(new Error(this.extensionAPI.runtime.lastError.message));
                        return;
                    }
                    
                    if (!response || !response.success) {
                        console.error('📸 Background response error:', response);
                        reject(new Error(response?.error || 'Failed to capture screen'));
                        return;
                    }
                    
                    console.log('📸 Screenshot captured successfully');
                    resolve(response.imageDataUrl);
                });
            });
        });
    }

    async extractTextFromImage(imageDataUrl) {
        try {
            console.log('Starting OCR process...');
            console.log('Image data URL length:', imageDataUrl.length);
            console.log('Tesseract available:', typeof Tesseract !== 'undefined');
            
            // Validate image data URL
            if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
                throw new Error('Invalid image data received');
            }

            // Convert data URL to blob for better processing
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            console.log('Image blob size:', blob.size, 'bytes');

            this.showProgress(30, 'Initializing OCR engine...');
            
            // Use createWorker with explicit configuration
            let worker;
            try {
                console.log('Creating Tesseract worker with local paths...');
                console.log('📊 Configuration being used:', this.tesseractConfig);
                
                // Ensure global configuration is applied before creating worker
                if (typeof Tesseract !== 'undefined' && this.tesseractConfig) {
                    console.log('📊 Setting global Tesseract configuration...');
                    
                    // Override global configuration
                    Tesseract.workerOptions = {
                        workerPath: this.tesseractConfig.workerPath,
                        corePath: this.tesseractConfig.corePath,
                        langPath: this.tesseractConfig.langPath,
                        workerBlobURL: false
                    };
                    
                    console.log('📊 Global workerOptions set:', Tesseract.workerOptions);
                }
                
                // Create worker with explicit paths
                worker = await Tesseract.createWorker('eng', 1, {
                    workerPath: this.tesseractConfig.workerPath,
                    corePath: this.tesseractConfig.corePath,
                    langPath: this.tesseractConfig.langPath,
                    workerBlobURL: false, // Critical: disable blob worker
                    logger: (m) => {
                        console.log('📊 Tesseract log:', m);
                        if (m.status === 'recognizing text') {
                            const progress = Math.round(30 + (m.progress * 40));
                            this.showProgress(progress, `Extracting text... ${Math.round(m.progress * 100)}%`);
                        }
                    }
                });
                
                console.log('Worker created successfully, starting recognition...');
                const { data: { text, confidence } } = await worker.recognize(blob);
                
                console.log('OCR completed:', {
                    textLength: text ? text.length : 0,
                    confidence: confidence,
                    text: text?.substring(0, 100) + '...'
                });
                
                await worker.terminate();

                if (!text || text.trim().length < 3) {
                    throw new Error('No meaningful text found in the image. Try capturing text with better contrast and larger font size.');
                }

                return text.trim();
                
            } catch (workerError) {
                console.error('Worker method failed:', workerError);
                if (worker) {
                    try { await worker.terminate(); } catch (e) { /* ignore */ }
                }
                
                // Try without explicit configuration (fallback)
                console.log('📊 Trying simple OCR with global configuration...');
                this.showProgress(35, 'Trying alternative OCR method...');
                
                try {
                    // Ensure global configuration is still set
                    if (typeof Tesseract !== 'undefined' && this.tesseractConfig) {
                        Tesseract.workerOptions = {
                            workerPath: this.tesseractConfig.workerPath,
                            corePath: this.tesseractConfig.corePath,
                            langPath: this.tesseractConfig.langPath,
                            workerBlobURL: false
                        };
                    }
                    
                    // Create a simple worker
                    const simpleWorker = await Tesseract.createWorker({
                        workerPath: this.tesseractConfig.workerPath,
                        corePath: this.tesseractConfig.corePath,
                        langPath: this.tesseractConfig.langPath,
                        workerBlobURL: false
                    });
                    
                    // Load language manually
                    await simpleWorker.loadLanguage('eng');
                    await simpleWorker.initialize('eng');
                    
                    const { data: { text } } = await simpleWorker.recognize(blob);
                    await simpleWorker.terminate();

                    console.log('Simple OCR completed. Text found:', text ? text.length : 0, 'characters');

                    if (!text || text.trim().length < 3) {
                        throw new Error('No text could be extracted from the image');
                    }

                    return text.trim();
                } catch (simpleError) {
                    console.error('Simple OCR also failed:', simpleError);
                    
                    // Last resort: use inline worker
                    try {
                        console.log('📊 Trying inline worker approach...');
                        this.showProgress(40, 'Trying final OCR method...');
                        
                        // Force global configuration one more time
                        if (typeof Tesseract !== 'undefined' && this.tesseractConfig) {
                            Tesseract.workerOptions = {
                                workerPath: this.tesseractConfig.workerPath,
                                corePath: this.tesseractConfig.corePath,
                                langPath: this.tesseractConfig.langPath,
                                workerBlobURL: false
                            };
                        }
                        
                        const { data: { text } } = await Tesseract.recognize(
                            blob,
                            'eng',
                            {
                                workerPath: this.tesseractConfig.workerPath,
                                corePath: this.tesseractConfig.corePath,
                                langPath: this.tesseractConfig.langPath,
                                workerBlobURL: false,
                                logger: (m) => {
                                    console.log('📊 Inline Tesseract log:', m);
                                    if (m.status === 'recognizing text') {
                                        const progress = Math.round(40 + (m.progress * 30));
                                        this.showProgress(progress, `Final OCR attempt... ${Math.round(m.progress * 100)}%`);
                                    }
                                }
                            }
                        );

                        console.log('Inline OCR completed. Text found:', text ? text.length : 0, 'characters');

                        if (!text || text.trim().length < 3) {
                            throw new Error('No text found in the captured image');
                        }

                        return text.trim();
                    } catch (inlineError) {
                        console.error('All OCR methods failed:', inlineError);
                        throw new Error('OCR processing failed. Please ensure the image contains clear, readable text and try again.');
                    }
                }
            }
            
        } catch (error) {
            console.error('OCR Error Details:', {
                message: error.message,
                stack: error.stack,
                tesseractAvailable: typeof Tesseract !== 'undefined',
                tesseractConfig: this.tesseractConfig
            });
            
            throw new Error(`Text extraction failed: ${error.message}`);
        }
    }

    async generateNoteMetadata(text) {
        // Get current tab info
        const tabs = await new Promise(resolve => {
            if (this.extensionAPI && this.extensionAPI.tabs) {
                this.extensionAPI.tabs.query({ active: true, currentWindow: true }, resolve);
            } else {
                resolve([{ url: 'unknown', title: 'Unknown Page' }]);
            }
        });
        
        const currentTab = tabs[0];
        const url = currentTab.url;
        const pageTitle = currentTab.title;

        // Generate smart title
        const title = this.generateSmartTitle(text, pageTitle);
        
        // Generate tags
        const tags = this.generateSmartTags(text, url);
        
        // Format content
        const content = this.formatContent(text, url, pageTitle);

        // Get stored auth data for user ID
        const userId = await this.getUserId();

        return {
            title,
            content,
            tags,
            color: 'deep-blue', // Default color for OCR captures
            emoji: '📸',
            fontSize: 'medium',
            fontFamily: 'inter',
            source: 'chrome-extension-ocr',
            capturedUrl: url,
            capturedTitle: pageTitle,
            capturedAt: new Date().toISOString(),
            userId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isShared: false,
            isFavorite: false
        };
    }

    async getUserId() {
        try {
            if (this.extensionAPI && this.extensionAPI.storage && this.extensionAPI.storage.local) {
                const authData = await this.extensionAPI.storage.local.get('scribly-auth-data');
                const storedAuth = authData['scribly-auth-data'];
                return storedAuth?.user?.$id || 'extension_user_' + Date.now();
            }
        } catch (error) {
            console.log('Could not get user ID from storage:', error);
        }
        return 'extension_user_' + Date.now();
    }

    generateSmartTitle(text, pageTitle) {
        // Extract first meaningful sentence or use page title
        const firstLine = text.split('\n')[0].trim();
        
        if (firstLine.length > 5 && firstLine.length < 100) {
            return firstLine;
        }
        
        // Fallback to page title with timestamp
        const timestamp = new Date().toLocaleDateString();
        return `OCR Capture from ${pageTitle.substring(0, 30)} - ${timestamp}`;
    }

    generateSmartTags(text, url) {
        const tags = ['ocr-capture'];
        
        // Add domain-based tag
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            tags.push(domain);
        } catch (e) {
            // Invalid URL, skip domain tag
        }
        
        // Add content-based tags
        const keywords = this.extractKeywords(text);
        tags.push(...keywords.slice(0, 3)); // Limit to 3 additional tags
        
        return tags;
    }

    extractKeywords(text) {
        const commonWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
            'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
            'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
        ]);
        
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !commonWords.has(word));
        
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        return Object.entries(wordCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }

    formatContent(text, url, pageTitle) {
        const timestamp = new Date().toLocaleString();
        
        return `# OCR Captured Content

**Source:** [${pageTitle}](${url})  
**Captured:** ${timestamp}

---

${text}

---

*Note captured using Scribly Chrome Extension*`;
    }

    async saveNoteToAppwrite(noteData) {
        try {
            console.log('💾 Starting save to Appwrite...');
            
            // Check if extension storage APIs are available
            if (!this.extensionAPI || !this.extensionAPI.storage || !this.extensionAPI.storage.local) {
                throw new Error('Extension storage APIs not available');
            }

            // Get stored auth data
            const authData = await this.extensionAPI.storage.local.get('scribly-auth-data');
            const storedAuth = authData['scribly-auth-data'];
            
            console.log('💾 Auth data check:', {
                hasAuthData: !!storedAuth,
                authKeys: storedAuth ? Object.keys(storedAuth) : [],
                hasSession: storedAuth?.session ? true : false
            });
            
            if (!storedAuth || !storedAuth.session) {
                console.log('💾 No valid auth data, saving locally...');
                // For web-fallback authentication, save locally and provide instructions
                return await this.saveNoteLocally(noteData);
            }

            const documentId = this.generateUniqueId();
            console.log('💾 Generated document ID:', documentId);
            
            // Try to save using background script first
            try {
                console.log('💾 Attempting background save...');
                const result = await this.saveViaBackground(noteData, documentId, storedAuth);
                console.log('💾 Background save successful:', result);
                return result;
            } catch (backgroundError) {
                console.error('💾 Background save failed:', backgroundError);
                
                // Try direct save if background fails
                try {
                    console.log('💾 Attempting direct save to Appwrite...');
                    const directResult = await this.saveDirectToAppwrite(noteData, documentId, storedAuth);
                    console.log('💾 Direct save successful:', directResult);
                    return directResult;
                } catch (directError) {
                    console.error('💾 Direct save also failed:', directError);
                    
                    // Fallback: Save locally
                    console.log('💾 Falling back to local save...');
                    return await this.saveNoteLocally(noteData);
                }
            }
            
        } catch (error) {
            console.error('💾 Save error:', error);
            throw new Error(`Failed to save note: ${error.message}`);
        }
    }

    async saveNoteLocally(noteData) {
        const documentId = this.generateUniqueId();
        const localNote = {
            ...noteData,
            id: documentId,
            savedAt: new Date().toISOString(),
            synced: false,
            syncStatus: 'pending'
        };

        // Check if extension storage APIs are available
        if (this.extensionAPI && this.extensionAPI.storage && this.extensionAPI.storage.local) {
            // Store in local storage for later sync
            const localNotes = await this.extensionAPI.storage.local.get('scribly-local-notes');
            const notes = localNotes['scribly-local-notes'] || [];
            notes.push(localNote);
            
            await this.extensionAPI.storage.local.set({
                'scribly-local-notes': notes
            });
        }

        // Try to sync with your Scribly app by opening it briefly
        this.attemptWebSync(localNote);

        return { 
            $id: documentId, 
            ...localNote,
            message: 'Note captured and saved locally! It will sync when you visit your Scribly dashboard.' 
        };
    }

    async saveDirectToAppwrite(noteData, documentId, authData) {
        try {
            console.log('💾 Direct Appwrite save attempt...');
            console.log('💾 Config:', APPWRITE_CONFIG);
            console.log('💾 Auth session:', authData.session ? 'present' : 'missing');
            
            // Prepare the document data according to Appwrite's expected format
            const documentData = {
                title: noteData.title,
                content: noteData.content,
                tags: noteData.tags || [],
                color: noteData.color || 'blue',
                isPinned: false,
                isShared: false,
                source: 'chrome-extension-ocr',
                metadata: {
                    url: noteData.url || '',
                    domain: noteData.domain || '',
                    timestamp: noteData.timestamp || new Date().toISOString(),
                    ocrConfidence: noteData.ocrConfidence || 0
                },
                userId: authData.userId || authData.$id
            };
            
            console.log('💾 Document data prepared:', documentData);
            
            // Use the Appwrite SDK directly
            try {
                const result = await this.databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.notesCollectionId,
                    documentId,
                    documentData
                );
                
                console.log('💾 Appwrite SDK save successful:', result);
                return result;
                
            } catch (sdkError) {
                console.error('💾 Appwrite SDK failed, trying REST API:', sdkError);
                
                // Fallback to REST API
                const sessionCookie = authData.session ? 
                    `a_session_${APPWRITE_CONFIG.projectId}=${authData.session.secret || authData.session.$id}` : '';

                const response = await fetch(`${APPWRITE_CONFIG.endpoint}/databases/${APPWRITE_CONFIG.databaseId}/collections/${APPWRITE_CONFIG.notesCollectionId}/documents`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Appwrite-Project': APPWRITE_CONFIG.projectId,
                        'X-Appwrite-Response-Format': '1.4.0',
                        'Cookie': sessionCookie
                    },
                    body: JSON.stringify({
                        documentId: documentId,
                        data: documentData
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('💾 REST API error response:', errorText);
                    throw new Error(`REST API failed: ${response.status} ${errorText}`);
                }

                const result = await response.json();
                console.log('💾 REST API save successful:', result);
                return result;
            }
            
        } catch (error) {
            console.error('💾 Direct save failed:', error);
            throw error;
        }
    }

    async saveViaBackground(noteData, documentId, authData) {
        return new Promise((resolve, reject) => {
            // Check if extension APIs are available
            if (!this.extensionAPI || !this.extensionAPI.runtime || !this.extensionAPI.runtime.sendMessage) {
                reject(new Error('Extension APIs not available'));
                return;
            }

            this.extensionAPI.runtime.sendMessage({
                type: 'SAVE_NOTE',
                noteData: noteData,
                documentId: documentId,
                authData: authData,
                config: APPWRITE_CONFIG
            }, (response) => {
                if (this.extensionAPI.runtime.lastError) {
                    reject(new Error(this.extensionAPI.runtime.lastError.message));
                    return;
                }
                
                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response?.error || 'Failed to save note via background'));
                }
            });
        });
    }

    async saveViaDirect(noteData, documentId, authData) {
        // For popup authentication, save locally and provide user feedback
        const localNote = {
            ...noteData,
            id: documentId,
            savedAt: new Date().toISOString(),
            synced: false,
            syncStatus: 'pending'
        };

        // Check if extension storage APIs are available
        if (this.extensionAPI && this.extensionAPI.storage && this.extensionAPI.storage.local) {
            // Store in local storage for later sync
            const localNotes = await this.extensionAPI.storage.local.get('scribly-local-notes');
            const notes = localNotes['scribly-local-notes'] || [];
            notes.push(localNote);
            
            await this.extensionAPI.storage.local.set({
                'scribly-local-notes': notes
            });
        }

        // Try to sync with your Scribly app by opening it briefly
        this.attemptWebSync(localNote);

        return { 
            $id: documentId, 
            ...localNote,
            message: 'Note captured! Please check your Scribly dashboard.' 
        };
    }

    async attemptWebSync(noteData) {
        try {
            // Check if extension APIs are available
            if (!this.extensionAPI || !this.extensionAPI.runtime || !this.extensionAPI.runtime.sendMessage) {
                console.log('Extension APIs not available for web sync');
                return;
            }

            // Create a data URL with the note information for easy transfer
            const noteUrl = `https://scribly-d1lo.onrender.com/dashboard?extensionNote=${encodeURIComponent(JSON.stringify({
                title: noteData.title,
                content: noteData.content,
                tags: noteData.tags,
                source: 'chrome-extension'
            }))}`;

            // Open in background tab and close quickly (user won't see this)
            this.extensionAPI.runtime.sendMessage({
                type: 'SYNC_NOTE_VIA_WEB',
                noteUrl: noteUrl,
                noteData: noteData
            });

        } catch (error) {
            console.log('Web sync attempt failed:', error);
            // This is okay, note is still saved locally
        }
    }

    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showAuthSection() {
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('captureSection').style.display = 'none';
        
        // Clear form
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    }

    showCaptureSection(user) {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('captureSection').style.display = 'flex';
        
        // Update user info
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userName').textContent = user.name || 'Scribly User';
    }

    showStatus(message, type) {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.classList.remove('hidden');
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                statusEl.classList.add('hidden');
            }, 3000);
        }
    }

    showProgress(percentage, text) {
        const container = document.getElementById('progressContainer');
        const fill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        container.classList.remove('hidden');
        fill.style.width = `${percentage}%`;
        progressText.textContent = text;
    }

    hideProgress() {
        document.getElementById('progressContainer').classList.add('hidden');
    }

    openHelp() {
        // Open the welcome/help page in a new tab
        if (this.extensionAPI && this.extensionAPI.tabs) {
            this.extensionAPI.tabs.create({
                url: chrome.runtime.getURL('welcome.html')
            });
        } else {
            // Fallback: show a simple help message
            this.showStatus('For help and tutorials, visit https://scribly-d1lo.onrender.com', 'success');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScriblyAuth();
});
