# 🏠 Real Estate Chat Search Platform

> A comprehensive Arabic/English real estate platform for searching and analyzing WhatsApp chat messages and property listings with advanced classification and filtering capabilities.

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

## 🌟 Overview

This modern web application revolutionizes real estate property management by intelligently processing and searching through Arabic WhatsApp chat messages and property listings. Built with cutting-edge technologies, it offers seamless bilingual support, advanced property classification, and powerful search capabilities.

### ✨ Key Features

- 🌐 **Bilingual Support**: Native Arabic and English interfaces with RTL/LTR support
- 🔍 **Intelligent Search**: Advanced search across 22,500+ property records
- 🏘️ **Property Classification**: Automatic categorization (apartments, villas, land, offices, warehouses)
- 📱 **WhatsApp Integration**: Import and process WhatsApp chat exports
- 📊 **Analytics Dashboard**: Real-time property statistics and insights
- 🎨 **Modern UI**: Beautiful responsive design with animations and glass effects
- 🔐 **Secure Authentication**: Role-based access control
- 🌍 **Production Ready**: Cloud-deployed with PostgreSQL database

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - Modern React with hooks and concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Radix UI** - Accessible component primitives

### Backend
- **Node.js + Express** - RESTful API server
- **PostgreSQL** - Production database with Neon hosting
- **Better SQLite3** - Local development database
- **CORS** - Cross-origin resource sharing

### Infrastructure
- **Vercel** - Frontend deployment and hosting
- **Neon** - Serverless PostgreSQL database
- **GitHub Actions** - CI/CD pipeline

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/real-estate-chat-platform.git
   cd real-estate-chat-platform
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   cd ..
   ```

3. **Environment setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Login: `xinreal` / `zerocall`

## 🎯 Core Features

### 🔍 Advanced Search
- **Multi-language**: Search in Arabic and English
- **Property Types**: Filter by apartments (شقق), villas (فيلل), land (أراضي), offices (مكاتب), warehouses (مخازن)
- **Location-based**: 27+ Egyptian areas and neighborhoods
- **Real-time**: Instant search results with live filtering

### 📊 Property Analytics
- **Statistics Dashboard**: Visual insights with charts and graphs
- **Distribution Analysis**: Property type and location distribution
- **Trend Tracking**: Historical data and search analytics
- **Agent Performance**: Real estate agent activity tracking

### 📱 WhatsApp Integration
- **Chat Import**: Bulk import WhatsApp chat exports
- **Message Processing**: Automatic property classification
- **Agent Extraction**: Phone number and contact information extraction
- **Keyword Detection**: Arabic property terms recognition

### 🎨 Modern Interface
- **Responsive Design**: Mobile-first approach
- **Glass Effects**: Modern backdrop blur and transparency
- **Smooth Animations**: Framer Motion powered transitions
- **Dark/Light Themes**: Customizable appearance
- **Accessibility**: WCAG compliant with screen reader support

## 🗃️ Database Schema

### Core Tables
- **chat_messages** (2,500+ records) - WhatsApp chat data
- **properties_import** (20,000+ records) - CSV property listings
- **property_types** - Property classification system
- **areas** - Egyptian neighborhoods and locations
- **agents** - Real estate agent information
- **users** - Authentication and authorization

### Property Classification
```javascript
{
  "apartment": ["شقة", "شقق", "دور", "أدوار", "طابق", "غرفة", "غرف"],
  "villa": ["فيلا", "فيلات", "قصر", "قصور", "بيت", "بيوت", "منزل", "دوبلكس"],
  "land": ["أرض", "أراضي", "قطعة", "قطع", "مساحة", "متر", "فدان"],
  "office": ["مكتب", "مكاتب", "إداري", "تجاري", "محل", "محلات"],
  "warehouse": ["مخزن", "مخازن", "مستودع", "مستودعات", "ورشة"]
}
```

## 📡 API Documentation

### Authentication
```javascript
POST /api/auth/login
{
  "username": "xinreal",
  "password": "zerocall"
}
```

### Property Search
```javascript
GET /api/search-all?q={query}&type={propertyType}&limit={limit}
```

### Statistics
```javascript
GET /api/stats
Response: {
  "apartment": 838,
  "villa": 222,
  "land": 565,
  "office": 97,
  "warehouse": 19
}
```

### WhatsApp Import
```javascript
POST /api/import/whatsapp
{
  "messages": [/* WhatsApp chat messages */]
}
```

## 🚀 Deployment

### Production Setup
1. **Frontend**: Deploy to Vercel with automatic GitHub integration
2. **Backend**: Deploy API to Vercel serverless functions
3. **Database**: Use Neon PostgreSQL for production data
4. **Environment**: Configure production environment variables

### Environment Variables
```env
# Backend
DATABASE_URL=postgresql://username:password@host:5432/database
NODE_ENV=production
PORT=3001

# Frontend
VITE_API_URL=https://your-backend-url.vercel.app
```

## 🧪 Testing

### Development Testing
```bash
# Run frontend tests
npm test

# Run backend tests
cd backend && npm test

# Test API endpoints
curl http://localhost:3001/api/health
```

### Production Testing
```bash
# Test deployed application
curl https://your-app.vercel.app/api/health
```

## 📈 Performance

- **Database**: 22,500+ records with optimized indexing
- **Search**: Sub-second search across all records
- **UI**: 60fps animations with hardware acceleration
- **API**: RESTful endpoints with proper caching
- **Mobile**: Responsive design with touch optimization

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow React best practices and hooks patterns
- Use TypeScript for type safety
- Write comprehensive tests for new features
- Maintain responsive design principles
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for AI-powered property classification
- **Neon** for serverless PostgreSQL hosting
- **Vercel** for seamless deployment experience
- **Tailwind CSS** for beautiful and responsive design
- **React Team** for the amazing framework

---

<div align="center">
  <p>Built with ❤️ for the real estate community</p>
  <p>
    <a href="https://your-app.vercel.app">🔗 Live Demo</a> •
    <a href="https://github.com/yourusername/real-estate-chat-platform/issues">🐛 Report Bug</a> •
    <a href="https://github.com/yourusername/real-estate-chat-platform/discussions">💬 Discussions</a>
  </p>
</div>
