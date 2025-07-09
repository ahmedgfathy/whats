# Normalized Database Structure
## Real Estate CRM - Neon PostgreSQL

### Database Normalization Complete ✅
**Date:** July 9, 2025  
**Status:** Migration in progress  
**Target:** Full relational database with master/lookup tables  

---

## 🏗️ Database Architecture

### Master/Lookup Tables

#### 1. `property_categories`
Arabic property categories with English translations for frontend filtering.
```sql
- id (SERIAL PRIMARY KEY)
- name_ar (TEXT) - Arabic name: "شقق كمبوند", "فيلات مستقلة", etc.
- name_en (TEXT) - English name: "Compound Apartments", "Independent Villas"
- description (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 2. `regions`
Geographic regions and areas with hierarchical support.
```sql
- id (SERIAL PRIMARY KEY)
- name (TEXT) - Region name: "ستيلا هايتس الساحل", "بيت الوطن"
- parent_region_id (INTEGER) - Self-referencing for hierarchy
- description (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 3. `floor_types`
Floor numbers and special types (Villa, Ground Floor, etc.).
```sql
- id (SERIAL PRIMARY KEY)
- name (TEXT) - "1", "2", "Villa", "Ground Floor", "Roof"
- floor_number (INTEGER) - Numeric value for sorting
- description (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 4. `listing_types`
Property listing types (For Sale, For Rent).
```sql
- id (SERIAL PRIMARY KEY)
- name (TEXT) - "For Sale", "For Rent"
- description (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 5. `finish_types`
Property finish levels.
```sql
- id (SERIAL PRIMARY KEY)
- name (TEXT) - "Finished", "Semi-Finished", "Furnished"
- description (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 6. `offered_by_types`
Who is offering the property.
```sql
- id (SERIAL PRIMARY KEY)
- name (TEXT) - "Owner", "Brokers"
- description (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 7. `payment_types`
Payment methods.
```sql
- id (SERIAL PRIMARY KEY)
- name (TEXT) - "Cash", "Installment"
- description (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 8. `payment_frequencies`
Payment frequency for installments.
```sql
- id (SERIAL PRIMARY KEY)
- name (TEXT) - "3 Months", "6 Months"
- months (INTEGER) - Numeric value for calculations
- description (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

---

### Main Table

#### `properties_normalized`
The main properties table with proper foreign key relationships and data types.

```sql
CREATE TABLE properties_normalized (
  -- Primary Key
  id SERIAL PRIMARY KEY,
  
  -- Basic Info
  property_name TEXT,
  property_number TEXT,
  
  -- Foreign Key References
  property_category_id INTEGER REFERENCES property_categories(id),
  region_id INTEGER REFERENCES regions(id),
  floor_type_id INTEGER REFERENCES floor_types(id),
  listing_type_id INTEGER REFERENCES listing_types(id),
  finish_type_id INTEGER REFERENCES finish_types(id),
  offered_by_id INTEGER REFERENCES offered_by_types(id),
  payment_type_id INTEGER REFERENCES payment_types(id),
  payment_frequency_id INTEGER REFERENCES payment_frequencies(id),
  
  -- Properly Typed Numeric Fields
  area_sqm INTEGER,              -- Area in square meters
  bedrooms INTEGER,              -- Number of bedrooms
  bathrooms INTEGER,             -- Number of bathrooms
  unit_price DECIMAL(12,2),      -- Price in EGP
  deposit DECIMAL(12,2),         -- Deposit amount
  payment_amount DECIMAL(12,2),  -- Payment amount
  total_amount DECIMAL(12,2),    -- Total amount
  
  -- Date Fields
  created_at TIMESTAMP,
  modified_at TIMESTAMP,
  
  -- Text Fields
  building TEXT,                 -- Building details
  land_garden TEXT,              -- Land/garden info
  last_modified_by TEXT,         -- Last modifier
  update_unit TEXT,              -- Update unit
  owner_name TEXT,               -- Owner name
  mobile_no TEXT,                -- Mobile number
  telephone TEXT,                -- Telephone
  description TEXT,              -- Property description
  sales_notes TEXT,              -- Sales notes
  sales TEXT,                    -- Sales info
  handler TEXT,                  -- Handler
  property_image TEXT,           -- Image path
  
  -- System Fields
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  data_quality_score INTEGER DEFAULT 100
);
```

---

## 🔗 Foreign Key Relationships

```sql
properties_normalized.property_category_id → property_categories.id
properties_normalized.region_id → regions.id
properties_normalized.floor_type_id → floor_types.id
properties_normalized.listing_type_id → listing_types.id
properties_normalized.finish_type_id → finish_types.id
properties_normalized.offered_by_id → offered_by_types.id
properties_normalized.payment_type_id → payment_types.id
properties_normalized.payment_frequency_id → payment_frequencies.id
```

---

## 📊 Indexes for Performance

```sql
CREATE INDEX idx_props_category ON properties_normalized(property_category_id);
CREATE INDEX idx_props_region ON properties_normalized(region_id);
CREATE INDEX idx_props_listing_type ON properties_normalized(listing_type_id);
CREATE INDEX idx_props_price ON properties_normalized(unit_price);
CREATE INDEX idx_props_bedrooms ON properties_normalized(bedrooms);
CREATE INDEX idx_props_area ON properties_normalized(area_sqm);
CREATE INDEX idx_props_active ON properties_normalized(is_active);
```

---

## 🔍 Common Queries

### Get Properties with All Related Data
```sql
SELECT 
  pn.*,
  pc.name_ar as category_ar,
  pc.name_en as category_en,
  r.name as region_name,
  lt.name as listing_type_name,
  ft.name as floor_type_name,
  finst.name as finish_type_name,
  obt.name as offered_by_name,
  pt.name as payment_type_name,
  pf.name as payment_frequency_name
FROM properties_normalized pn
LEFT JOIN property_categories pc ON pn.property_category_id = pc.id
LEFT JOIN regions r ON pn.region_id = r.id
LEFT JOIN listing_types lt ON pn.listing_type_id = lt.id
LEFT JOIN floor_types ft ON pn.floor_type_id = ft.id
LEFT JOIN finish_types finst ON pn.finish_type_id = finst.id
LEFT JOIN offered_by_types obt ON pn.offered_by_id = obt.id
LEFT JOIN payment_types pt ON pn.payment_type_id = pt.id
LEFT JOIN payment_frequencies pf ON pn.payment_frequency_id = pf.id
WHERE pn.is_active = true;
```

### Statistics by Category
```sql
SELECT 
  pc.name_en as category,
  COUNT(*) as total_properties,
  AVG(pn.unit_price) as avg_price,
  MIN(pn.unit_price) as min_price,
  MAX(pn.unit_price) as max_price
FROM properties_normalized pn
LEFT JOIN property_categories pc ON pn.property_category_id = pc.id
WHERE pn.unit_price IS NOT NULL
GROUP BY pc.name_en
ORDER BY total_properties DESC;
```

---

## 🚀 API Endpoints Updated

### 1. `/api/stats` ✅
- Updated to use `properties_normalized` with joins
- Returns English category names for frontend compatibility

### 2. `/api/messages` ✅
- Full join query with all related tables
- Enhanced search across normalized fields
- Proper pagination with foreign key data

### 3. `/api/dropdowns` 🆕
- New endpoint providing all dropdown data
- Returns structured data for frontend forms
- Includes Arabic/English category names

---

## 🎯 Benefits for AI Integration

### 1. **Clean Data Structure**
- Proper data types for numerical analysis
- Consistent categorical data
- No more image filenames in critical fields

### 2. **Dropdown Lists**
- Standardized options for all forms
- Consistent data entry
- Better user experience

### 3. **Relational Integrity**
- Foreign key constraints ensure data quality
- Easy to add new lookup values
- Scalable for future enhancements

### 4. **AI Model Ready**
- Numerical fields for price prediction models
- Categorical fields for classification
- Clean text data for NLP processing
- Proper structure for GPT/Claude integration

---

## 📈 Migration Status

**Current Progress:** In progress  
**Source:** `properties` table (39,116 records)  
**Target:** `properties_normalized` table  
**Clean Records:** ~37,319 (after filtering corrupted data)  

**Data Quality Improvements:**
- ❌ Removed image filenames from critical fields
- ✅ Converted text numbers to proper INTEGER/DECIMAL
- ✅ Standardized date formats
- ✅ Created foreign key relationships
- ✅ Added data validation constraints

---

## 🔄 Next Steps

1. **Complete Migration** - Finish migrating all clean records
2. **Update Frontend** - Modify forms to use dropdown APIs
3. **Add Validation** - Implement data validation in forms
4. **AI Integration** - Prepare endpoints for AI model integration
5. **Analytics Dashboard** - Create advanced analytics using normalized data
