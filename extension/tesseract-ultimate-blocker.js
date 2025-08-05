// Ultimate Tesseract.js CDN Blocker
// This script completely blocks all CDN access and forces local file usage

(function() {
    'use strict';
    
    // Store statistics for debugging
    const blockerStats = {
        blockedRequests: [],
        overrideAttempts: 0,
        isActive: true
    };
    
    // Expose blocker globally for testing
    window.ultimateCDNBlocker = blockerStats;
    
    console.log('🛡️ Ultimate Tesseract CDN Blocker Loading...');
    
    // Get extension URL for local resources
    const extensionURL = chrome.runtime.getURL('');
    console.log('🛡️ Extension URL:', extensionURL);
    
    // Define paths to local resources
    const localPaths = {
        workerPath: chrome.runtime.getURL('tesseract/worker.min.js'),
        corePath: chrome.runtime.getURL('tesseract/tesseract-core.wasm.js'),
        langPath: chrome.runtime.getURL('tesseract/'),
        
        // Alternative patterns that might be used
        'worker.min.js': chrome.runtime.getURL('tesseract/worker.min.js'),
        'worker.js': chrome.runtime.getURL('tesseract/worker.min.js'),
        'tesseract-core.wasm.js': chrome.runtime.getURL('tesseract/tesseract-core.wasm.js'),
        'tesseract-core.wasm': chrome.runtime.getURL('tesseract/tesseract-core.wasm.js'),
        'eng.traineddata': chrome.runtime.getURL('tesseract/eng.traineddata')
    };
    
    console.log('🛡️ Local paths configured:', localPaths);
    
    // Store configuration globally
    window.TESSERACT_CONFIG = localPaths;
    window.TESSERACT_FORCE_LOCAL = true;
    
    // Block ALL CDN requests by overriding URL constructor
    const originalURL = window.URL;
    window.URL = function(url, base) {
        const originalResult = new originalURL(url, base);
        
        if (typeof url === 'string') {
            // Block any tesseract-related CDN URLs
            if ((url.includes('cdn.jsdelivr.net') || url.includes('unpkg.com')) && 
                (url.includes('tesseract') || url.includes('worker'))) {
                console.log('🚫 BLOCKED URL Constructor CDN request:', url);
                blockerStats.blockedRequests.push(`URL Constructor: ${url}`);
                
                // Return a local URL instead
                if (url.includes('worker')) {
                    return new originalURL(localPaths.workerPath);
                }
                if (url.includes('tesseract-core.wasm')) {
                    return new originalURL(localPaths.corePath);
                }
                
                // For other cases, still return the local worker
                return new originalURL(localPaths.workerPath);
            }
        }
        return originalResult;
    };
    
    // Copy static methods
    Object.setPrototypeOf(window.URL, originalURL);
    Object.assign(window.URL, originalURL);
    
    // Override Worker constructor to intercept worker creation
    const OriginalWorker = window.Worker;
    window.Worker = function(scriptURL, options) {
        console.log('🔧 Worker constructor called with:', scriptURL);
        
        let finalURL = scriptURL;
        
        if (typeof scriptURL === 'string') {
            // Check if this is a tesseract-related worker
            if (scriptURL.includes('tesseract') || scriptURL.includes('worker')) {
                if (scriptURL.includes('cdn.jsdelivr.net') || scriptURL.includes('unpkg.com')) {
                    console.log('🔄 Redirecting worker to local:', localPaths.workerPath);
                    finalURL = localPaths.workerPath;
                } else if (!scriptURL.startsWith('blob:') && !scriptURL.startsWith(extensionURL)) {
                    // Any other external worker, redirect to local
                    console.log('🔄 Redirecting external worker to local:', localPaths.workerPath);
                    finalURL = localPaths.workerPath;
                }
            }
        }
        
        console.log('🔧 Creating worker with final URL:', finalURL);
        return new OriginalWorker(finalURL, options);
    };
    
    // Override importScripts for workers
    if (typeof importScripts !== 'undefined') {
        const originalImportScripts = importScripts;
        importScripts = function(...urls) {
            const localUrls = urls.map(url => {
                if (typeof url === 'string' && (url.includes('cdn.jsdelivr.net') || url.includes('unpkg.com'))) {
                    console.log('🚫 BLOCKED importScripts CDN request:', url);
                    if (url.includes('worker.min.js')) {
                        return localPaths.workerPath;
                    }
                    if (url.includes('tesseract-core.wasm')) {
                        return localPaths.corePath;
                    }
                    // Block unknown CDN scripts
                    throw new Error(`CDN script blocked: ${url}`);
                }
                return url;
            });
            return originalImportScripts.apply(this, localUrls);
        };
    }
    
    // Override fetch more aggressively
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
        let url = input;
        if (typeof input === 'object' && input.url) {
            url = input.url;
        }
        
        if (typeof url === 'string') {
            // Block any CDN requests completely
            if (url.includes('cdn.jsdelivr.net') || url.includes('unpkg.com') || url.includes('cdnjs.cloudflare.com')) {
                if (url.includes('tesseract') || url.includes('worker') || url.includes('wasm')) {
                    console.log('🚫 BLOCKED fetch CDN request:', url);
                    blockerStats.blockedRequests.push(`Fetch: ${url}`);
                    
                    // Map to local files
                    if (url.includes('worker.min.js') || url.includes('worker.js')) {
                        console.log('🔄 Redirecting to local worker');
                        return originalFetch.call(this, localPaths.workerPath, init);
                    }
                    if (url.includes('tesseract-core.wasm')) {
                        console.log('🔄 Redirecting to local core');
                        return originalFetch.call(this, localPaths.corePath, init);
                    }
                    if (url.includes('.traineddata')) {
                        const filename = url.split('/').pop();
                        const localLangPath = localPaths.langPath + filename;
                        console.log('🔄 Redirecting to local language data');
                        return originalFetch.call(this, localLangPath, init);
                    }
                    
                    // Reject any other CDN requests
                    return Promise.reject(new Error(`CDN requests are blocked: ${url}`));
                }
            }
        }
        
        return originalFetch.call(this, input, init);
    };
    
    // Override XMLHttpRequest properly
    const OriginalXMLHttpRequest = window.XMLHttpRequest;
    
    window.XMLHttpRequest = function XMLHttpRequest() {
        const xhr = new OriginalXMLHttpRequest();
        const originalOpen = xhr.open;
        
        xhr.open = function(method, url, ...args) {
            if (typeof url === 'string' && (url.includes('cdn.jsdelivr.net') || url.includes('unpkg.com'))) {
                if (url.includes('tesseract') || url.includes('worker') || url.includes('wasm')) {
                    console.log('🚫 BLOCKED XHR CDN request:', url);
                    blockerStats.blockedRequests.push(`XHR: ${url}`);
                    
                    // Map to local files
                    if (url.includes('worker.min.js') || url.includes('worker.js')) {
                        url = localPaths.workerPath;
                    } else if (url.includes('tesseract-core.wasm')) {
                        url = localPaths.corePath;
                    } else if (url.includes('.traineddata')) {
                        const filename = url.split('/').pop();
                        url = localPaths.langPath + filename;
                    } else {
                        throw new Error(`CDN XHR requests are blocked: ${url}`);
                    }
                    
                    console.log('🔄 Redirected XHR to local:', url);
                }
            }
            
            return originalOpen.call(this, method, url, ...args);
        };
        
        return xhr;
    };
    
    // Properly copy static properties
    for (const prop in OriginalXMLHttpRequest) {
        if (OriginalXMLHttpRequest.hasOwnProperty(prop)) {
            try {
                window.XMLHttpRequest[prop] = OriginalXMLHttpRequest[prop];
            } catch (e) {
                // Ignore read-only properties
            }
        }
    }
    
    // Set prototype properly
    window.XMLHttpRequest.prototype = OriginalXMLHttpRequest.prototype;
    
    // Set up Tesseract configuration when library loads
    let tesseractCheckInterval = setInterval(() => {
        if (typeof window.Tesseract !== 'undefined') {
            console.log('🛡️ Tesseract detected, applying ultimate configuration...');
            blockerStats.overrideAttempts++;
            
            // Override ALL possible configuration points
            window.Tesseract.workerOptions = localPaths;
            
            // Override createWorker method
            const originalCreateWorker = window.Tesseract.createWorker;
            if (originalCreateWorker) {
                window.Tesseract.createWorker = function(...args) {
                    console.log('🛡️ Tesseract.createWorker called with:', args);
                    
                    // Force our options into any arguments
                    let options = {};
                    if (args.length > 2 && typeof args[2] === 'object') {
                        options = args[2];
                    } else if (args.length > 1 && typeof args[1] === 'object') {
                        options = args[1];
                        args[1] = 1; // Set OEM to 1
                        args[2] = options;
                    } else {
                        args[2] = options;
                    }
                    
                    // Force local paths
                    Object.assign(options, localPaths, {
                        workerBlobURL: false,
                        gzip: false
                    });
                    
                    console.log('🛡️ Forced createWorker options:', options);
                    return originalCreateWorker.apply(this, args);
                };
            }
            
            // Override recognize method
            const originalRecognize = window.Tesseract.recognize;
            if (originalRecognize) {
                window.Tesseract.recognize = function(image, lang, options = {}) {
                    console.log('🛡️ Tesseract.recognize called');
                    
                    // Force local paths
                    Object.assign(options, localPaths, {
                        workerBlobURL: false,
                        gzip: false
                    });
                    
                    console.log('🛡️ Forced recognize options:', options);
                    return originalRecognize.call(this, image, lang, options);
                };
            }
            
            console.log('🛡️ Ultimate Tesseract configuration complete!');
            clearInterval(tesseractCheckInterval);
        }
    }, 10); // Check every 10ms for immediate capture
    
    // Clear the interval after 10 seconds
    setTimeout(() => {
        clearInterval(tesseractCheckInterval);
    }, 10000);
    
    console.log('🛡️ Ultimate Tesseract CDN Blocker Ready - ALL CDN access blocked!');
})();
