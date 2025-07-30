# Scribly - React Notes App

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
Scribly is a modern React-based notes application built with:
- **Frontend**: React 18 with Vite, Tailwind CSS, Framer Motion
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Backend**: Appwrite (to be integrated)

## Design System
- **Primary Colors**: 
  - Scribly Black: #0a0a0a
  - Scribly Red: #dc2626
  - Scribly Gray: #1a1a1a
- **Typography**: Inter font family
- **Theme**: Dark theme with red accents

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services (Appwrite integration)
├── utils/         # Utility functions
└── main.jsx       # Entry point
```

## Key Features
1. **Landing Page**: Animated hero with particle effects
2. **Authentication**: Login/Signup pages (UI ready, Appwrite pending)
3. **Dashboard**: Notes management with grid/list views
4. **Notes**: Support for markdown, emojis, tags, custom styling
5. **Responsive Design**: Mobile-first approach

## Development Guidelines
- Use functional components with hooks
- Implement proper loading states with skeleton components
- Follow Tailwind CSS utility-first approach
- Use Framer Motion for animations
- Ensure accessibility with proper ARIA labels
- Maintain consistent component structure

## Code Patterns
- Props destructuring in component definitions
- Consistent naming: PascalCase for components, camelCase for functions
- Use motion.div for animated elements
- Implement proper error handling
- Use TypeScript-style prop validation when possible

## Future Integrations
- Appwrite authentication
- Real-time note synchronization
- File uploads and attachments
- Collaborative editing
- Export functionality
