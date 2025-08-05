# Scribly Chrome/Edge Extension - OCR Capture

This cross-browser extension allows you to capture text from any webpage using OCR (Optical Character Recognition) and save it directly to your Scribly notes.

## 🌐 **Browser Compatibility**

- ✅ **Google Chrome** 88+
- ✅ **Microsoft Edge** 88+ (Chromium-based)
- ✅ **Brave Browser** (Chromium-based)
- ✅ **Other Chromium-based browsers**

## 🚀 Features

- **Smart OCR Capture**: Extract text from any visible webpage content
- **Secure Authentication**: Login with your Scribly account credentials
- **Instant Sync**: Notes are automatically saved to your Scribly dashboard
- **AI-Powered Metadata**: Automatic title and tag generation
- **Minimal Latency**: Uses Tesseract.js for fast, local OCR processing
- **Beautiful UI**: Responsive popup with Scribly's signature design
- **Progressive Processing**: Real-time progress feedback during capture

## 📦 Installation

### Prerequisites
1. Chrome 88+ or Edge 88+ browser
2. Active Scribly account
3. Extension files (pre-configured with your settings)

### Setup Instructions

#### **For Chrome:**
1. Go to `chrome://extensions/` → Enable "Developer mode" → "Load unpacked" → Select extension folder

#### **For Edge:**
1. Go to `edge://extensions/` → Enable "Developer mode" → "Load unpacked" → Select extension folder

📋 **Detailed Guide**: See [BROWSER_INSTALL_GUIDE.md](BROWSER_INSTALL_GUIDE.md) for complete installation instructions

## 🔧 Configuration

### Appwrite Setup
Your Appwrite project is already properly configured with the correct permissions:

1. **Database Collections**: Your notes collection (`68863b8f00211989079a`) includes these attributes:
   - `title` (string, required)
   - `content` (string, required)
   - `tags` (array, optional)
   - `color` (string, optional)
   - `emoji` (string, optional)
   - `fontSize` (string, optional)
   - `fontFamily` (string, optional)
   - `source` (string, optional)
   - `capturedUrl` (string, optional)
   - `capturedTitle` (string, optional)
   - `capturedAt` (datetime, optional)
   - `userId` (string, required)
   - `createdAt` (datetime, required)
   - `updatedAt` (datetime, required)

2. **Permissions**: Ensure authenticated users can:
   - Create documents in the notes collection
   - Read their own documents
   - Update their own documents

## 🎯 Usage

### Basic Capture
1. **Login**: Click the extension icon and login with your Scribly credentials
2. **Capture**: Click "📸 Capture & Extract Text" to capture the current page
3. **Processing**: Watch real-time progress as text is extracted
4. **Sync**: The note is automatically saved to your Scribly dashboard

### Advanced Features
- **Keyboard Shortcut**: Press `Ctrl+Shift+S` to trigger quick capture
- **Auto-Tagging**: The extension automatically generates relevant tags based on content and webpage
- **Smart Titles**: Intelligent title generation from extracted content or page metadata

## 📊 Technical Details

### Architecture
- **Manifest V3**: Modern Chrome extension architecture
- **Tesseract.js**: Local OCR processing for privacy and speed
- **Appwrite SDK**: Secure authentication and database operations
- **Content Scripts**: Enhanced page interaction capabilities

### Performance
- **Local Processing**: OCR runs entirely in the browser
- **Minimal Permissions**: Only requests necessary permissions
- **Efficient Storage**: Secure session management with Chrome storage APIs
- **Error Handling**: Comprehensive error handling and user feedback

### Security
- **Secure Authentication**: Uses Appwrite's built-in security
- **Session Management**: Encrypted session storage
- **Privacy-First**: No data sent to external OCR services
- **HTTPS Only**: All communication over secure connections

## 🐛 Troubleshooting

### Common Issues

1. **CORS Authentication Issues**
   - **Issue**: Extension shows CORS errors when trying to authenticate
   - **Solution**: The extension now includes multiple authentication fallbacks:
     - Background script authentication
     - Popup-based authentication via your Scribly app
     - Local storage with sync capability
   - **Note**: Some CORS limitations are expected in Chrome extensions

2. **Login Failed**
   - Verify your Scribly account credentials are valid
   - Try the popup authentication method (opens Scribly app in new tab)
   - Check that the extension has proper permissions

3. **OCR Not Working**
   - Make sure the page has visible text content
   - Try capturing a different area of the page
   - Check browser console for error messages

3. **Notes Not Syncing**
   - Verify your database permissions in Appwrite
   - Check that the collection ID is correct
   - Ensure you're logged into the same account

### Debug Mode
Enable debug logging by opening browser console:
1. Right-click the extension icon → "Inspect popup"
2. Check console for detailed error messages
3. Look for network requests to Appwrite endpoints

## 📝 Development

### File Structure
```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js             # Main popup functionality
├── background.js        # Background service worker
├── content.js          # Content script for page interaction
├── auth.js            # Authentication utilities
├── icons/            # Extension icons
└── README.md        # This file
```

### Building From Source
1. Clone the repository
2. Update configuration values
3. Add your extension icons
4. Load unpacked in Chrome developer mode

### Contributing
- Follow Chrome extension best practices
- Maintain compatibility with Manifest V3
- Test thoroughly across different websites
- Update documentation for any new features

## 🔗 Integration

This extension seamlessly integrates with your main Scribly application:
- **Shared Database**: Uses the same Appwrite backend
- **Unified Authentication**: Single sign-on with your Scribly account
- **Consistent UI**: Matches Scribly's design language
- **Real-time Sync**: Notes appear instantly in your dashboard

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify your Appwrite configuration
4. Contact Scribly support with detailed error information

---

**Made with ❤️ for the Scribly community**
