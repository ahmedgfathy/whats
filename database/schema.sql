-- Real Estate Chat Database Schema
-- SQLite Database Structure with Proper Relationships

-- 1. AREAS table (static reference data)
CREATE TABLE IF NOT EXISTS areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_arabic TEXT UNIQUE NOT NULL,        -- اسم المنطقة بالعربية
  name_english TEXT UNIQUE,                -- اسم المنطقة بالإنجليزية
  city TEXT NOT NULL,                      -- المدينة
  district TEXT,                           -- الحي
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROPERTY_TYPES table (static reference data)
CREATE TABLE IF NOT EXISTS property_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type_code TEXT UNIQUE NOT NULL,          -- apartment, villa, land, office, warehouse
  name_arabic TEXT NOT NULL,               -- شقة، فيلا، أرض، مكتب، مخزن
  name_english TEXT NOT NULL,              -- Apartment, Villa, Land, Office, Warehouse
  description_arabic TEXT,
  description_english TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. AGENTS table (real estate agents/brokers)
CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                      -- اسم السمسار
  phone TEXT UNIQUE,                       -- رقم الهاتف
  phone_operator TEXT,                     -- 010, 011, 012, 015
  email TEXT,
  company_name TEXT,                       -- اسم الشركة
  specialization TEXT,                     -- التخصص
  years_experience INTEGER,                -- سنوات الخبرة
  rating REAL DEFAULT 0,                   -- التقييم
  is_verified BOOLEAN DEFAULT 0,           -- موثق
  description TEXT,                        -- وصف السمسار
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. PROPERTIES table (main property listings)
CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER NOT NULL,
  property_type_id INTEGER NOT NULL,
  area_id INTEGER,
  title TEXT,                              -- عنوان العقار
  description TEXT,                        -- الوصف الكامل
  price DECIMAL(15,2),                     -- السعر
  price_text TEXT,                         -- النص الأصلي للسعر
  currency TEXT DEFAULT 'EGP',
  transaction_type TEXT,                   -- للبيع، للإيجار
  
  -- Property Details
  area_size REAL,                          -- المساحة بالمتر المربع
  rooms INTEGER,                           -- عدد الغرف
  bathrooms INTEGER,                       -- عدد الحمامات
  floor_number INTEGER,                    -- رقم الدور
  total_floors INTEGER,                    -- إجمالي الأدوار
  has_elevator BOOLEAN DEFAULT 0,          -- يوجد أسانسير
  has_garage BOOLEAN DEFAULT 0,            -- يوجد جراج
  has_garden BOOLEAN DEFAULT 0,            -- يوجد حديقة
  has_pool BOOLEAN DEFAULT 0,              -- يوجد مسبح
  
  -- Location Details
  address TEXT,                            -- العنوان التفصيلي
  street_width REAL,                       -- عرض الشارع
  is_main_street BOOLEAN DEFAULT 0,        -- على شارع رئيسي
  
  -- Status
  is_available BOOLEAN DEFAULT 1,
  is_featured BOOLEAN DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (property_type_id) REFERENCES property_types(id),
  FOREIGN KEY (area_id) REFERENCES areas(id)
);

-- 5. CHAT_MESSAGES table (WhatsApp messages)
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER,                     -- ربط بالعقار إذا تم استخراجه
  agent_id INTEGER,                        -- ربط بالسمسار
  sender_name TEXT NOT NULL,               -- اسم المرسل الأصلي
  message_text TEXT NOT NULL,              -- نص الرسالة الأصلي
  message_date DATETIME,                   -- تاريخ الرسالة الأصلي
  
  -- Extracted Data
  extracted_price TEXT,                    -- السعر المستخرج
  extracted_area_size REAL,               -- المساحة المستخرجة
  extracted_location TEXT,                 -- الموقع المستخرج
  keywords TEXT,                           -- الكلمات المفتاحية
  
  -- Processing Status
  is_processed BOOLEAN DEFAULT 0,          -- تم معالجتها
  confidence_score REAL,                   -- درجة الثقة في الاستخراج
  processing_notes TEXT,                   -- ملاحظات المعالجة
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- 6. PROPERTY_IMAGES table (صور العقارات)
CREATE TABLE IF NOT EXISTS property_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  image_title TEXT,
  is_primary BOOLEAN DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- 7. USERS table (نظام المستخدمين)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user',                -- admin, user, agent
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. SEARCH_HISTORY table (تاريخ البحث)
CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  search_term TEXT NOT NULL,
  property_type_filter TEXT,
  area_filter TEXT,
  results_count INTEGER,
  search_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. PROPERTY_FAVORITES table (العقارات المفضلة)
CREATE TABLE IF NOT EXISTS property_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id),
  UNIQUE(user_id, property_id)
);

-- INDEXES for better performance
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type_id);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area_id);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_name);
CREATE INDEX IF NOT EXISTS idx_chat_messages_date ON chat_messages(message_date);
CREATE INDEX IF NOT EXISTS idx_agents_phone ON agents(phone);
CREATE INDEX IF NOT EXISTS idx_agents_operator ON agents(phone_operator);

-- TRIGGERS for automatic updates
CREATE TRIGGER IF NOT EXISTS update_properties_timestamp 
AFTER UPDATE ON properties 
BEGIN
  UPDATE properties SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_agents_timestamp 
AFTER UPDATE ON agents 
BEGIN
  UPDATE agents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
