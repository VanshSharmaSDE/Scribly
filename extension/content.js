// Content script for Scribly Chrome Extension
// Runs on all web pages to enhance capture functionality

class ScriblyContentScript {
    constructor() {
        this.isInitialized = false;
        this.selectionMode = false;
        this.overlay = null;
        this.selectionBox = null;
        this.startPoint = null;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Listen for messages from popup and background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // Add right-click context menu enhancement
        document.addEventListener('contextmenu', (e) => {
            this.handleContextMenu(e);
        });

        this.isInitialized = true;
        console.log('Scribly content script initialized on:', window.location.href);
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'START_SELECTION_CAPTURE':
                this.startSelectionMode();
                sendResponse({ success: true });
                break;

            case 'AUTO_CAPTURE_TRIGGER':
                this.handleAutoCapture(message);
                sendResponse({ success: true });
                break;

            case 'GET_PAGE_TEXT':
                const pageText = this.extractPageText();
                sendResponse({ success: true, data: pageText });
                break;

            case 'GET_SELECTED_TEXT':
                const selectedText = this.getSelectedText();
                sendResponse({ success: true, data: selectedText });
                break;

            case 'HIGHLIGHT_TEXT':
                this.highlightText(message.text);
                sendResponse({ success: true });
                break;

            case 'SCROLL_TO_TEXT':
                this.scrollToText(message.text);
                sendResponse({ success: true });
                break;

            default:
                sendResponse({ success: false, error: 'Unknown message type' });
        }
    }

    handleKeydown(e) {
        // Ctrl+Shift+S: Quick capture
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            this.triggerQuickCapture();
        }

        // Escape: Exit selection mode
        if (e.key === 'Escape' && this.selectionMode) {
            this.exitSelectionMode();
        }
    }

    handleContextMenu(e) {
        // Store context for potential capture
        this.lastContextElement = e.target;
        this.lastContextPosition = { x: e.clientX, y: e.clientY };
    }

    async triggerQuickCapture() {
        try {
            // Send message to popup to trigger capture
            chrome.runtime.sendMessage({
                type: 'QUICK_CAPTURE_REQUEST',
                url: window.location.href,
                title: document.title
            });
        } catch (error) {
            console.error('Quick capture failed:', error);
        }
    }

    startSelectionMode() {
        if (this.selectionMode) return;

        this.selectionMode = true;
        this.createSelectionOverlay();
        document.body.style.cursor = 'crosshair';
        
        // Add selection event listeners
        document.addEventListener('mousedown', this.onSelectionStart.bind(this));
        document.addEventListener('mousemove', this.onSelectionMove.bind(this));
        document.addEventListener('mouseup', this.onSelectionEnd.bind(this));
    }

    createSelectionOverlay() {
        // Create semi-transparent overlay
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(79, 112, 226, 0.1);
            z-index: 999999;
            pointer-events: none;
        `;

        // Create selection box
        this.selectionBox = document.createElement('div');
        this.selectionBox.style.cssText = `
            position: fixed;
            border: 2px solid #4F70E2;
            background: rgba(79, 112, 226, 0.2);
            z-index: 1000000;
            pointer-events: none;
            display: none;
        `;

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.selectionBox);
    }

    onSelectionStart(e) {
        if (!this.selectionMode) return;
        
        e.preventDefault();
        this.startPoint = { x: e.clientX, y: e.clientY };
        this.selectionBox.style.display = 'block';
        this.updateSelectionBox(e.clientX, e.clientY);
    }

    onSelectionMove(e) {
        if (!this.selectionMode || !this.startPoint) return;
        
        e.preventDefault();
        this.updateSelectionBox(e.clientX, e.clientY);
    }

    onSelectionEnd(e) {
        if (!this.selectionMode || !this.startPoint) return;
        
        e.preventDefault();
        
        // Calculate selection area
        const selection = this.getSelectionArea(e.clientX, e.clientY);
        
        // Capture the selected area
        this.captureSelection(selection);
        
        this.exitSelectionMode();
    }

    updateSelectionBox(currentX, currentY) {
        if (!this.startPoint) return;

        const left = Math.min(this.startPoint.x, currentX);
        const top = Math.min(this.startPoint.y, currentY);
        const width = Math.abs(currentX - this.startPoint.x);
        const height = Math.abs(currentY - this.startPoint.y);

        this.selectionBox.style.left = left + 'px';
        this.selectionBox.style.top = top + 'px';
        this.selectionBox.style.width = width + 'px';
        this.selectionBox.style.height = height + 'px';
    }

    getSelectionArea(endX, endY) {
        if (!this.startPoint) return null;

        return {
            left: Math.min(this.startPoint.x, endX),
            top: Math.min(this.startPoint.y, endY),
            width: Math.abs(endX - this.startPoint.x),
            height: Math.abs(endY - this.startPoint.y)
        };
    }

    async captureSelection(selection) {
        try {
            // Send selection coordinates to background script
            chrome.runtime.sendMessage({
                type: 'CAPTURE_SELECTION',
                selection: selection,
                url: window.location.href,
                title: document.title
            });
        } catch (error) {
            console.error('Selection capture failed:', error);
        }
    }

    exitSelectionMode() {
        this.selectionMode = false;
        this.startPoint = null;
        document.body.style.cursor = '';

        // Remove event listeners
        document.removeEventListener('mousedown', this.onSelectionStart);
        document.removeEventListener('mousemove', this.onSelectionMove);
        document.removeEventListener('mouseup', this.onSelectionEnd);

        // Remove overlay elements
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.selectionBox) {
            this.selectionBox.remove();
            this.selectionBox = null;
        }
    }

    extractPageText() {
        // Extract meaningful text from the page
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, div, span');
        const textContent = [];

        textElements.forEach(element => {
            const text = element.textContent.trim();
            if (text.length > 10 && this.isVisible(element)) {
                textContent.push(text);
            }
        });

        return textContent.join('\n\n');
    }

    getSelectedText() {
        const selection = window.getSelection();
        return selection.toString().trim();
    }

    isVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }

    highlightText(searchText) {
        // Simple text highlighting for debugging/feedback
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            if (textNode.textContent.toLowerCase().includes(searchText.toLowerCase())) {
                const parent = textNode.parentNode;
                if (parent && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE') {
                    parent.style.backgroundColor = 'rgba(79, 112, 226, 0.3)';
                    parent.style.transition = 'background-color 0.3s ease';
                    
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        parent.style.backgroundColor = '';
                    }, 3000);
                }
            }
        });
    }

    scrollToText(searchText) {
        // Find and scroll to specific text
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.toLowerCase().includes(searchText.toLowerCase())) {
                const element = node.parentElement;
                if (element && this.isVisible(element)) {
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    this.highlightText(searchText);
                    break;
                }
            }
        }
    }

    handleAutoCapture(message) {
        // Handle automatic capture triggers
        console.log('Auto-capture triggered for:', message.url);
        
        // Check if page has meaningful content
        const pageText = this.extractPageText();
        if (pageText.length > 100) {
            // Trigger capture after a delay to ensure page is fully loaded
            setTimeout(() => {
                this.triggerQuickCapture();
            }, 2000);
        }
    }

    // Utility method to get page metadata
    getPageMetadata() {
        const metadata = {
            title: document.title,
            url: window.location.href,
            description: '',
            keywords: [],
            author: '',
            publishedDate: '',
            domain: window.location.hostname
        };

        // Extract meta description
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) {
            metadata.description = descriptionMeta.content;
        }

        // Extract keywords
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        if (keywordsMeta) {
            metadata.keywords = keywordsMeta.content.split(',').map(k => k.trim());
        }

        // Extract author
        const authorMeta = document.querySelector('meta[name="author"]');
        if (authorMeta) {
            metadata.author = authorMeta.content;
        }

        // Extract published date
        const dateMeta = document.querySelector('meta[property="article:published_time"]') ||
                        document.querySelector('meta[name="date"]');
        if (dateMeta) {
            metadata.publishedDate = dateMeta.content;
        }

        return metadata;
    }
}

// Initialize content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ScriblyContentScript();
    });
} else {
    new ScriblyContentScript();
}
