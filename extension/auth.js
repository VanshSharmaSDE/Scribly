// Appwrite authentication utilities for Scribly Chrome/Edge Extension
// Handles secure authentication and session management

class ScriblyAuthManager {
    constructor() {
        this.client = null;
        this.account = null;
        this.databases = null;
        this.currentUser = null;
        this.browserType = this.detectBrowser();
        this.extensionAPI = this.browserType.extensionAPI;
        
        this.initializeAppwrite();
    }

    detectBrowser() {
        // Detect if running on Edge or Chrome
        const userAgent = navigator.userAgent || '';
        const isEdge = userAgent.includes('Edg/');
        const isChrome = userAgent.includes('Chrome/') && !isEdge;
        
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

    initializeAppwrite() {
        // These values now match your actual Scribly app configuration
        const config = {
            endpoint: 'https://nyc.cloud.appwrite.io/v1',
            projectId: '6885d35d002d36e6a497', // Your actual project ID
            databaseId: '68863b770031af9f166c', // Your actual database ID
            notesCollectionId: '68863b8f00211989079a' // Your actual collection ID
        };

        this.client = new Appwrite.Client()
            .setEndpoint(config.endpoint)
            .setProject(config.projectId);

        // Set custom headers for Chrome extension
        this.client.headers = {
            ...this.client.headers,
            'X-Appwrite-Response-Format': '1.4.0',
            'Content-Type': 'application/json'
        };

        this.account = new Appwrite.Account(this.client);
        this.databases = new Appwrite.Databases(this.client);
        this.config = config;
    }

    // Authentication Methods
    async login(email, password) {
        try {
            // Create email session
            const session = await this.account.createEmailSession(email, password);
            
            // Get user details
            const user = await this.account.get();
            this.currentUser = user;

            // Store session securely
            await this.storeSession(session);

            return {
                success: true,
                user: user,
                session: session
            };
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error(this.formatAuthError(error));
        }
    }

    async logout() {
        try {
            await this.account.deleteSession('current');
            await this.clearStoredSession();
            this.currentUser = null;
            
            return { success: true };
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if logout fails, clear local session
            await this.clearStoredSession();
            this.currentUser = null;
            throw new Error('Logout failed');
        }
    }

    async getCurrentUser() {
        try {
            if (this.currentUser) {
                return this.currentUser;
            }

            // Try to get current session
            const user = await this.account.get();
            this.currentUser = user;
            return user;
        } catch (error) {
            // No valid session
            this.currentUser = null;
            return null;
        }
    }

    async isAuthenticated() {
        try {
            const user = await this.getCurrentUser();
            return !!user;
        } catch (error) {
            return false;
        }
    }

    // Session Management
    async storeSession(session) {
        try {
            const sessionData = {
                sessionId: session.$id,
                userId: session.userId,
                expire: session.expire,
                createdAt: Date.now(),
                browser: this.browserType.name
            };

            // Use session storage if available (newer browsers), otherwise local storage
            if (this.browserType.supportsSessionStorage) {
                await chrome.storage.session.set({
                    'scribly-session': sessionData
                });
            }
            
            // Always store in local storage as backup
            await chrome.storage.local.set({
                'scribly-session': sessionData
            });
        } catch (error) {
            console.error('Failed to store session:', error);
            // Fallback for older browser versions
            try {
                await chrome.storage.local.set({
                    'scribly-session': {
                        sessionId: session.$id,
                        userId: session.userId,
                        expire: session.expire,
                        createdAt: Date.now(),
                        browser: this.browserType.name
                    }
                });
            } catch (fallbackError) {
                console.error('Fallback session storage also failed:', fallbackError);
            }
        }
    }

    async getStoredSession() {
        try {
            let result = null;
            
            // Try session storage first (if available)
            if (this.browserType.supportsSessionStorage) {
                try {
                    result = await chrome.storage.session.get('scribly-session');
                } catch (e) {
                    console.log('Session storage not available, using local storage');
                }
            }
            
            // Fall back to local storage
            if (!result || !result['scribly-session']) {
                result = await chrome.storage.local.get('scribly-session');
            }

            const sessionData = result['scribly-session'];
            
            if (!sessionData) {
                return null;
            }

            // Check if session is expired
            if (sessionData.expire && new Date(sessionData.expire) < new Date()) {
                await this.clearStoredSession();
                return null;
            }

            return sessionData;
        } catch (error) {
            console.error('Failed to get stored session:', error);
            return null;
        }
    }

    async clearStoredSession() {
        try {
            // Clear from both session and local storage
            if (this.browserType.supportsSessionStorage) {
                try {
                    await chrome.storage.session.remove('scribly-session');
                } catch (e) {
                    console.log('Session storage clear failed, continuing...');
                }
            }
            await chrome.storage.local.remove('scribly-session');
        } catch (error) {
            console.error('Failed to clear stored session:', error);
        }
    }

    // Database Operations
    async saveNote(noteData) {
        try {
            if (!await this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            // Ensure required fields are present
            const requiredFields = ['title', 'content'];
            for (const field of requiredFields) {
                if (!noteData[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // Add metadata
            const enrichedNoteData = {
                ...noteData,
                userId: this.currentUser.$id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                source: 'chrome-extension-ocr',
                isShared: false,
                isFavorite: false
            };

            // Generate unique document ID
            const documentId = this.generateDocumentId();

            // Save to Appwrite
            const document = await this.databases.createDocument(
                this.config.databaseId,
                this.config.notesCollectionId,
                documentId,
                enrichedNoteData
            );

            return {
                success: true,
                document: document
            };
        } catch (error) {
            console.error('Failed to save note:', error);
            throw new Error(`Failed to save note: ${error.message}`);
        }
    }

    async getUserNotes(limit = 10, offset = 0) {
        try {
            if (!await this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const response = await this.databases.listDocuments(
                this.config.databaseId,
                this.config.notesCollectionId,
                [
                    Appwrite.Query.equal('userId', this.currentUser.$id),
                    Appwrite.Query.orderDesc('createdAt'),
                    Appwrite.Query.limit(limit),
                    Appwrite.Query.offset(offset)
                ]
            );

            return {
                success: true,
                notes: response.documents,
                total: response.total
            };
        } catch (error) {
            console.error('Failed to get user notes:', error);
            throw new Error(`Failed to get notes: ${error.message}`);
        }
    }

    // Utility Methods
    generateDocumentId() {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substr(2, 9);
        return `${timestamp}_${randomStr}`;
    }

    formatAuthError(error) {
        const errorMessages = {
            'user_not_found': 'No account found with this email address',
            'user_invalid_credentials': 'Invalid email or password',
            'user_blocked': 'Account has been blocked',
            'user_invalid_token': 'Invalid or expired token',
            'general_rate_limit_exceeded': 'Too many attempts. Please try again later',
            'user_password_mismatch': 'Invalid password',
            'user_email_not_whitelisted': 'Email not authorized'
        };

        const errorCode = error.code || error.type;
        return errorMessages[errorCode] || error.message || 'Authentication failed';
    }

    // Configuration Methods
    async updateConfig(newConfig) {
        try {
            this.config = { ...this.config, ...newConfig };
            
            // Reinitialize Appwrite client with new config
            this.client
                .setEndpoint(this.config.endpoint)
                .setProject(this.config.projectId);

            // Store updated config
            await chrome.storage.local.set({
                'scribly-config': this.config
            });

            return { success: true };
        } catch (error) {
            console.error('Failed to update config:', error);
            throw new Error('Failed to update configuration');
        }
    }

    async loadConfig() {
        try {
            const result = await chrome.storage.local.get('scribly-config');
            const storedConfig = result['scribly-config'];

            if (storedConfig) {
                this.config = { ...this.config, ...storedConfig };
                this.initializeAppwrite();
            }

            return this.config;
        } catch (error) {
            console.error('Failed to load config:', error);
            return this.config;
        }
    }

    // Health Check
    async testConnection() {
        try {
            // Test if we can reach Appwrite
            const health = await fetch(`${this.config.endpoint}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!health.ok) {
                throw new Error('Appwrite server unreachable');
            }

            return { success: true, status: 'Connected' };
        } catch (error) {
            console.error('Connection test failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export for use in other extension files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScriblyAuthManager;
} else if (typeof window !== 'undefined') {
    window.ScriblyAuthManager = ScriblyAuthManager;
}
