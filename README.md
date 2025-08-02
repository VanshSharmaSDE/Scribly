# 📝 Scribly - Open Source AI-Powered Notes App

> **Transform your thoughts into beautifully organized digital notes with AI-powered features**

Scribly is an open-source notes application that combines stunning design, powerful functionality, and artificial intelligence to revolutionize how you capture, organize, and share your ideas. Built with modern web technologies and driven by community contributions, Scribly offers an unparalleled note-taking experience for professionals, students, and creatives alike.

**🎉 Now Stable v0.5.0 - Ready for Production Use!**

## 🌟 Why Choose Scribly?

- ✨ **Beautiful & Intuitive**: Professional dark theme with smooth animations
- 🧠 **AI-Powered**: Intelligent content generation with Google Gemini integration
- 🔗 **Public Sharing**: Share notes with unique links, no login required
- 📱 **Fully Responsive**: Perfect experience on desktop, tablet, and mobile
- 🚀 **Lightning Fast**: Built with modern React and optimized for speed
- 🎨 **Highly Customizable**: Personalize every aspect of your notes
- 🌍 **Open Source**: MIT licensed, community-driven development
- 🔒 **Privacy-First**: Your data remains yours, transparent and secure

## ✨ Complete Feature Set

### 🎨 **Stunning User Interface**
- **Professional Dark Theme**: Elegant black and red color scheme designed for productivity
- **Smooth Animations**: Powered by Framer Motion for delightful interactions
- **Responsive Design**: Seamless experience across all devices and screen sizes
- **Custom Gradients**: Beautiful animated backgrounds that inspire creativity
- **Modern Typography**: Clean Inter font for optimal readability

### 📝 **Advanced Note Creation & Editing**
- **Rich Text Editor**: Full markdown support with live preview
- **1000+ Emojis**: Express yourself with comprehensive emoji picker and search
- **Smart Formatting**: Quick formatting tools (bold, italic, headers, lists, tables)
- **Custom Styling**: Personalize notes with 12 color themes, multiple fonts, and size options
- **Template System**: Pre-built templates for meetings, projects, research, tutorials, and more
- **Auto-Save**: Never lose your work with intelligent auto-saving
- **Real-time Preview**: See your markdown rendered beautifully as you type

### 🤖 **AI-Powered Intelligence (v0.5.0)**
- **AI Content Generation**: Create comprehensive notes from just a title using Google Gemini
- **Smart Tag Generation**: Automatically generate relevant tags for organization with AI
- **Custom API Key Support**: Use your own Google Gemini API key for AI features
- **Multiple Note Types**: Specialized AI templates for different content types:
  - 📋 Meeting Notes with agendas and action items
  - 🎯 Project Plans with timelines and milestones
  - 🔬 Research Notes with structured findings
  - 📖 Tutorial Guides with step-by-step instructions
  - 💡 Creative Ideas with implementation steps
  - 👤 Personal Reflections and journaling
  - 💼 Business Documents with professional formatting
- **Gemini 2.5 Pro Integration**: Powered by Google's latest AI model
- **Intelligent Fallbacks**: Template-based generation when AI is unavailable
- **Settings Integration**: Easy AI configuration through user settings

### 🏷️ **Smart Organization System**
- **Dynamic Tagging**: Create, edit, and organize with unlimited custom tags
- **AI Tag Suggestions**: Get intelligent tag recommendations based on content
- **Tag-based Filtering**: Quickly find notes by tags with visual indicators
- **Search & Filter**: Powerful search across titles, content, and tags
- **Favorites System**: Star important notes for quick access
- **Grid & List Views**: Choose your preferred visualization style

### 🌐 **Revolutionary Sharing Features**
- **Public Sharing**: Generate unique shareable links for any note
- **Anonymous Access**: Anyone can view shared notes without creating an account
- **Download Support**: Shared notes can be downloaded as beautifully formatted Markdown files
- **Creator Attribution**: Professional sharing pages with author information
- **Expiration Control**: Links automatically expire after 30 days for security
- **Revoke Anytime**: Full control over shared content with instant revocation
- **Share Management**: Visual indicators and comprehensive sharing controls

### 🎨 **Customization & Personalization**
- **12 Color Themes**: Choose from professionally designed color combinations
- **Typography Options**: 10 font families including serif, sans-serif, and monospace
- **Size Controls**: 6 font size options from extra small to huge
- **Custom Styling**: Per-note styling that's preserved across sessions
- **Emoji Selection**: 16 quick-access emojis plus comprehensive emoji picker
- **Layout Preferences**: Customizable grid spacing and card arrangements

### 📱 **User Experience Excellence**
- **Lightning Fast**: Optimized React 18 with Vite for instant loading
- **Skeleton Loaders**: Beautiful loading states that maintain user engagement
- **Error Handling**: Graceful error messages and recovery options
- **Keyboard Shortcuts**: Power user shortcuts for common actions
- **Drag & Drop**: Intuitive file and content management
- **Responsive Navigation**: Mobile-optimized navigation and touch interactions
- **Professional Breadcrumbs**: Clear navigation hierarchy

### 🔐 **Secure Authentication System**
- **Email/Password**: Secure account creation and login
- **Password Recovery**: Easy password reset with email verification
- **Session Management**: Secure session handling with auto-logout
- **User Profiles**: Personalized account management
- **Data Privacy**: Your notes are private and secure by default
- **Open Source Security**: Transparent security through community auditing

### 💾 **Data Management**
- **Cloud Storage**: Powered by Appwrite for reliable data persistence
- **Real-time Sync**: Instant synchronization across all your devices
- **Backup & Recovery**: Automatic backups ensure your data is never lost
- **Export Options**: Download notes in Markdown format with preserved formatting
- **Import Support**: Bring your existing notes from other platforms

## 🚀 **Getting Started in Minutes**

### Quick Start
```bash
# Clone the repository
git clone https://github.com/VanshSharmaSDE/Scribly.git

# Install dependencies
cd Scribly
npm install

# Set up environment variables
cp .env.example .env
# Add your Appwrite and Google Gemini API credentials

# Start development server
npm run dev

# Open in browser
http://localhost:5173
```

### Production Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ **Modern Tech Stack**

### Frontend Excellence
- **React 18**: Latest React with Concurrent Features
- **Vite**: Lightning-fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Production-ready motion library
- **React Router DOM**: Client-side routing
- **Lucide React**: Beautiful SVG icon library

### Backend Power
- **Appwrite**: Open-source backend-as-a-service
- **Google Gemini AI**: Advanced AI content generation (v0.5.0)
- **EmailJS**: Contact form email delivery
- **Real-time Database**: Instant data synchronization
- **Cloud Storage**: Reliable file and data storage
- **Authentication**: Secure user management

### Development Tools
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **PostCSS**: CSS processing and optimization
- **Hot Module Replacement**: Instant development feedback

## 📁 **Professional Project Architecture**

```
scribly/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Button.jsx       # Custom button component
│   │   ├── Navbar.jsx       # Navigation component
│   │   ├── ShareModal.jsx   # Sharing functionality
│   │   ├── TagManager.jsx   # Tag management
│   │   └── ...              # More components
│   ├── pages/               # Page components
│   │   ├── Landing.jsx      # Homepage
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── NoteEdit.jsx     # Note editor
│   │   ├── NoteView.jsx     # Note viewer
│   │   ├── SharedNoteView.jsx # Public sharing
│   │   └── ...              # Auth pages
│   ├── services/            # API services
│   │   ├── notesService.js  # Notes CRUD operations
│   │   ├── aiService.js     # AI functionality
│   │   └── ...              # Other services
│   ├── contexts/            # React contexts
│   ├── utils/               # Utility functions
│   ├── lib/                 # Third-party configurations
│   └── App.jsx              # Main application
├── tailwind.config.js       # Tailwind configuration
├── DATABASE_SETUP.md        # Database setup guide
└── package.json
```

## 🎨 **Design System**

### Color Palette
```css
/* Primary Colors */
--scribly-black: #0a0a0a;     /* Primary background */
--scribly-red: #dc2626;       /* Brand accent */
--scribly-gray: #1a1a1a;      /* Secondary background */

/* Note Colors */
--deep-blue: #1e3a8a;         --forest-green: #166534;
--crimson-red: #dc2626;       --royal-purple: #7c3aed;
--slate-gray: #374151;        --amber-orange: #d97706;
```

### Typography Scale
- **Font Family**: Inter (Google Fonts)
- **Sizes**: 12px, 14px, 16px, 18px, 20px, 24px
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)

## 📊 **Performance Metrics**

- ⚡ **Load Time**: < 1 second initial load
- 🚀 **Build Size**: < 500KB gzipped
- 📱 **Lighthouse Score**: 95+ on all metrics
- 🔄 **Real-time Sync**: < 100ms response time
- 💾 **Auto-save**: Every 2 seconds while typing

## 🌍 **Browser Support**

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- 📱 All modern mobile browsers

## � **Version History**

### 🎉 v0.5.0 - Stable Release (Current)
**AI Integration & Production Ready**
- ✅ **Google Gemini Integration**: Create notes from prompts using AI
- ✅ **Smart Tagging**: Automatic tag generation by title using Gemini
- ✅ **AI Content Generation**: Intelligent content suggestions by Gemini
- ✅ **Custom API Key**: Use your own Google Gemini API key
- ✅ **Enhanced Settings**: Easy API key setup and configuration
- ✅ **Production Ready**: Stable release for production use
- ✅ **Open Source**: MIT licensed, community-driven development

### 🔧 v0.4.2 - Stability & Bug Fixes
- ✅ **Bug Fixes**: Resolved critical issues and improved stability
- ✅ **Performance Improvements**: Enhanced overall application performance
- ✅ **Code Optimization**: Cleaned up and optimized core functionalities
- ✅ **Beta to Stable Transition**: Prepared codebase for stable release

### 🚀 v0.4.0 - Advanced Features & Export
- ✅ **Markdown Export**: Download notes in README/Markdown format
- ✅ **Markdown Support**: Full markdown rendering in notes
- ✅ **Auto-save Feature**: Automatic saving for seamless experience
- ✅ **Enhanced Animations**: Added smooth animations in dashboard and notes
- ✅ **Breadcrumb Navigation**: Easy navigation throughout the application
- ✅ **Starred Feature**: Mark important notes for quick access

### 🎨 v0.3.0 - Rich Note Features
- ✅ **Advanced Toolbar**: Enhanced note editing with rich features
- ✅ **Share Note Feature**: Share notes with custom links and expiration
- ✅ **Background Colors**: Customize note appearance with color themes
- ✅ **Font Customization**: Choose from multiple font styles
- ✅ **Size Customization**: Adjust text size for better readability

### 🎨 v0.2.1 - UI Polish & Fixes
- ✅ **UI Animations**: Added smooth animations throughout the interface
- ✅ **Authentication Fixes**: Resolved bugs in user authentication flow
- ✅ **Authorization Improvements**: Enhanced security and user permissions
- ✅ **Visual Enhancements**: Improved overall user experience

### 🏠 v0.2.0 - Personalized Experience
- ✅ **Personalized Dashboard**: Custom user dashboard with personal notes
- ✅ **Enhanced Security**: Improved data protection and user privacy
- ✅ **Gradient UI**: Beautiful gradient designs throughout the interface
- ✅ **Forgot Password**: Password recovery functionality added

### 🌱 v0.1.0 - Foundation Release
- ✅ **Basic Note-Taking**: Simple and clean note creation and editing
- ✅ **Core UI Development**: Initial user interface design and layout
- ✅ **User Authentication**: Secure user registration and login system
- ✅ **Authorization System**: Role-based access control implementation
- ✅ **Basic Features**: Essential note management functionality

## � **Roadmap & Future Features**

### 🔄 In Development
- [ ] Collaborative editing
- [ ] Note version history
- [ ] Advanced search with filters
- [ ] Bulk operations
- [ ] Enhanced import/export functionality

### 🔮 Future Enhancements
- [ ] Mobile apps (iOS/Android)
- [ ] Offline support with sync
- [ ] Plugin system
- [ ] API for third-party integrations
- [ ] Team workspaces
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Advanced AI features

## 🤝 **Contributing to Open Source**

We welcome contributions from developers worldwide! Here's how you can help:

### 🚀 **Getting Started**
1. **Fork the Repository**: Click the "Fork" button on GitHub
2. **Clone Your Fork**: `git clone https://github.com/YOUR_USERNAME/Scribly.git`
3. **Install Dependencies**: `npm install`
4. **Create a Branch**: `git checkout -b feature/amazing-feature`
5. **Make Changes**: Implement your feature or fix
6. **Test Thoroughly**: Ensure everything works properly
7. **Submit a PR**: Create a Pull Request with a clear description

### 💡 **How to Contribute**
- 🐛 **Bug Reports**: Found a bug? Open an issue with detailed steps to reproduce
- 💻 **Code Contributions**: New features, bug fixes, performance improvements
- 📖 **Documentation**: Help improve our docs and guides
- 🎨 **Design**: UI/UX improvements and design suggestions
- � **Translations**: Help make Scribly available in more languages
- 🧪 **Testing**: Help test new features and report issues

### 📋 **Contribution Guidelines**
- Follow the existing code style and conventions
- Write clear commit messages
- Include tests for new features
- Update documentation as needed
- Be respectful and collaborative in discussions

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support & Contact**

- 📧 **Email**: [scribly.server@gmail.com](mailto:scribly.server@gmail.com)
- � **Bug Reports**: [GitHub Issues](https://github.com/VanshSharmaSDE/Scribly/issues)
- � **Discussions**: [Join the conversation](https://github.com/VanshSharmaSDE/Scribly/discussions)
- ⭐ **Star us on GitHub** if you find Scribly helpful!

---

<div align="center">
  
### 🚀 **Ready to Transform Your Note-Taking?**

**[Try Scribly Now](https://scribly-app.vercel.app) • [GitHub Repository](https://github.com/VanshSharmaSDE/Scribly)**

*Made with ❤️ by the Open Source Community*

**Scribly v0.5.0 - Stable Release**

</div>
