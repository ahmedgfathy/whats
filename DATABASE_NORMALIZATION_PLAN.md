# Database Normalization Plan
## Real Estate CRM - Neon PostgreSQL

### Current Issues Identified:
1. **Data Quality**: Many fields contain image filenames instead of proper values
2. **No Normalization**: Static values stored as text in main table
3. **Wrong Data Types**: Numbers stored as TEXT
4. **No Foreign Keys**: No relational integrity

### Normalization Strategy:

#### 1. Master/Lookup Tables to Create:
- `property_categories` - Arabic property categories
- `regions` - Geographic regions/areas
- `floor_types` - Floor numbers and types
- `listing_types` - For Sale/For Rent
- `finish_types` - Finished/Semi-Finished/Furnished
- `offered_by_types` - Owner/Brokers
- `payment_types` - Cash/Installment
- `payment_frequencies` - 3 Months/6 Months

#### 2. Data Type Corrections:
```sql
-- Numeric fields
unit_price: TEXT → DECIMAL(12,2)
deposit: TEXT → DECIMAL(12,2) 
payment: TEXT → DECIMAL(12,2)
amount: TEXT → DECIMAL(12,2)
bedroom: TEXT → INTEGER
bathroom: TEXT → INTEGER
building: TEXT → INTEGER (area_sqm)
floor_no: TEXT → INTEGER

-- Date fields
created_time: TEXT → TIMESTAMP
modified_time: TEXT → TIMESTAMP
```

#### 3. Foreign Key Relationships:
```sql
properties.property_category_id → property_categories.id
properties.region_id → regions.id
properties.floor_type_id → floor_types.id
properties.listing_type_id → listing_types.id
properties.finish_type_id → finish_types.id
properties.offered_by_id → offered_by_types.id
properties.payment_type_id → payment_types.id
properties.payment_frequency_id → payment_frequencies.id
```

#### 4. Data Cleanup Rules:
- Remove records with image filenames in critical fields
- Standardize Arabic text encoding
- Convert date formats to ISO timestamps
- Handle NULL/empty values appropriately

#### 5. Benefits for AI Integration:
- Consistent dropdown lists for frontend
- Proper data types for numerical analysis
- Clean categorical data for ML models
- Relational integrity for complex queries
- Normalized structure for GPT/Claude integration

### Execution Steps:
1. Create all lookup tables with seed data
2. Clean up corrupted data (image filenames)
3. Migrate clean data to new normalized structure
4. Update application code to use new schema
5. Add proper indexes and constraints
