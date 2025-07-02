# Real Estate Chat Database Schema

## 📊 Database Tables Structure

### 1. **users** table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. **chat_messages** table
```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender TEXT NOT NULL,                    -- اسم المرسل
  message TEXT NOT NULL,                   -- نص الرسالة
  timestamp TEXT,                          -- وقت الرسالة
  property_type TEXT,                      -- نوع العقار (apartment, villa, land, office, warehouse)
  keywords TEXT,                           -- الكلمات المفتاحية المستخرجة
  location TEXT,                           -- الموقع المستخرج
  price TEXT,                             -- السعر المستخرج
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📈 Sample Data Structure

### Example Records:
```javascript
{
  id: 1,
  sender: "أحمد السمسار",
  message: "شقة للبيع في الحي العاشر مساحة 120 متر 3 غرف نوم",
  timestamp: "1/7/25, 10:30:25 AM",
  property_type: "apartment",
  keywords: "شقة, غرف, متر",
  location: "الحي العاشر", 
  price: "850 ألف جنيه"
}
```

## 🔍 Property Types Classification:
- **apartment**: شقة، شقق، دور، أدوار، طابق، غرفة، غرف
- **villa**: فيلا، فيلات، قصر، قصور، بيت، بيوت، منزل، دوبلكس
- **land**: أرض، أراضي، قطعة، قطع، مساحة، متر، فدان
- **office**: مكتب، مكاتب، إداري، تجاري، محل، محلات
- **warehouse**: مخزن، مخازن، مستودع، مستودعات، ورشة
