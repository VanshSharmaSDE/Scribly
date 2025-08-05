// Welcome page script
function openExtension() {
    // Try to open the extension popup
    if (chrome && chrome.action) {
        chrome.action.openPopup();
    } else {
        // Fallback: show instruction
        alert('Click the Scribly extension icon (📝) in your browser toolbar to start capturing text!');
    }
}

// Add welcome animation
document.addEventListener('DOMContentLoaded', function() {
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.animationDelay = `${index * 0.1}s`;
        feature.style.animation = 'slideUp 0.6s ease-out forwards';
        feature.style.opacity = '0';
    });
    
    // Add event listener for the open extension button
    const openBtn = document.getElementById('openExtensionBtn');
    if (openBtn) {
        openBtn.addEventListener('click', openExtension);
    }
});

// Check if extension is installed and show appropriate message
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    console.log('Scribly Extension is properly installed!');
} else {
    console.log('Welcome page loaded outside of extension context');
}
