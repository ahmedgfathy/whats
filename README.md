# Real Estate Chat Search Application

A React application with SQLite database for searching and classifying Arabic real estate WhatsApp chat messages.

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
whats/
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
