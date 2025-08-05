// Background service worker for Scribly Chrome/Edge Extension
// Handles background tasks, message passing, and extension lifecycle

class ScriblyBackground {
    constructor() {
        // Detect browser type for compatibility
        this.browserType = this.detectBrowser();
        this.init();
    }

    detectBrowser() {
        // Detect if running on Edge or Chrome
        const userAgent = navigator.userAgent || '';
        const isEdge = userAgent.includes('Edg/');
        const isChrome = userAgent.includes('Chrome/') && !isEdge;
        
        return {
            isEdge: isEdge,
            isChrome: isChrome,
            name: isEdge ? 'Edge' : (isChrome ? 'Chrome' : 'Unknown')
        };
    }

    init() {
        // Listen for extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstall(details);
        });

        // Listen for messages from popup and content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        // Listen for tab updates to potentially capture content
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });

        // Handle extension icon click
        chrome.action.onClicked.addListener((tab) => {
            this.handleIconClick(tab);
        });

        console.log('Scribly OCR Extension background script initialized');
        console.log('Browser detected:', this.browserType.name);
    }

    handleInstall(details) {
        if (details.reason === 'install') {
            console.log('Scribly OCR Extension installed');
            
            // Set default settings
            chrome.storage.local.set({
                'scribly-settings': {
                    autoCapture: false,
                    ocrLanguage: 'eng',
                    defaultTags: ['ocr-capture'],
                    notificationEnabled: true
                }
            });

            // Open welcome/setup page
            chrome.tabs.create({
                url: chrome.runtime.getURL('welcome.html')
            });
        } else if (details.reason === 'update') {
            console.log('Scribly OCR Extension updated');
        }
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.type) {
                case 'AUTHENTICATE_USER':
                    const authResult = await this.authenticateUser(message.email, message.password, message.config);
                    sendResponse({ success: true, data: authResult });
                    break;

                case 'AUTHENTICATE_VIA_POPUP':
                    const popupAuthResult = await this.authenticateViaPopup(message.email, message.password, message.loginUrl);
                    sendResponse(popupAuthResult);
                    break;

                case 'OPEN_WEB_AUTH':
                    await this.openWebAuth(message.email, message.authUrl);
                    sendResponse({ success: true });
                    break;

                case 'SAVE_NOTE':
                    const saveResult = await this.saveNote(message.noteData, message.documentId, message.authData, message.config);
                    sendResponse({ success: true, data: saveResult });
                    break;

                case 'SYNC_NOTE_VIA_WEB':
                    this.syncNoteViaWeb(message.noteUrl, message.noteData);
                    sendResponse({ success: true });
                    break;

                case 'CAPTURE_SCREEN':
                    try {
                        const screenshot = await this.captureScreenshot(message.tabId);
                        sendResponse({ success: true, imageDataUrl: screenshot });
                    } catch (error) {
                        console.error('Background screenshot error:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                case 'GET_TAB_INFO':
                    const tabInfo = await this.getActiveTabInfo();
                    sendResponse({ success: true, data: tabInfo });
                    break;

                case 'SAVE_AUTH_TOKEN':
                    await this.saveAuthToken(message.token);
                    sendResponse({ success: true });
                    break;

                case 'GET_AUTH_TOKEN':
                    const token = await this.getAuthToken();
                    sendResponse({ success: true, data: token });
                    break;

                case 'CLEAR_AUTH':
                    await this.clearAuth();
                    sendResponse({ success: true });
                    break;

                case 'LOG_ERROR':
                    console.error('Extension Error:', message.error);
                    this.logError(message.error, message.context);
                    sendResponse({ success: true });
                    break;

                case 'SHOW_NOTIFICATION':
                    this.showNotification(message.title, message.message, message.type);
                    sendResponse({ success: true });
                    break;

                default:
                    console.warn('Unknown message type:', message.type);
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Background script error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async authenticateUser(email, password, config) {
        try {
            // Use fetch to bypass CORS issues
            const response = await fetch(`${config.endpoint}/account/sessions/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': config.projectId,
                    'X-Appwrite-Response-Format': '1.4.0',
                    'Origin': config.endpoint
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Authentication failed');
            }

            const session = await response.json();

            // Get user details
            const userResponse = await fetch(`${config.endpoint}/account`, {
                method: 'GET',
                headers: {
                    'X-Appwrite-Project': config.projectId,
                    'X-Appwrite-Response-Format': '1.4.0',
                    'Cookie': `a_session_${config.projectId}=${session.secret}`
                }
            });

            if (!userResponse.ok) {
                throw new Error('Failed to get user details');
            }

            const user = await userResponse.json();

            return {
                session: session,
                user: user
            };

        } catch (error) {
            console.error('Background authentication failed:', error);
            throw error;
        }
    }

    async saveNote(noteData, documentId, authData, config) {
        try {
            const sessionCookie = authData.session ? 
                `a_session_${config.projectId}=${authData.session.secret || authData.session.$id}` : '';

            const response = await fetch(`${config.endpoint}/databases/${config.databaseId}/collections/${config.notesCollectionId}/documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': config.projectId,
                    'X-Appwrite-Response-Format': '1.4.0',
                    'Cookie': sessionCookie
                },
                body: JSON.stringify({
                    documentId: documentId,
                    data: noteData
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save note');
            }

            return await response.json();

        } catch (error) {
            console.error('Background save note failed:', error);
            throw error;
        }
    }

    async authenticateViaPopup(email, password, loginUrl) {
        return new Promise((resolve, reject) => {
            try {
                // Create a new tab for authentication
                chrome.tabs.create({ url: loginUrl }, (tab) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }

                    const authTabId = tab.id;
                    let resolved = false;

                    const checkInterval = setInterval(() => {
                        chrome.tabs.get(authTabId, (updatedTab) => {
                            if (chrome.runtime.lastError) {
                                if (!resolved) {
                                    clearInterval(checkInterval);
                                    resolved = true;
                                    reject(new Error('Authentication tab was closed'));
                                }
                                return;
                            }

                            // Check if user has navigated to dashboard (successful login)
                            if (updatedTab.url && updatedTab.url.includes('/dashboard')) {
                                if (!resolved) {
                                    clearInterval(checkInterval);
                                    resolved = true;
                                    
                                    // Close the auth tab
                                    chrome.tabs.remove(authTabId);
                                    
                                    // Return success with user info
                                    resolve({
                                        success: true,
                                        user: { 
                                            email: email, 
                                            name: 'Scribly User',
                                            $id: 'ext_user_' + Date.now() // Temporary ID for extension
                                        },
                                        message: 'Authenticated via popup',
                                        timestamp: Date.now()
                                    });
                                }
                            }
                        });
                    }, 1000);

                    // Timeout after 3 minutes
                    setTimeout(() => {
                        if (!resolved) {
                            clearInterval(checkInterval);
                            resolved = true;
                            chrome.tabs.remove(authTabId);
                            reject(new Error('Authentication timeout. Please try again.'));
                        }
                    }, 180000);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    async openWebAuth(email, authUrl) {
        try {
            // Open the web authentication URL in a new tab
            const tab = await chrome.tabs.create({ 
                url: authUrl,
                active: true 
            });
            
            console.log('Opened web authentication tab:', tab.id);
            return { success: true, tabId: tab.id };
        } catch (error) {
            console.error('Failed to open web auth:', error);
            throw error;
        }
    }

    syncNoteViaWeb(noteUrl, noteData) {
        try {
            // Create a background tab briefly to sync the note
            chrome.tabs.create({ url: noteUrl, active: false }, (tab) => {
                // Close the tab after a few seconds
                setTimeout(() => {
                    if (tab && tab.id) {
                        chrome.tabs.remove(tab.id);
                    }
                }, 3000);
            });
        } catch (error) {
            console.log('Web sync failed:', error);
        }
    }

    handleTabUpdate(tabId, changeInfo, tab) {
        // Optional: Auto-capture when page loads (if enabled in settings)
        if (changeInfo.status === 'complete' && tab.url) {
            this.checkAutoCapture(tab);
        }
    }

    handleIconClick(tab) {
        // Open popup (this is handled automatically by manifest)
        console.log('Extension icon clicked on tab:', tab.url);
    }

    async captureScreenshot(tabId = null) {
        try {
            console.log('📸 Background: Starting screenshot capture...');
            let targetTabId = tabId;
            
            if (!targetTabId) {
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                targetTabId = tabs[0]?.id;
                console.log('📸 Background: Found active tab:', targetTabId);
            }

            if (!targetTabId) {
                throw new Error('No active tab found');
            }

            // Ensure we have permission to capture this tab
            try {
                await chrome.tabs.get(targetTabId);
            } catch (tabError) {
                throw new Error(`Cannot access tab: ${tabError.message}`);
            }

            // Capture the visible area of the tab
            console.log('📸 Background: Attempting captureVisibleTab...');
            const dataUrl = await chrome.tabs.captureVisibleTab(null, {
                format: 'png',
                quality: 95
            });

            if (!dataUrl) {
                throw new Error('captureVisibleTab returned empty result');
            }

            console.log('📸 Background: Screenshot captured, size:', dataUrl.length);
            return dataUrl;
            
        } catch (error) {
            console.error('📸 Background: Screenshot capture failed:', error);
            
            // Provide more specific error messages
            if (error.message.includes('Permission')) {
                throw new Error('Extension lacks permission to capture screenshots. Please reload the extension and try again.');
            } else if (error.message.includes('tab')) {
                throw new Error('Cannot access the current tab. Please ensure the extension is allowed on this page.');
            } else {
                throw new Error(`Screenshot capture failed: ${error.message}`);
            }
        }
    }

    async getActiveTabInfo() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];

            if (!tab) {
                throw new Error('No active tab found');
            }

            return {
                id: tab.id,
                url: tab.url,
                title: tab.title,
                favIconUrl: tab.favIconUrl,
                windowId: tab.windowId
            };
        } catch (error) {
            console.error('Failed to get tab info:', error);
            throw error;
        }
    }

    async saveAuthToken(token) {
        try {
            await chrome.storage.secure.set({
                'scribly-auth-token': token
            });
        } catch (error) {
            // Fallback to regular storage if secure storage is not available
            await chrome.storage.local.set({
                'scribly-auth-token': token
            });
        }
    }

    async getAuthToken() {
        try {
            let result = await chrome.storage.secure.get('scribly-auth-token');
            
            if (!result['scribly-auth-token']) {
                // Fallback to regular storage
                result = await chrome.storage.local.get('scribly-auth-token');
            }
            
            return result['scribly-auth-token'] || null;
        } catch (error) {
            console.error('Failed to get auth token:', error);
            return null;
        }
    }

    async clearAuth() {
        try {
            await chrome.storage.secure.remove('scribly-auth-token');
            await chrome.storage.local.remove('scribly-auth-token');
        } catch (error) {
            console.error('Failed to clear auth:', error);
        }
    }

    async checkAutoCapture(tab) {
        try {
            const settings = await chrome.storage.local.get('scribly-settings');
            const config = settings['scribly-settings'] || {};

            if (config.autoCapture && this.shouldAutoCapture(tab.url)) {
                // Send message to content script to trigger auto-capture
                chrome.tabs.sendMessage(tab.id, {
                    type: 'AUTO_CAPTURE_TRIGGER',
                    url: tab.url,
                    title: tab.title
                });
            }
        } catch (error) {
            console.error('Auto-capture check failed:', error);
        }
    }

    shouldAutoCapture(url) {
        // Define rules for auto-capture
        const autoCaptureDomains = [
            'docs.google.com',
            'notion.so',
            'confluence.',
            'jira.',
            'github.com'
        ];

        try {
            const urlObj = new URL(url);
            return autoCaptureDomains.some(domain => 
                urlObj.hostname.includes(domain)
            );
        } catch (error) {
            return false;
        }
    }

    showNotification(title, message, type = 'basic') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title || 'Scribly OCR',
            message: message || 'Operation completed',
            priority: type === 'error' ? 2 : 1
        });
    }

    logError(error, context = {}) {
        // Log error with context for debugging
        console.error('Scribly Extension Error:', {
            error: error,
            context: context,
            timestamp: new Date().toISOString(),
            url: context.url || 'unknown',
            userAgent: navigator.userAgent
        });

        // Optionally send to analytics or error reporting service
        // this.sendErrorReport(error, context);
    }

    async sendErrorReport(error, context) {
        // Optional: Send error reports to your analytics service
        try {
            // Implement error reporting to your preferred service
            console.log('Error report would be sent:', { error, context });
        } catch (reportError) {
            console.error('Failed to send error report:', reportError);
        }
    }
}

// Initialize background script
new ScriblyBackground();
