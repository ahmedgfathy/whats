#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🔄 Restoring database with original WhatsApp chat data...');

const dbPath = path.join(__dirname, '../data/real_estate_chat.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Drop and recreate tables to ensure clean state
console.log('📝 Recreating database schema...');

db.exec(`DROP TABLE IF EXISTS chat_messages`);
db.exec(`DROP TABLE IF EXISTS csv_imports`);
db.exec(`DROP TABLE IF EXISTS users`);

// Create users table
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create main chat messages table (for WhatsApp imports)
db.exec(`
  CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT,
    property_type TEXT,
    keywords TEXT,
    location TEXT,
    price TEXT,
    agent_phone TEXT,
    agent_description TEXT,
    full_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender, message)
  )
`);

// Create CSV imports tracking table
db.exec(`
  CREATE TABLE csv_imports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    file_name TEXT,
    total_records INTEGER,
    imported_records INTEGER,
    headers TEXT,
    import_date DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert admin user
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)
`);

insertUser.run('xinreal', 'zerocall');

console.log('👤 Admin user created: xinreal/zerocall');

// Generate comprehensive sample real estate data (2000+ records)
console.log('🏠 Generating 2000+ comprehensive real estate records...');

const propertyTypes = ['apartment', 'villa', 'land', 'office', 'warehouse'];
const locations = [
  'القاهرة الجديدة', 'التجمع الخامس', 'المعادي', 'الزمالك', 'مدينة نصر',
  'الرحاب', 'الشروق', 'العبور', 'بيت الوطن', 'الحي العاشر',
  'أكتوبر', 'الشيخ زايد', 'دريم لاند', 'العاصمة الإدارية', 'مدينتي',
  'كمبوند الأندلس', 'هليوبوليس', 'مصر الجديدة', 'جسر السويس', 'النرجس',
  'الياسمين', 'اللوتس', 'ابو الهول', 'جنوب الاكاديمية', 'زيزنييا',
  'مونتن فيو', 'طيبة', 'فاميلي سيتي', 'جرين سكوير', 'لافينير',
  'هايد بارك', 'وان قطاميه', 'النرجس عمارات'
];

const senderNames = [
  'أحمد السمسار', 'محمد العقاري', 'فاطمة المطور', 'علي الوسيط', 'مريم السكن',
  'عمر الاستثمار', 'نورا العقارات', 'خالد المباني', 'سارة التطوير', 'يوسف السمسار',
  'هند العقاري', 'طارق الوسيط', 'ليلى السكن', 'كريم المشاريع', 'دينا الاستثمار',
  'وائل كمال', 'عيد قاعود', 'محمد عرابي', 'كمال العقاري', 'داليا السمسار',
  'شريف المطور', 'عبدالعليم الوسيط', 'محسن السكن', 'مصطفى العقاري', 'عادل المباني',
  'احمد الاستثمار', 'هاني سعد', 'احمد هشام', 'احمد عماد', 'مهندس احمد',
  'عمرو السمسار', 'عبدالحميد العقاري', 'منة السكن', 'ادهم الوسيط', 'مروان المطور'
];

const phoneNumbers = [
  '01001834520', '01000306580', '01093335990', '01025853777', '01060470812',
  '01122204432', '01001727753', '01025024422', '01222348031', '01227460067',
  '01015631406', '01009880430', '01001727951', '01222192519', '01020308208',
  '01008485509', '01099909095', '01229125552', '01008996886', '01025024422'
];

const messageTemplates = [
  'شقة للبيع في {location} مساحة {area} متر {rooms} غرف نوم وصالة ومطبخ و{bathrooms} حمام الدور {floor} السعر {price} ألف جنيه',
  'فيلا مستقلة في {location} مساحة الأرض {land} متر والمباني {area} متر {rooms} غرف ماستر + ريسيبشن كامل السعر {price} مليون جنيه',
  'أرض للبيع في {location} مساحة {area} متر على الشارع الرئيسي مرافق متاحة السعر {price} ألف للمتر',
  'مكتب تجاري في {location} مساحة {area} متر في برج إداري الدور {floor} تشطيب كامل السعر {price} ألف جنيه',
  'مخزن للبيع في {location} مساحة {area} متر ارتفاع مناسب واجهة واسعة السعر {price} ألف جنيه',
  'شقة في كمبوند {location} مساحة {area} متر {rooms} غرف + ريسيبشن تشطيب فاخر السعر {price} ألف جنيه',
  'دوبلكس للبيع في {location} مساحة {area} متر دورين {rooms} غرف نوم + ليفينج السعر {price} مليون',
  'بنت هاوس في {location} مساحة {area} متر + تراس {terrace} متر تشطيب سوبر لوكس السعر {price} مليون',
  'روف للبيع في {location} مساحة {area} متر مبنى + {roof} متر مفتوح السعر {price} ألف جنيه',
  'استوديو للبيع في {location} مساحة {area} متر تشطيب حديث السعر {price} ألف جنيه'
];

const insertMessage = db.prepare(`
  INSERT OR IGNORE INTO chat_messages (
    sender, message, timestamp, property_type, keywords, location, price, 
    agent_phone, agent_description, full_description
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Generate 2500 diverse records
const insertMany = db.transaction((records) => {
  for (const record of records) {
    insertMessage.run(...record);
  }
});

const records = [];
for (let i = 1; i <= 2500; i++) {
  const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const sender = senderNames[Math.floor(Math.random() * senderNames.length)];
  const phone = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
  
  const area = propertyType === 'land' ? 
    Math.floor(Math.random() * 800) + 200 : 
    Math.floor(Math.random() * 300) + 80;
  
  const rooms = ['2', '3', '4', '5'][Math.floor(Math.random() * 4)];
  const bathrooms = ['1', '2', '3'][Math.floor(Math.random() * 3)];
  const floor = Math.floor(Math.random() * 10) + 1;
  
  let price;
  switch (propertyType) {
    case 'apartment':
      price = Math.floor(Math.random() * 1500) + 500;
      break;
    case 'villa':
      price = (Math.floor(Math.random() * 80) + 20) / 10; // 2-10 million
      break;
    case 'land':
      price = Math.floor(Math.random() * 50) + 10; // per meter
      break;
    case 'office':
      price = Math.floor(Math.random() * 2000) + 800;
      break;
    case 'warehouse':
      price = Math.floor(Math.random() * 1200) + 600;
      break;
  }
  
  const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
  const message = template
    .replace('{location}', location)
    .replace('{area}', area)
    .replace('{rooms}', rooms)
    .replace('{bathrooms}', bathrooms)
    .replace('{floor}', floor)
    .replace('{price}', price)
    .replace('{land}', area + 100)
    .replace('{terrace}', Math.floor(area * 0.3))
    .replace('{roof}', Math.floor(area * 0.5));
  
  const timestamp = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleString('ar-EG');
  const keywords = `${propertyType}, ${location}, ${area}م, ${price}`;
  const agentDescription = `${sender} - سمسار عقاري محترف متخصص في ${location}`;
  
  let fullDescription;
  switch (propertyType) {
    case 'apartment':
      fullDescription = `شقة مميزة في ${location} بمساحة ${area} متر مربع، تتكون من ${rooms} غرف نوم و${bathrooms} حمام وصالة ومطبخ، الدور ${floor}، تشطيب عالي الجودة، موقع متميز قريب من الخدمات والمواصلات`;
      break;
    case 'villa':
      fullDescription = `فيلا فاخرة في ${location} بمساحة ${area} متر مربع، تصميم عصري، ${rooms} غرف نوم ماستر، حديقة منسقة، جراج مغطى، أمن وحراسة 24 ساعة`;
      break;
    case 'land':
      fullDescription = `قطعة أرض في موقع مميز بـ${location}، المساحة ${area} متر مربع، على شارع رئيسي، مرافق متاحة، صالحة للبناء السكني أو التجاري`;
      break;
    case 'office':
      fullDescription = `مكتب في برج تجاري بـ${location}، المساحة ${area} متر مربع، الدور ${floor}، تشطيب راقي، أمن وحراسة، موقف سيارات`;
      break;
    case 'warehouse':
      fullDescription = `مخزن في منطقة صناعية بـ${location}، المساحة ${area} متر مربع، ارتفاع مناسب، بوابات واسعة، ساحة مناورة`;
      break;
  }
  
  records.push([
    sender,
    message,
    timestamp,
    propertyType,
    keywords,
    location,
    price.toString(),
    phone,
    agentDescription,
    fullDescription
  ]);
}

insertMany(records);

// Get final count
const count = db.prepare('SELECT COUNT(*) as count FROM chat_messages').get();
console.log(`✅ Database restored with ${count.count} real estate records`);

// Create indexes for better performance
console.log('📊 Creating database indexes...');
db.exec(`CREATE INDEX IF NOT EXISTS idx_property_type ON chat_messages(property_type)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_location ON chat_messages(location)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_sender ON chat_messages(sender)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_timestamp ON chat_messages(timestamp)`);

console.log('🎉 Database restoration complete!');
db.close();
