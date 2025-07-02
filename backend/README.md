# Real Estate Chat Backend Setup

This backend provides SQLite database functionality for the Real Estate Chat Search Application.

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Running the Backend

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## Database File Location

The SQLite database file will be created at:
`../data/real_estate_chat.db`

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/messages` - Get all messages (with optional search and filtering)
- `POST /api/messages` - Add new message
- `GET /api/messages/:id` - Get specific message
- `GET /api/stats` - Get property type statistics
- `GET /api/health` - Health check

## Sample Data

The database is automatically initialized with sample Arabic real estate data when first started.

## Usage with Frontend

To connect the React frontend to this backend:

1. Start the backend server (`npm run dev`)
2. Update the frontend to use API calls instead of mock data
3. The database file `real_estate_chat.db` will be created in the `data` folder

## Environment Variables

You can create a `.env` file with:
```
PORT=3001
```
