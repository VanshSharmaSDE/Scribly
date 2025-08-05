// Tesseract Configuration Script
// This script MUST run before tesseract.js loads to override default paths

console.log('🔧 Starting Tesseract configuration...');

// Get extension URLs immediately
const EXTENSION_URL = chrome.runtime.getURL('');
const WORKER_PATH = chrome.runtime.getURL('tesseract/worker.min.js');
const CORE_PATH = chrome.runtime.getURL('tesseract/tesseract-core.wasm.js');
const LANG_PATH = chrome.runtime.getURL('tesseract/');

console.log('🔧 Extension URL:', EXTENSION_URL);
console.log('🔧 Worker Path:', WORKER_PATH);
console.log('🔧 Core Path:', CORE_PATH);
console.log('🔧 Lang Path:', LANG_PATH);

// Override global configuration BEFORE Tesseract loads
window.TesseractWorkerPath = WORKER_PATH;
window.TesseractCorePath = CORE_PATH;
window.TesseractLangPath = LANG_PATH;

// Create global config object
window.TESSERACT_CONFIG = {
    workerPath: WORKER_PATH,
    corePath: CORE_PATH,
    langPath: LANG_PATH
};

// Override any potential default configurations
if (typeof window !== 'undefined') {
    // Prepare Tesseract namespace
    window.Tesseract = window.Tesseract || {};
    
    // Set worker options globally
    window.Tesseract.workerOptions = {
        workerPath: WORKER_PATH,
        corePath: CORE_PATH,
        langPath: LANG_PATH,
        workerBlobURL: false // Force use of workerPath instead of blob
    };
    
    // Override default options if they exist
    window.Tesseract.defaultOptions = {
        langPath: LANG_PATH,
        workerPath: WORKER_PATH,
        corePath: CORE_PATH,
        workerBlobURL: false
    };
}

// Test file accessibility immediately
async function testTesseractFiles() {
    try {
        console.log('🧪 Testing Tesseract file accessibility...');
        
        const workerResponse = await fetch(WORKER_PATH);
        const coreResponse = await fetch(CORE_PATH);
        const langResponse = await fetch(LANG_PATH + 'eng.traineddata');
        
        console.log('🧪 Worker file accessible:', workerResponse.ok, workerResponse.status);
        console.log('🧪 Core file accessible:', coreResponse.ok, coreResponse.status);
        console.log('🧪 Language data accessible:', langResponse.ok, langResponse.status);
        
        if (workerResponse.ok && coreResponse.ok && langResponse.ok) {
            console.log('✅ All Tesseract files are accessible');
            window.TESSERACT_FILES_READY = true;
        } else {
            console.error('❌ Some Tesseract files are not accessible');
            window.TESSERACT_FILES_READY = false;
        }
    } catch (error) {
        console.error('❌ Tesseract file test failed:', error);
        window.TESSERACT_FILES_READY = false;
    }
}

// Run test immediately
testTesseractFiles();

console.log('✅ Tesseract configuration completed successfully');
