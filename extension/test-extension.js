// Test script to verify extension functionality
console.log('🧪 Extension Test Script Starting...');

// Test 1: Check if our ultimate blocker is working
console.log('🧪 Test 1: Ultimate CDN Blocker Status');
if (window.ultimateCDNBlocker) {
    console.log('✅ Ultimate CDN Blocker loaded and active');
    console.log('🔧 Blocked requests:', window.ultimateCDNBlocker.blockedRequests);
    console.log('🔧 Override attempts:', window.ultimateCDNBlocker.overrideAttempts);
} else {
    console.warn('❌ Ultimate CDN Blocker not found');
}

// Test 2: Check Tesseract configuration
console.log('🧪 Test 2: Tesseract Configuration');
if (window.TESSERACT_CONFIG) {
    console.log('✅ Tesseract config found:', window.TESSERACT_CONFIG);
} else {
    console.warn('❌ Tesseract config not found');
}

// Test 3: Check if Tesseract library is loaded
console.log('🧪 Test 3: Tesseract Library Status');
if (typeof Tesseract !== 'undefined') {
    console.log('✅ Tesseract library loaded');
    console.log('🔧 Worker options:', Tesseract.workerOptions);
} else {
    console.warn('❌ Tesseract library not found');
}

// Test 4: Try to create a worker (this is where CDN failures occur)
console.log('🧪 Test 4: Worker Creation Test');
try {
    if (typeof Tesseract !== 'undefined') {
        const worker = new Worker(chrome.runtime.getURL('tesseract/worker.min.js'));
        console.log('✅ Worker created successfully:', worker);
        worker.terminate(); // Clean up
    } else {
        console.warn('❌ Cannot test worker - Tesseract not available');
    }
} catch (error) {
    console.error('❌ Worker creation failed:', error);
}

// Test 5: Check network request interception
console.log('🧪 Test 5: Network Interception Test');
try {
    fetch('https://cdn.jsdelivr.net/npm/tesseract.js@v4.1.1/dist/worker.min.js')
        .then(response => {
            console.warn('❌ CDN request succeeded (blocker failed):', response);
            console.warn('🔍 Response status:', response.status);
            console.warn('🔍 Response URL:', response.url);
            
            // Check if this is actually a local redirect
            if (response.url.includes('chrome-extension://')) {
                console.log('✅ Actually redirected to local file:', response.url);
            }
        })
        .catch(error => {
            console.log('✅ CDN request blocked successfully:', error.message);
        });
} catch (error) {
    console.log('✅ CDN request intercepted at fetch level:', error.message);
}

// Test 6: Test actual Tesseract worker creation
console.log('🧪 Test 6: Tesseract Worker Creation Test');
if (typeof Tesseract !== 'undefined') {
    try {
        console.log('🔧 Attempting to create Tesseract worker...');
        const worker = Tesseract.createWorker('eng', 1, {
            workerPath: chrome.runtime.getURL('tesseract/worker.min.js'),
            corePath: chrome.runtime.getURL('tesseract/tesseract-core.wasm.js'),
            langPath: chrome.runtime.getURL('tesseract/'),
        });
        console.log('✅ Tesseract worker created:', worker);
    } catch (error) {
        console.error('❌ Tesseract worker creation failed:', error);
        console.error('🔍 Error details:', error.message);
        console.error('🔍 Error stack:', error.stack);
    }
} else {
    console.warn('❌ Tesseract not available for worker test');
}

console.log('🧪 Extension test script completed');
