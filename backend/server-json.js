const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database files
const DB_FILES = {
  users: path.join(dataDir, 'users.json'),
  messages: path.join(dataDir, 'messages.json')
};

// Helper functions for JSON file operations
const readJSONFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Initialize database files
const initializeDatabase = () => {
  // Initialize users
  let users = readJSONFile(DB_FILES.users);
  if (users.length === 0) {
    users = [
      {
        id: 1,
        username: 'xinreal',
        password: 'zerocall',
        created_at: new Date().toISOString()
      }
    ];
    writeJSONFile(DB_FILES.users, users);
  }

  // Initialize messages with sample data
  let messages = readJSONFile(DB_FILES.messages);
  if (messages.length === 0) {
    const sampleData = [
      {
        id: 1,
        sender: 'أحمد السمسار',
        message: 'شقة للبيع في الحي العاشر مساحة 120 متر 3 غرف نوم وصالة ومطبخ وحمامين الدور الثالث بأسانسير السعر 850 ألف جنيه',
        timestamp: new Date().toLocaleString('en-US'),
        property_type: 'apartment',
        keywords: 'شقة, غرف, مطبخ, حمام',
        location: 'الحي العاشر',
        price: '850 ألف جنيه',
        agent_phone: '01234567890',
        agent_description: 'أحمد السمسار - سمسار عقاري محترف متخصص في العقارات السكنية والتجارية',
        full_description: 'شقة مميزة في موقع استراتيجي بالحي العاشر، المساحة 120 متر مربع، تشطيبات عالية الجودة، إطلالة رائعة، قريبة من المواصلات والخدمات، تصلح للسكن أو الاستثمار.',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        sender: 'محمد العقاري',
        message: 'فيلا دوبلكس للإيجار في التجمع الخامس 250 متر مبني على قطعة 300 متر 4 غرف نوم وصالتين ومطبخ وحديقة',
        timestamp: new Date().toLocaleString('en-US'),
        property_type: 'villa',
        keywords: 'فيلا, حديقة, غرف',
        location: 'التجمع الخامس',
        price: '15000 جنيه شهرياً',
        agent_phone: '01123456789',
        agent_description: 'محمد العقاري - خبرة أكثر من 10 سنوات في السوق العقاري المصري',
        full_description: 'فيلا فاخرة في التجمع الخامس بمساحة 250 متر مربع، تصميم عصري، حديقة منسقة، جراج مغطى، أمن وحراسة 24 ساعة، موقع هادئ ومميز.',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        sender: 'سارة للعقارات',
        message: 'أرض للبيع في الشيخ زايد 500 متر على شارع رئيسي مباشرة موقع مميز جداً',
        timestamp: new Date().toLocaleString('en-US'),
        property_type: 'land',
        keywords: 'أرض, شارع رئيسي',
        location: 'الشيخ زايد',
        price: '2.5 مليون جنيه',
        agent_phone: '01012345678',
        agent_description: 'سارة للعقارات - وكيل عقاري معتمد ومتخصص في الاستثمار العقاري',
        full_description: 'قطعة أرض في موقع مميز بالشيخ زايد، المساحة 500 متر مربع، على شارع رئيسي، مرافق متاحة، صالحة للبناء السكني أو التجاري، استثمار مضمون.',
        created_at: new Date().toISOString()
      }
    ];
    writeJSONFile(DB_FILES.messages, sampleData);
    messages = sampleData;
  }

  console.log(`Database initialized with ${users.length} users and ${messages.length} messages`);
};

// Initialize database
initializeDatabase();

// API Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  try {
    const users = readJSONFile(DB_FILES.users);
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get all messages
app.get('/api/messages', (req, res) => {
  const { search, property_type, limit = 100 } = req.query;
  
  try {
    let messages = readJSONFile(DB_FILES.messages);
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      messages = messages.filter(msg => 
        msg.message.toLowerCase().includes(searchLower) ||
        (msg.keywords && msg.keywords.toLowerCase().includes(searchLower)) ||
        (msg.location && msg.location.toLowerCase().includes(searchLower)) ||
        msg.sender.toLowerCase().includes(searchLower)
      );
    }
    
    if (property_type && property_type !== 'all') {
      messages = messages.filter(msg => msg.property_type === property_type);
    }
    
    // Sort by creation date descending
    messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Apply limit
    const limitNum = parseInt(limit);
    if (limitNum > 0) {
      messages = messages.slice(0, limitNum);
    }
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Add new message
app.post('/api/messages', (req, res) => {
  const messageData = req.body;
  
  try {
    const messages = readJSONFile(DB_FILES.messages);
    
    // Generate new ID
    const newId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;
    
    const newMessage = {
      id: newId,
      ...messageData,
      created_at: new Date().toISOString()
    };
    
    messages.push(newMessage);
    
    if (writeJSONFile(DB_FILES.messages, messages)) {
      res.json({ success: true, id: newId });
    } else {
      res.status(500).json({ success: false, message: 'Failed to save message' });
    }
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Bulk import messages (for WhatsApp chat imports)
app.post('/api/messages/bulk', (req, res) => {
  const { messages: messagesToImport } = req.body;
  
  if (!Array.isArray(messagesToImport)) {
    return res.status(400).json({ success: false, message: 'Messages must be an array' });
  }
  
  try {
    const existingMessages = readJSONFile(DB_FILES.messages);
    
    let importedCount = 0;
    let skippedCount = 0;
    let propertyCount = 0;
    
    // Generate new IDs starting from max existing ID
    let nextId = existingMessages.length > 0 ? Math.max(...existingMessages.map(m => m.id)) + 1 : 1;
    
    for (const messageData of messagesToImport) {
      try {
        // Check for duplicates (simple check based on message and sender)
        const isDuplicate = existingMessages.some(msg => 
          msg.message === messageData.message && msg.sender === messageData.sender
        );
        
        if (isDuplicate) {
          skippedCount++;
          continue;
        }
        
        const newMessage = {
          id: nextId++,
          ...messageData,
          created_at: new Date().toISOString()
        };
        
        existingMessages.push(newMessage);
        importedCount++;
        
        if (messageData.property_type !== 'other') {
          propertyCount++;
        }
      } catch (err) {
        console.error('Error importing individual message:', err);
        skippedCount++;
      }
    }
    
    if (writeJSONFile(DB_FILES.messages, existingMessages)) {
      console.log(`Bulk import complete: ${importedCount} imported, ${skippedCount} skipped, ${propertyCount} properties`);
      
      res.json({ 
        success: true, 
        imported: importedCount,
        total: messagesToImport.length,
        skipped: skippedCount,
        propertyMessages: propertyCount
      });
    } else {
      res.status(500).json({ success: false, message: 'Failed to save imported messages' });
    }
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ success: false, message: 'Database error during bulk import' });
  }
});

// Get property type statistics
app.get('/api/stats', (req, res) => {
  try {
    const messages = readJSONFile(DB_FILES.messages);
    
    const statsMap = {};
    messages.forEach(msg => {
      if (msg.property_type) {
        statsMap[msg.property_type] = (statsMap[msg.property_type] || 0) + 1;
      }
    });
    
    const stats = Object.entries(statsMap).map(([property_type, count]) => ({
      property_type,
      count
    }));
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get message by ID
app.get('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const messages = readJSONFile(DB_FILES.messages);
    const message = messages.find(msg => msg.id === parseInt(id));
    
    if (message) {
      res.json({ success: true, message });
    } else {
      res.status(404).json({ success: false, message: 'Message not found' });
    }
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  try {
    const messages = readJSONFile(DB_FILES.messages);
    const users = readJSONFile(DB_FILES.users);
    
    res.json({ 
      success: true, 
      message: 'API is running', 
      database: 'JSON file storage',
      stats: {
        messages: messages.length,
        users: users.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Health check failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Real Estate Chat API server running on http://localhost:${PORT}`);
  console.log(`📦 Database files stored in: ${dataDir}`);
  console.log(`🔍 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`💾 Using JSON file storage for persistence`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Server shutting down gracefully...');
  process.exit(0);
});
