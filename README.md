# 🎯 FOCUS - Advanced Time Management & Procrastination Solution

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-purple?style=for-the-badge&logo=vercel)](https://time-management-app-theta.vercel.app)

A comprehensive, AI-powered productivity platform designed to help users overcome procrastination, manage time effectively, and boost overall productivity through intelligent tracking, task management, and personalized insights.

![Focus App Demo](Focus%20App%20Demo.mp4)

## 🌟 Features Overview

### 🚀 Core Productivity Features
- **Intelligent Task Management** - Priority-based task organization with completion tracking
- **Pomodoro Timer** - Customizable focus sessions with break reminders
- **AI-Powered Solutions** - Get personalized productivity advice using Google's Gemini AI
- **Activity Tracking** - Real-time monitoring of website usage and digital habits
- **Social Media Monitoring** - Track and limit time spent on social platforms
- **Smart Reminders** - Automated task notifications and deadline alerts
- **Progress Analytics** - Detailed insights and productivity statistics

### 🎨 User Experience
- **Modern UI/UX** - Beautiful, responsive design with dark theme
- **Mobile-First** - Optimized for all device sizes
- **Real-time Updates** - Live synchronization across devices
- **Offline Support** - Local storage for uninterrupted productivity
- **Accessibility** - Screen reader friendly and keyboard navigation

### 🔐 Security & Authentication
- **Firebase Authentication** - Secure Google OAuth integration
- **JWT Token Management** - Protected API endpoints
- **Data Privacy** - GDPR compliant data handling
- **Rate Limiting** - API protection against abuse

## 🏗️ Architecture

### Frontend Stack
```
React 19.1.0 + Modern JavaScript
├── React Router Dom 7.4.1     # Navigation & routing
├── Framer Motion 12.6.3       # Smooth animations
├── Chart.js 4.4.9             # Data visualization
├── React Icons 5.5.0          # Icon library
├── Axios 1.8.4                # HTTP client
├── React Toastify 11.0.5      # Notifications
└── DOMPurify 3.2.5            # XSS protection
```

### Backend Stack
```
Node.js + Express.js
├── MongoDB Atlas              # Cloud database
├── Mongoose 8.13.1           # ODM for MongoDB
├── Firebase Admin SDK        # Authentication
├── WebSocket (ws)            # Real-time features
├── Helmet 8.1.0             # Security headers
├── Express Rate Limit       # API protection
└── CORS 2.8.5               # Cross-origin requests
```

## 📂 Project Structure

```
Time-Management-and-Procrastination/
│
├── 📁 Time/                           # Frontend React Application
│   ├── 📁 public/
│   │   ├── index.html                 # Main HTML template
│   │   ├── alarm.mp3                  # Timer notification sound
│   │   ├── focus.png                  # App icon
│   │   └── manifest.json              # PWA configuration
│   │
│   ├── 📁 src/
│   │   ├── App.js                     # Main application component
│   │   ├── firebase.js                # Firebase configuration
│   │   ├── index.js                   # Application entry point
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── Landing.js             # Landing page with authentication
│   │   │   ├── Home.js                # Main dashboard container
│   │   │   │
│   │   │   └── 📁 components/
│   │   │       ├── Dashboard.js        # Statistics and overview
│   │   │       ├── TaskManager.js      # Task CRUD operations
│   │   │       ├── PomodoroTimer.js    # Focus timer functionality
│   │   │       ├── Solutions.js        # AI-powered advice
│   │   │       ├── ActivityTracker.jsx # Website usage tracking
│   │   │       ├── SocialMediaTracker.js # Social platform monitoring
│   │   │       └── RemindersManager.js # Notification system
│   │   │
│   │   └── 📁 styles/
│   │       ├── App.css                # Main styles
│   │       └── index.css              # Global styles
│   │
│   └── package.json                   # Frontend dependencies
│
├── 📁 backend/                        # Backend Node.js Server
│   ├── server.js                      # Express server configuration
│   ├── render.yml                     # Deployment configuration
│   └── package.json                   # Backend dependencies
│
├── index.html                         # Static landing page
└── Focus App Demo.mp4                 # Application demonstration
```

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB Atlas** account
- **Firebase Project** with Authentication enabled
- **Google Cloud Console** account (for Gemini AI API)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/Time-Management-and-Procrastination.git
cd Time-Management-and-Procrastination
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
NODE_ENV=development
PORT=5001" > .env

# Start backend server
npm start
```

### 3. Frontend Setup
```bash
cd ../Time
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5001
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id" > .env

# Start development server
npm start
```

### 4. Environment Configuration

#### Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Google Authentication in Authentication > Sign-in method
3. Add your domain to authorized domains
4. Download service account key for backend
5. Get web app config for frontend

#### MongoDB Setup
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster and database
3. Get connection string
4. Whitelist your IP addresses

#### Google AI Setup
1. Enable Gemini API in [Google Cloud Console](https://console.cloud.google.com)
2. Create API key with Generative Language API access
3. Add the API key to your Solutions.js component

## 🎯 Detailed Feature Documentation

### 📋 Task Management System

**Core Functionality:**
- **CRUD Operations** - Create, read, update, delete tasks
- **Priority Levels** - Importance scoring from 1-100
- **Completion Tracking** - Mark tasks as complete with timestamps
- **Responsive Design** - Mobile and desktop optimized interfaces

**Technical Implementation:**
```javascript
// Task Schema (MongoDB)
{
  title: String,
  description: String,
  importance: Number (1-100),
  completed: Boolean,
  createdAt: Date,
  completedAt: Date,
  userId: String
}
```

### ⏰ Pomodoro Timer

**Features:**
- **Customizable Sessions** - 5 minutes to 4 hours duration
- **Timer Controls** - Start, pause, resume, stop, lap
- **Audio Notifications** - Sound alerts for session completion
- **Session Tracking** - Automatic logging to backend
- **Visual Feedback** - Real-time countdown display

**Session Management:**
```javascript
// Session tracking with backend sync
const sessionActions = ['start', 'pause', 'resume', 'stop'];
// Automatic statistics calculation
// Integration with overall productivity metrics
```

### 🤖 AI-Powered Solutions

**Gemini AI Integration:**
- **Natural Language Processing** - Understands productivity challenges
- **Contextual Responses** - Tailored advice for time management
- **Formatted Output** - Clean, readable suggestions
- **Rate Limiting** - Prevents API abuse
- **Error Handling** - Graceful fallbacks

**AI Prompt Engineering:**
```javascript
const optimizedPrompt = `You are an AI expert in time management and handling procrastination. 
Give a short and precise solution in 2-3 points and one liner. 
Response must not be greater than 5 sentences or points. 
Provide a helpful response to the following: ${userQuery}`;
```

### 📊 Activity Tracking

**Website Monitoring:**
- **Real-time Tracking** - Active tab and window focus detection
- **Category Classification** - Productive, social, entertainment, other
- **Privacy-First** - All data stored locally in browser
- **Visual Analytics** - Doughnut charts with Chart.js
- **Permission-Based** - Requires user consent

**Tracking Categories:**
```javascript
const categories = {
  productive: [/docs\.google/, /github/, /stackoverflow/, /notion\.so/],
  social: [/facebook/, /twitter/, /instagram/, /linkedin/],
  entertainment: [/youtube/, /netflix/, /twitch/, /spotify/],
  other: // All uncategorized sites
};
```

### 📱 Social Media Monitoring

**Platform Tracking:**
- **Usage Limits** - Customizable time restrictions per platform
- **Breach Notifications** - Alerts when limits exceeded
- **Historical Data** - Track usage patterns over time
- **Mobile Integration** - Browser-based monitoring

### 🔔 Smart Reminder System

**Notification Features:**
- **Browser Notifications** - Native desktop alerts
- **Scheduled Reminders** - 3-hour intervals for incomplete tasks
- **Permission Management** - Respects user notification preferences
- **Task Cleanup** - Automatically removes completed task reminders

### 📈 Analytics Dashboard

**Metrics Tracked:**
- **Total Focus Time** - Cumulative focused work hours
- **Tasks Completed** - Daily, weekly, monthly completion rates
- **Current Streak** - Consecutive days of productivity
- **Category Breakdown** - Time distribution across activities

**Data Visualization:**
```javascript
// Real-time statistics with Chart.js
const stats = {
  totalFocus: seconds,
  tasksCompleted: count,
  currentStreak: days,
  categoryBreakdown: percentages
};
```

## 🔒 Security Implementation

### Authentication & Authorization
- **Firebase Auth** - Industry-standard OAuth 2.0
- **JWT Tokens** - Stateless authentication
- **Token Refresh** - Automatic session management
- **Route Protection** - Private routes for authenticated users

### API Security
```javascript
// Security middleware stack
app.use(helmet());                    // Security headers
app.use(rateLimit({...}));           // Rate limiting
app.use(cors({...}));                // CORS configuration
app.use(compression());              // Response compression
```

### Data Protection
- **Input Sanitization** - DOMPurify for XSS prevention
- **SQL Injection** - Mongoose ODM protection
- **Environment Variables** - Sensitive data protection
- **HTTPS Enforcement** - Encrypted data transmission

## 🌐 Deployment

### Frontend (Vercel)
```bash
# Automatic deployment from Git
vercel --prod

# Environment variables in Vercel dashboard:
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_FIREBASE_API_KEY=your_key
```

### Backend (Render)
```yaml
# render.yml configuration
services:
  - type: web
    name: time-management-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - MONGODB_URI
      - FIREBASE_PROJECT_ID
      - FIREBASE_CLIENT_EMAIL
      - FIREBASE_PRIVATE_KEY
```

### Database (MongoDB Atlas)
- **Cloud Hosting** - Managed MongoDB service
- **Automatic Backups** - Point-in-time recovery
- **Global Clusters** - Low-latency worldwide access
- **Security** - Network isolation and encryption

## 🧪 Testing Strategy

### Frontend Testing
```bash
npm test                    # Run all tests
npm run test:coverage      # Generate coverage report
```

**Test Coverage:**
- **Component Testing** - React Testing Library
- **Integration Tests** - API endpoint testing
- **E2E Testing** - User workflow validation
- **Accessibility Testing** - Screen reader compatibility

### Backend Testing
```bash
# API endpoint testing
npm run test:api

# Database connection testing
npm run test:db

# Authentication testing
npm run test:auth
```

## 📱 Progressive Web App (PWA)

**PWA Features:**
- **Offline Functionality** - Service worker caching
- **App-like Experience** - Native mobile feel
- **Push Notifications** - Background task reminders
- **Install Prompts** - Add to home screen

**Configuration:**
```json
// manifest.json
{
  "name": "FOCUS - Time Management",
  "short_name": "FOCUS",
  "theme_color": "#9333ea",
  "background_color": "#111827",
  "display": "standalone",
  "icons": [...]
}
```

## 🔧 Development Tools

### Code Quality
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality checks
- **Commit Conventions** - Standardized commit messages

### Development Workflow
```bash
# Development commands
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Code linting
npm run format       # Code formatting
npm run test         # Run test suite
```

## 🚀 Performance Optimizations

### Frontend Optimizations
- **Code Splitting** - Dynamic imports for route-based splitting
- **Lazy Loading** - Components loaded on demand
- **Image Optimization** - WebP format with fallbacks
- **Bundle Analysis** - Webpack bundle analyzer
- **Caching Strategy** - Browser caching for static assets

### Backend Optimizations
- **Database Indexing** - Optimized MongoDB queries
- **Compression** - Gzip compression for responses
- **Connection Pooling** - Efficient database connections
- **Caching Headers** - CDN and browser caching

### Performance Metrics
```javascript
// Core Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Report to analytics
reportWebVitals(console.log);
```

## 🌍 Internationalization (i18n)

**Multi-language Support:**
- **English** - Primary language
- **Spanish** - Planned support
- **French** - Planned support
- **German** - Planned support

**Implementation Strategy:**
```javascript
// i18n configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files in public/locales/
const resources = {
  en: { translation: {...} },
  es: { translation: {...} },
  // More languages...
};
```

## 🔮 Future Roadmap

### Short-term Goals (3 months)
- [ ] **Mobile App** - React Native version
- [ ] **Team Collaboration** - Shared workspaces
- [ ] **Calendar Integration** - Google Calendar sync
- [ ] **Advanced Analytics** - Machine learning insights
- [ ] **Habit Tracking** - Daily routine monitoring

### Medium-term Goals (6 months)
- [ ] **AI Coaching** - Personalized productivity coaching
- [ ] **Goal Setting** - SMART goals with tracking
- [ ] **Time Blocking** - Calendar-based time management
- [ ] **Integrations** - Slack, Notion, Trello APIs
- [ ] **Gamification** - Points, badges, leaderboards

### Long-term Vision (12 months)
- [ ] **Wellness Integration** - Mental health tracking
- [ ] **Enterprise Features** - Team management tools
- [ ] **API Platform** - Third-party integrations
- [ ] **AI Automation** - Smart task scheduling
- [ ] **Voice Commands** - Hands-free interaction

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

### Contribution Guidelines
```bash
# Branch naming convention
feature/task-management-improvements
bugfix/timer-notification-issue
docs/api-documentation-update

# Commit message format
type(scope): description

# Examples:
feat(timer): add custom session durations
fix(auth): resolve login redirect issue
docs(readme): update installation guide
```

### Code Standards
- **TypeScript** - Gradually migrating to TypeScript
- **Clean Code** - Self-documenting, maintainable code
- **Testing** - All new features must include tests
- **Documentation** - Update docs for new features

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 FOCUS Time Management

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Support & Contact

### Community Support
- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Community Q&A and ideas
- **Discord Server** - Real-time chat support
- **Documentation** - Comprehensive guides and tutorials

### Professional Support
- **Email** - anishseth0510@gmail.com
- **LinkedIn** - [Connect with the team](https://linkedin.com/in/anishseth)
- **Website** - [Official project page](https://time-management-app-theta.vercel.app)

### Acknowledgments
- **React Team** - For the amazing framework
- **Firebase** - For authentication and hosting
- **MongoDB** - For reliable database services
- **Vercel** - For seamless deployment
- **Open Source Community** - For inspiration and tools

---

<div align="center">

**Built with ❤️ for productivity enthusiasts worldwide**

[🌟 Star this repo]| [🐛 Report Bug] | [✨ Request Feature]

</div>
