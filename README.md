# 🏢 Contaboo - Real Estate CRM Platform

<div align="center">

![Contaboo Logo](https://img.icons8.com/color/96/real-estate.png)

**A modern, multilingual Customer Relationship Management system for real estate professionals**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)](https://neon.tech/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[🚀 Live Demo](https://contaboo-demo.vercel.app) • [📖 Documentation](https://github.com/your-username/contaboo/wiki) • [� Report Bug](https://github.com/your-username/contaboo/issues) • [💡 Request Feature](https://github.com/your-username/contaboo/issues)

</div>

---

## 🌟 Features

<table>
  <tr>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/color/48/property.png" alt="Property Management"/>
      <h3>🏠 Property Management</h3>
      <p>Comprehensive property listing system with advanced search and filtering capabilities</p>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/color/48/whatsapp.png" alt="WhatsApp Integration"/>
      <h3>💬 WhatsApp Integration</h3>
      <p>Import and analyze WhatsApp chat messages for property leads and agent management</p>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/color/48/dashboard.png" alt="Analytics Dashboard"/>
      <h3>📊 Analytics Dashboard</h3>
      <p>Real-time insights and performance metrics for your real estate business</p>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/color/48/language.png" alt="Multilingual"/>
      <h3>🌐 Arabic & English Support</h3>
      <p>Full Arabic and English support with RTL layout for Arabic users</p>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/color/48/mobile-phone.png" alt="Responsive"/>
      <h3>📱 Responsive Design</h3>
      <p>Optimized for desktop, tablet, and mobile devices with modern UI/UX</p>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/color/48/artificial-intelligence.png" alt="AI Classification"/>
      <h3>🤖 AI Classification</h3>
      <p>Intelligent property type detection using Arabic keyword recognition</p>
    </td>
  </tr>
</table>

### Key Relationships
```sql
chat_messages -> property_types (property_type_id)
chat_messages -> areas (area_id)
chat_messages -> agents (agent_id)
properties -> property_types (property_type_id)
properties -> areas (area_id)
properties -> agents (agent_id)
```

## 📁 Project Structure

```
Contaboo/
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/          # React components
│   │   │   ├── HomePage.jsx        # Main homepage with property filters
│   │   │   ├── Dashboard.jsx       # Admin dashboard
│   │   │   ├── ChatImport.jsx      # WhatsApp chat import
│   │   │   ├── PropertyDetailsModal.jsx
│   │   │   └── ...
│   │   ├── 📁 services/
│   │   │   ├── apiService.js       # API communication layer
│   │   │   └── databaseService.js  # Database utilities
│   │   ├── 📁 utils/
│   │   │   └── arabicTextProcessor.js # Arabic text processing
│   │   └── 📁 assets/              # Static assets
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite configuration
├── 📁 backend/
│   ├── server-sqlite-complete.js   # Main backend server
│   ├── package.json                # Backend dependencies
│   └── ...
├── 📁 database/
│   ├── real_estate.db              # SQLite database file
│   ├── schema.sql                  # Database schema
│   └── initial_data.sql            # Seed data
└── 📁 documentation/
    ├── POSTGRESQL_DEPLOYMENT_GUIDE.md
    ├── DATABASE_SCHEMA.md
    └── ...
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd Contaboo
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### Step 4: Database Setup
The SQLite database is already configured with sample data:
- **Location**: `database/real_estate.db`
- **Records**: 2,916 chat messages with property classifications
- **Schema**: Fully relational with foreign key constraints

### Step 5: Start Development Servers

**Backend Server (Terminal 1):**
```bash
cd backend
npm start
# Backend runs on http://localhost:3001
```

**Frontend Server (Terminal 2):**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 6: Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Login**: Username: `xinreal`, Password: `zerocall`

## 📡 API Documentation

### Authentication
```javascript
POST /api/auth/login
{
  "username": "xinreal",
  "password": "zerocall"
}
```

### Property Statistics
```javascript
GET /api/stats
Response: {
  "success": true,
  "stats": [
    {"property_type": "apartment", "count": 838},
    {"property_type": "land", "count": 565},
    {"property_type": "villa", "count": 222},
    {"property_type": "office", "count": 97},
    {"property_type": "warehouse", "count": 19}
  ]
}
```

### Search Messages
```javascript
GET /api/messages/search?q=شقة&type=apartment&limit=50
Response: {
  "success": true,
  "messages": [...],
  "total": 838
}
```

### Get All Messages
```javascript
GET /api/messages?type=all&limit=100
Response: {
  "success": true,
  "messages": [...],
  "total": 2916
}
```

### Import WhatsApp Chat
```javascript
POST /api/import/whatsapp
{
  "messages": [...]
}
```

## 🎨 Frontend Components

### HomePage.jsx
- **Primary Component**: Main application interface
- **Features**: Property type filters, search functionality, message display
- **State Management**: React hooks for messages, stats, filters
- **Styling**: Tailwind CSS with Framer Motion animations

### Key Features:
- **Circular Property Cards**: Enhanced with glow effects and uniform icons
- **Arabic/English Toggle**: Language switcher
- **Real-time Search**: Instant filtering and search results
- **Responsive Grid**: Adaptive layout for all screen sizes

### Dashboard.jsx
- **Admin Interface**: Property management and analytics
- **Charts**: Property distribution visualization
- **CRUD Operations**: Create, read, update, delete properties

### ChatImport.jsx
- **WhatsApp Integration**: Parse and import chat files
- **Phone Number Extraction**: Automatic agent contact extraction
- **Property Classification**: AI-powered property type detection

## 🐛 Current Issues

### 1. Property Count Display (In Progress)
**Issue**: Circular property filter cards showing 0 counts instead of actual numbers
**Status**: API working correctly, frontend debugging in progress
**API Response**: ✅ Returns correct data (apartment: 838, land: 565, etc.)
**Frontend**: 🔄 Debugging stats loading and display logic

### 2. Backend Dependencies
**Issue**: better-sqlite3 compilation issues on some systems
**Workaround**: JSON fallback system automatically activates
**Solution**: Install with `npm install better-sqlite3 --build-from-source`

### 3. CORS Configuration
**Status**: ✅ Resolved - CORS properly configured with `Access-Control-Allow-Origin: *`

## 📈 Development Progress

### ✅ Completed Features
1. **Database Design**: Complete relational schema with 2,916 real messages
2. **Backend API**: Full REST API with SQLite integration
3. **Frontend Architecture**: Modern React with routing and state management
4. **Property Classification**: Arabic keyword-based categorization
5. **Search Functionality**: Full-text search with filtering
6. **Authentication**: Secure login system
7. **UI/UX Design**: Modern, responsive interface with animations
8. **Circular Cards Enhancement**: Uniform design with glow effects
9. **Arabic Language Support**: Native RTL and Arabic text processing

### 🔄 In Progress
1. **Property Count Display**: Debugging frontend stats integration
2. **Performance Optimization**: Database query optimization
3. **Error Handling**: Enhanced error messages and retry logic

### 📋 Upcoming Tasks
1. **Property Count Fix**: Complete debugging and fix circular card counts
2. **Advanced Filtering**: Price range, area size, date filters
3. **Property Details**: Detailed property view modal
4. **Agent Profiles**: Enhanced agent information and contact
5. **Export Features**: Export search results and reports
6. **Mobile App**: React Native version consideration

## 🚀 Deployment Guide

### Production Options

#### Option 1: Vercel + Neon (Recommended)
- **Frontend**: Vercel deployment
- **Database**: Neon PostgreSQL
- **Cost**: ~$0-25/month
- **Scalability**: High

#### Option 2: Traditional VPS
- **Server**: Ubuntu 20.04+ with Node.js
- **Database**: PostgreSQL or keep SQLite
- **Cost**: $5-20/month
- **Control**: Full server control

#### Option 3: Docker Deployment
```bash
# Build and run containers
docker-compose up -d
```

### Environment Variables
```env
# Backend
PORT=3001
DB_PATH=./database/real_estate.db
JWT_SECRET=your-secret-key

# Frontend
VITE_API_URL=http://localhost:3001/api
```

### Database Migration
For PostgreSQL deployment, use the provided migration scripts:
```bash
# See POSTGRESQL_DEPLOYMENT_GUIDE.md for detailed instructions
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/property-count-fix`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m "Fix property count display issue"`
5. Push to branch: `git push origin feature/property-count-fix`
6. Create Pull Request

### Code Style
- **Frontend**: ES6+, React hooks, Tailwind CSS
- **Backend**: Node.js, Express, SQLite/PostgreSQL
- **Database**: SQL with foreign key constraints
- **Arabic Support**: UTF-8 encoding, RTL layout

### Testing
```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# Database tests
npm run test:db
```

## 📞 Support & Contact

For technical support or questions about this project:
- **Authentication**: Default credentials `xinreal/zerocall`
- **Database**: 2,916 messages across 5 property types
- **API**: RESTful endpoints on port 3001
- **Frontend**: React SPA on port 5173

---

**Note**: This project is in active development. The property count display issue is currently being debugged, but all other core functionality is working correctly. The application is ready for production deployment with proper database migration.

**Last Updated**: July 5, 2025
**Version**: 3.0.0
**Status**: Production Ready (with noted debugging in progress)

## Features

- 🏠 **Arabic Language Support** - Full support for Arabic real estate terminology
- 🗄️ **SQLite Database** - Efficient storage and retrieval of chat messages
- 🔍 **Smart Search** - Keyword-based search with Arabic text processing
- 🏷️ **Auto-Classification** - Automatic property type detection (apartments, villas, land, offices, warehouses)
- 🔐 **Secure Login** - Authentication system with hardcoded credentials
- 📊 **Statistics Dashboard** - Visual insights into property data
- 📱 **Responsive Design** - Modern UI with Tailwind CSS
- 📞 **Agent Information** - Display agent phone numbers for easy contact

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Node.js with Express
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React & Heroicons
- **Font**: Noto Sans Arabic for proper Arabic display

## Project Structure

```
Contaboo/
├── src/                    # React frontend
├── backend/               # Node.js backend with SQLite
├── data/                  # SQLite database files
└── public/               # Static assets
```

## Quick Start

### Option 1: Frontend Only (Mock Data)
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

### Option 2: Full Stack (Real SQLite Database)
1. **Start Backend Server**
   ```bash
   # Windows
   start-backend.bat
   
   # Manual
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   npm install
   npm run dev
   ```

3. **Database File Location**
   The SQLite database will be created at: `data/real_estate_chat.db`

### Login Credentials
- Username: `xinreal`
- Password: `zerocall`

## Usage

### 1. Login
Use the provided credentials to access the system.

### 2. Import WhatsApp Chats
- Export WhatsApp group chat as text file (without media)
- Go to "استيراد المحادثات" tab
- Upload the .txt file
- System will automatically classify messages by property type

### 3. Search Messages
- Use the search bar to find specific properties
- Filter by property type (شقق، فيلل، أراضي، مكاتب، مخازن)
- Results show classification, location, and price information

### 4. View Statistics
- Check the "الإحصائيات" tab for insights
- See property type distribution
- Monthly trends and top senders

## Arabic Property Keywords

The system recognizes these Arabic property types:

- **شقة** (Apartment): شقة، شقق، دور، أدوار، طابق، غرفة، غرف
- **فيلا** (Villa): فيلا، فيلات، قصر، قصور، بيت، بيوت، منزل، منازل
- **أرض** (Land): أرض، أراضي، قطعة، قطع، مساحة، متر، فدان
- **مكتب** (Office): مكتب، مكاتب، إداري، تجاري، محل، محلات
- **مخزن** (Warehouse): مخزن، مخازن، مستودع، مستودعات، ورشة

## Sample Data

A sample WhatsApp chat file is included at `data/sample_chat.txt` for testing purposes.

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

This project is for personal use only.
