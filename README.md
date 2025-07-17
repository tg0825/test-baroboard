# 📊 Baroboard

<div align="center">

![Baroboard Logo](public/og-image.svg)

**Dashboard Analytics Platform for Real-time Data Visualization**

[![Deploy](https://img.shields.io/badge/deploy-firebase-orange.svg)](https://baroboard.web.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black.svg)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.10.0-orange.svg)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8.svg)](https://tailwindcss.com/)

[🌐 Live Demo](https://baroboard.web.app) • [📊 Features](#features) • [🚀 Quick Start](#quick-start) • [📖 Documentation](#documentation)

</div>

---

## ✨ Features

### 🎯 **Core Analytics**
- **100+ Pre-built Queries** - Comprehensive delivery service analytics
- **Real-time Data Visualization** - Interactive charts and graphs
- **Multi-type Analysis** - Analytics, Reports, and Dashboards
- **Advanced Filtering** - Smart search and categorization

### 🔥 **Firebase Integration**
- **Firestore Database** - Real-time data storage and sync
- **Analytics Tracking** - User behavior and query selection monitoring  
- **Authentication Ready** - Firebase Auth integration prepared
- **Cloud Functions** - Serverless backend capabilities

### 🤖 **AI-Powered Features**
- **n8n Chatbot** - Intelligent query assistant
- **Automated Insights** - AI-driven data analysis
- **Smart Recommendations** - Personalized query suggestions

### 📱 **Modern UI/UX**
- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - Live data synchronization
- **Dark/Light Themes** - Customizable interface
- **Accessibility** - WCAG 2.1 compliant

### 🔧 **Developer Experience**
- **TypeScript** - Full type safety
- **Component Library** - Reusable UI components
- **Testing Suite** - Playwright end-to-end tests
- **CI/CD Pipeline** - Automated deployment

---

## 🚀 Quick Start

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/baroboard.git
cd baroboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Start development server
npm run dev
```

### 🔥 Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database and Analytics
3. Copy your Firebase config to `src/firebase.ts`
4. Deploy to Firebase Hosting:
```bash
npm run deploy
```

---

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: Next.js 15.4.1 + React 19.1.0
- **Styling**: Tailwind CSS 3.4.17 + Custom Design System
- **Charts**: Chart.js 4.5.0 + React-Chartjs-2 5.3.0
- **Backend**: Firebase (Firestore + Analytics + Auth)
- **AI/Chat**: n8n Integration 0.47.0
- **Testing**: Playwright 1.54.1
- **Deployment**: Firebase Hosting + GitHub Actions

### **Project Structure**
```
baroboard/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout with metadata
│   │   ├── page.tsx         # Home page
│   │   └── query/[id]/      # Dynamic query pages
│   ├── components/          # Reusable components
│   │   ├── Dashboard.tsx    # Main dashboard container
│   │   ├── Sidebar.tsx      # Query list sidebar
│   │   ├── Container.tsx    # Content container
│   │   ├── Graph.tsx        # Chart visualization
│   │   ├── GNB.tsx          # Global navigation bar
│   │   └── FloatingChatbot.tsx # n8n chat integration
│   ├── firebase.ts          # Firebase configuration
│   └── styles/              # Global styles and themes
├── public/
│   ├── og-image.svg         # Open Graph thumbnail
│   └── ...                  # Static assets
├── tests/                   # Playwright test suites
├── firebase.json            # Firebase deployment config
└── README.md               # This file
```

---

## 📊 Key Components

### **Dashboard System**
- **Query Management**: 100+ delivery analytics queries
- **Data Visualization**: Line, Bar, Doughnut charts
- **Real-time Updates**: Live data synchronization
- **Export Features**: PDF, Excel, JSON exports

### **Analytics Categories**
- 📈 **Delivery Performance**: Driver efficiency, delivery times
- 🍕 **Order Analytics**: Volume trends, customer behavior  
- 🏪 **Restaurant Insights**: Category performance, ratings
- 🎯 **Business Intelligence**: Revenue, growth metrics
- 🔍 **Customer Analysis**: Satisfaction, retention rates

### **Firebase Features**
- **Query Tracking**: Every query selection logged to Firestore
- **Session Analytics**: User behavior and engagement metrics
- **Real-time Sync**: Live updates across all connected clients
- **Offline Support**: Progressive Web App capabilities

---

## 🎨 Design System

### **Color Palette**
- **Primary**: Vital Orange (`#fa5014`) - Baroboard's signature color
- **Secondary**: Professional Gray (`#6c757d`)
- **Success**: Forest Green (`#28a745`)
- **Warning**: Amber (`#ffc107`)
- **Background**: Clean White (`#ffffff`)

### **Typography**
- **Primary Font**: Geist Sans (Modern, readable)
- **Monospace**: Geist Mono (Code, data)
- **Responsive**: Mobile-first typography scale

### **Components**
- **Cards**: Elevated design with soft shadows
- **Buttons**: Consistent interaction patterns
- **Forms**: Accessible and validated inputs
- **Charts**: Customized Chart.js themes

---

## 🧪 Testing

### **Test Coverage**
```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# View test reports
npm run test:report
```

### **Test Categories**
- **Component Tests**: UI component functionality
- **Integration Tests**: Firebase and API interactions
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Load and rendering metrics

---

## 🚀 Deployment

### **Development**
```bash
npm run dev          # Start development server
npm run lint         # Run ESLint checks
npm run build        # Build for production
```

### **Production**
```bash
npm run deploy       # Build and deploy to Firebase
```

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook
```

---

## 📈 Performance

### **Lighthouse Scores**
- **Performance**: 95+ 
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### **Key Optimizations**
- **Static Generation**: Pre-rendered pages for fast loading
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Lazy loading for optimal bundle size
- **CDN Delivery**: Firebase Hosting global distribution

---

## 🤝 Contributing

### **Development Workflow**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Commit Convention**
```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### **Code Standards**
- **TypeScript**: Strict type checking
- **ESLint**: Consistent code formatting
- **Prettier**: Automated code formatting
- **Husky**: Pre-commit hooks

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🏢 About

**Baroboard** is developed by **AInity4** - a leading provider of AI-powered analytics solutions for the delivery and logistics industry.

### **Key Statistics**
- 🚀 **100+** Built-in Analytics Queries
- 📊 **Real-time** Data Visualization
- 🔥 **Firebase** Cloud Integration
- 🤖 **AI-Powered** Chatbot Assistant
- 📱 **Mobile-First** Responsive Design

---

## 🔗 Links

- **Live Demo**: [baroboard.web.app](https://baroboard.web.app)
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com/project/baroboard)
- **Documentation**: [Coming Soon]
- **Support**: [issues@baroboard.com]

---

<div align="center">

**Built with ❤️ by AInity4**

[![Deploy to Firebase](https://img.shields.io/badge/Deploy%20to-Firebase-orange.svg)](https://baroboard.web.app)

</div>
