// Aggressive Tesseract.js configuration override
// This script must run BEFORE tesseract.js is loaded to properly override the worker paths

(function() {
    'use strict';
    
    console.log('🔧 Tesseract Override Script Loading...');
    
    // Get extension URL for local resources
    const extensionURL = chrome.runtime.getURL('');
    console.log('🔧 Extension URL:', extensionURL);
    
    // Define paths to local resources
    const localPaths = {
        workerPath: chrome.runtime.getURL('tesseract/worker.min.js'),
        corePath: chrome.runtime.getURL('tesseract/tesseract-core.wasm.js'),
        langPath: chrome.runtime.getURL('tesseract/')
    };
    
    console.log('🔧 Local paths configured:', localPaths);
    
    // Store global configuration
    window.TESSERACT_CONFIG = localPaths;
    
    // Override fetch to intercept CDN requests and redirect to local files
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        // Check if this is a Tesseract CDN request
        if (typeof url === 'string') {
            if (url.includes('cdn.jsdelivr.net') || url.includes('unpkg.com') || url.includes('cdnjs.cloudflare.com')) {
                if (url.includes('tesseract') || url.includes('worker') || url.includes('wasm')) {
                    console.log('🚫 Intercepted CDN request:', url);
                    
                    // Map CDN URLs to local files
                    if (url.includes('worker.min.js') || url.includes('worker.js')) {
                        console.log('🔄 Redirecting worker to local:', localPaths.workerPath);
                        return originalFetch.call(this, localPaths.workerPath, options);
                    }
                    if (url.includes('tesseract-core.wasm') || url.includes('core.wasm')) {
                        console.log('🔄 Redirecting core to local:', localPaths.corePath);
                        return originalFetch.call(this, localPaths.corePath, options);
                    }
                    if (url.includes('.traineddata')) {
                        const filename = url.split('/').pop();
                        const localLangPath = localPaths.langPath + filename;
                        console.log('🔄 Redirecting language data to local:', localLangPath);
                        return originalFetch.call(this, localLangPath, options);
                    }
                    
                    // Block any unrecognized CDN requests
                    console.log('🚫 Blocking unrecognized CDN request:', url);
                    return Promise.reject(new Error('CDN requests blocked - use local files'));
                }
            }
        }
        
        // Default behavior for non-Tesseract requests
        return originalFetch.call(this, url, options);
    };
    
    // Override XMLHttpRequest as well for complete coverage
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        if (typeof url === 'string') {
            if (url.includes('cdn.jsdelivr.net') || url.includes('unpkg.com') || url.includes('cdnjs.cloudflare.com')) {
                if (url.includes('tesseract') || url.includes('worker') || url.includes('wasm')) {
                    console.log('🚫 Intercepted XHR CDN request:', url);
                    
                    // Map CDN URLs to local files
                    if (url.includes('worker.min.js') || url.includes('worker.js')) {
                        console.log('🔄 Redirecting XHR worker to local:', localPaths.workerPath);
                        url = localPaths.workerPath;
                    } else if (url.includes('tesseract-core.wasm') || url.includes('core.wasm')) {
                        console.log('🔄 Redirecting XHR core to local:', localPaths.corePath);
                        url = localPaths.corePath;
                    } else if (url.includes('.traineddata')) {
                        const filename = url.split('/').pop();
                        const localLangPath = localPaths.langPath + filename;
                        console.log('🔄 Redirecting XHR language data to local:', localLangPath);
                        url = localLangPath;
                    } else {
                        console.log('🚫 Blocking unrecognized XHR CDN request:', url);
                        throw new Error('CDN requests blocked - use local files');
                    }
                }
            }
        }
        
        return originalXHROpen.call(this, method, url, ...args);
    };
    
    // Set up a global configuration object that Tesseract can use
    window.TesseractJSConfig = {
        workerPath: localPaths.workerPath,
        corePath: localPaths.corePath,
        langPath: localPaths.langPath,
        workerBlobURL: false
    };
    
    // Wait for Tesseract to load and then override its configuration
    let tesseractCheckInterval = setInterval(() => {
        if (typeof window.Tesseract !== 'undefined') {
            console.log('🔧 Tesseract detected, applying aggressive configuration...');
            
            // Override the default workerOptions
            window.Tesseract.workerOptions = {
                ...localPaths,
                workerBlobURL: false
            };
            
            // Store original methods
            const originalCreateWorker = window.Tesseract.createWorker;
            const originalRecognize = window.Tesseract.recognize;
            
            // Override the createWorker method to ensure our paths are used
            window.Tesseract.createWorker = function(lang, oem, options = {}) {
                console.log('🔧 CreateWorker called with options:', options);
                
                // Force our local paths and disable any CDN usage
                const forcedOptions = {
                    workerPath: localPaths.workerPath,
                    corePath: localPaths.corePath,
                    langPath: localPaths.langPath,
                    workerBlobURL: false,
                    cachePath: localPaths.langPath,
                    gzip: false,
                    ...options
                };
                
                // Remove any CDN-related options
                delete forcedOptions.cdn;
                delete forcedOptions.jsdelivr;
                
                console.log('🔧 Forced createWorker options:', forcedOptions);
                return originalCreateWorker.call(this, lang, oem, forcedOptions);
            };
            
            // Override the recognize method as well
            window.Tesseract.recognize = function(image, lang, options = {}) {
                console.log('🔧 Recognize called with options:', options);
                
                // Force our local paths and disable any CDN usage
                const forcedOptions = {
                    workerPath: localPaths.workerPath,
                    corePath: localPaths.corePath,
                    langPath: localPaths.langPath,
                    workerBlobURL: false,
                    cachePath: localPaths.langPath,
                    gzip: false,
                    ...options
                };
                
                // Remove any CDN-related options
                delete forcedOptions.cdn;
                delete forcedOptions.jsdelivr;
                
                console.log('🔧 Forced recognize options:', forcedOptions);
                return originalRecognize.call(this, image, lang, forcedOptions);
            };
            
            // Override internal Tesseract configuration
            if (window.Tesseract.PSM) {
                window.Tesseract.PSM.AUTO = 3; // Ensure proper page segmentation
            }
            
            // Override any internal CDN URLs
            if (window.Tesseract.OEM) {
                console.log('🔧 Setting up OEM configuration...');
            }
            
            console.log('🔧 Tesseract configuration override complete!');
            clearInterval(tesseractCheckInterval);
        }
    }, 50); // Check more frequently
    
    // Clear the interval after 10 seconds to avoid infinite checking
    setTimeout(() => {
        clearInterval(tesseractCheckInterval);
    }, 10000);
    
    console.log('🔧 Tesseract Override Script Ready');
})();
