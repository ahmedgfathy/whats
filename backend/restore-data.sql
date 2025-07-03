-- SQL script to restore original data
.echo on

-- Drop existing tables
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS csv_imports;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create main chat messages table (for WhatsApp imports)
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
);

-- Create CSV imports tracking table
CREATE TABLE csv_imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  file_name TEXT,
  total_records INTEGER,
  imported_records INTEGER,
  headers TEXT,
  import_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user
INSERT OR IGNORE INTO users (username, password) VALUES ('xinreal', 'zerocall');

-- Insert comprehensive sample data (condensed version)
-- This represents what would be 2000+ real estate records

INSERT INTO chat_messages (sender, message, timestamp, property_type, keywords, location, price, agent_phone, agent_description, full_description) VALUES
('أحمد السمسار', 'شقة للبيع في القاهرة الجديدة مساحة 120 متر 3 غرف نوم وصالة ومطبخ و2 حمام الدور 5 السعر 850 ألف جنيه', '2024-01-15 10:30:00', 'apartment', 'apartment, القاهرة الجديدة, 120م, 850', 'القاهرة الجديدة', '850000', '01001834520', 'أحمد السمسار - سمسار عقاري محترف متخصص في القاهرة الجديدة', 'شقة مميزة في القاهرة الجديدة بمساحة 120 متر مربع، تتكون من 3 غرف نوم و2 حمام وصالة ومطبخ، الدور 5، تشطيب عالي الجودة، موقع متميز قريب من الخدمات والمواصلات'),
('محمد العقاري', 'فيلا مستقلة في التجمع الخامس مساحة الأرض 400 متر والمباني 280 متر 4 غرف ماستر + ريسيبشن كامل السعر 4.5 مليون جنيه', '2024-01-15 11:15:00', 'villa', 'villa, التجمع الخامس, 280م, 4.5', 'التجمع الخامس', '4500000', '01000306580', 'محمد العقاري - سمسار عقاري محترف متخصص في التجمع الخامس', 'فيلا فاخرة في التجمع الخامس بمساحة 280 متر مربع، تصميم عصري، 4 غرف نوم ماستر، حديقة منسقة، جراج مغطى، أمن وحراسة 24 ساعة'),
('فاطمة المطور', 'أرض للبيع في الشروق مساحة 500 متر على الشارع الرئيسي مرافق متاحة السعر 25 ألف للمتر', '2024-01-15 12:00:00', 'land', 'land, الشروق, 500م, 25', 'الشروق', '25000', '01093335990', 'فاطمة المطور - سمسار عقاري محترف متخصص في الشروق', 'قطعة أرض في موقع مميز بـالشروق، المساحة 500 متر مربع، على شارع رئيسي، مرافق متاحة، صالحة للبناء السكني أو التجاري'),
('علي الوسيط', 'مكتب تجاري في المعادي مساحة 150 متر في برج إداري الدور 8 تشطيب كامل السعر 1200 ألف جنيه', '2024-01-15 13:30:00', 'office', 'office, المعادي, 150م, 1200', 'المعادي', '1200000', '01025853777', 'علي الوسيط - سمسار عقاري محترف متخصص في المعادي', 'مكتب في برج تجاري بـالمعادي، المساحة 150 متر مربع، الدور 8، تشطيب راقي، أمن وحراسة، موقف سيارات'),
('مريم السكن', 'مخزن للبيع في العبور مساحة 300 متر ارتفاع مناسب واجهة واسعة السعر 900 ألف جنيه', '2024-01-15 14:45:00', 'warehouse', 'warehouse, العبور, 300م, 900', 'العبور', '900000', '01060470812', 'مريم السكن - سمسار عقاري محترف متخصص في العبور', 'مخزن في منطقة صناعية بـالعبور، المساحة 300 متر مربع، ارتفاع مناسب، بوابات واسعة، ساحة مناورة');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_type ON chat_messages(property_type);
CREATE INDEX IF NOT EXISTS idx_location ON chat_messages(location);
CREATE INDEX IF NOT EXISTS idx_sender ON chat_messages(sender);
CREATE INDEX IF NOT EXISTS idx_timestamp ON chat_messages(timestamp);

-- Show the count
SELECT 'Database restored with ' || COUNT(*) || ' records' as result FROM chat_messages;
