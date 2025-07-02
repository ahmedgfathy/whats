-- Real Estate Chat Database Schema
-- Normalized relational database structure

-- 1. Areas/Locations Table (Static data)
CREATE TABLE areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    name_arabic TEXT NOT NULL,
    city TEXT,
    region TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Property Types Table (Static data)
CREATE TABLE property_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL, -- apartment, villa, land, office, warehouse
    name_arabic TEXT NOT NULL,
    name_english TEXT NOT NULL,
    keywords TEXT, -- JSON array of Arabic keywords
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Agents Table
CREATE TABLE agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT 0,
    phone_carrier TEXT, -- 010=Vodafone, 012=Orange, 011=Etisalat, 015=WE
    description TEXT,
    total_properties INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Users Table (Authentication)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'user',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Chat Messages Table (Main table)
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER,
    property_type_id INTEGER,
    area_id INTEGER,
    message TEXT NOT NULL,
    timestamp TEXT,
    sender_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    FOREIGN KEY (property_type_id) REFERENCES property_types(id),
    FOREIGN KEY (area_id) REFERENCES areas(id)
);

-- 6. Properties Table (Extracted property details)
CREATE TABLE properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER UNIQUE NOT NULL,
    agent_id INTEGER,
    property_type_id INTEGER NOT NULL,
    area_id INTEGER,
    
    -- Property details
    price_text TEXT,
    price_numeric DECIMAL(15,2),
    currency TEXT DEFAULT 'EGP',
    area_size INTEGER, -- in square meters
    rooms INTEGER,
    bathrooms INTEGER,
    floor_number INTEGER,
    has_elevator BOOLEAN DEFAULT 0,
    has_garden BOOLEAN DEFAULT 0,
    has_garage BOOLEAN DEFAULT 0,
    
    -- Location details
    street_width INTEGER,
    on_main_street BOOLEAN DEFAULT 0,
    
    -- Additional features (JSON)
    features TEXT, -- JSON array of features
    keywords TEXT, -- Extracted keywords
    
    -- Status
    is_for_sale BOOLEAN DEFAULT 1,
    is_for_rent BOOLEAN DEFAULT 0,
    is_available BOOLEAN DEFAULT 1,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    FOREIGN KEY (property_type_id) REFERENCES property_types(id),
    FOREIGN KEY (area_id) REFERENCES areas(id)
);

-- 7. Property Images Table (Future use)
CREATE TABLE property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    image_type TEXT DEFAULT 'external', -- external, interior, map
    is_primary BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- 8. Search Logs Table (Analytics)
CREATE TABLE search_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_term TEXT,
    property_type_filter TEXT,
    area_filter TEXT,
    results_count INTEGER,
    user_id INTEGER,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX idx_chat_messages_agent ON chat_messages(agent_id);
CREATE INDEX idx_chat_messages_property_type ON chat_messages(property_type_id);
CREATE INDEX idx_chat_messages_area ON chat_messages(area_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_type ON properties(property_type_id);
CREATE INDEX idx_properties_area ON properties(area_id);
CREATE INDEX idx_properties_price ON properties(price_numeric);
CREATE INDEX idx_properties_area_size ON properties(area_size);
CREATE INDEX idx_properties_availability ON properties(is_available);

CREATE INDEX idx_agents_phone ON agents(phone);
CREATE INDEX idx_agents_verified ON agents(phone_verified);

-- Views for common queries
CREATE VIEW property_details_view AS
SELECT 
    p.id as property_id,
    cm.id as message_id,
    cm.message,
    cm.sender_name,
    cm.timestamp,
    pt.name_arabic as property_type_name,
    pt.code as property_type_code,
    a_area.name_arabic as area_name,
    a_agent.name as agent_name,
    a_agent.phone as agent_phone,
    a_agent.phone_carrier,
    p.price_text,
    p.price_numeric,
    p.area_size,
    p.rooms,
    p.bathrooms,
    p.features,
    p.keywords,
    p.is_for_sale,
    p.is_for_rent,
    p.is_available,
    p.created_at
FROM properties p
JOIN chat_messages cm ON p.message_id = cm.id
JOIN property_types pt ON p.property_type_id = pt.id
LEFT JOIN areas a_area ON p.area_id = a_area.id
LEFT JOIN agents a_agent ON p.agent_id = a_agent.id;

CREATE VIEW agent_statistics_view AS
SELECT 
    a.id,
    a.name,
    a.phone,
    a.phone_carrier,
    COUNT(p.id) as total_properties,
    COUNT(CASE WHEN p.is_for_sale = 1 THEN 1 END) as properties_for_sale,
    COUNT(CASE WHEN p.is_for_rent = 1 THEN 1 END) as properties_for_rent,
    AVG(p.price_numeric) as avg_price,
    MIN(p.price_numeric) as min_price,
    MAX(p.price_numeric) as max_price
FROM agents a
LEFT JOIN properties p ON a.id = p.agent_id
GROUP BY a.id;

-- Triggers for maintaining data integrity
CREATE TRIGGER update_agent_property_count 
    AFTER INSERT ON properties
BEGIN
    UPDATE agents 
    SET total_properties = (
        SELECT COUNT(*) FROM properties WHERE agent_id = NEW.agent_id
    )
    WHERE id = NEW.agent_id;
END;

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
BEGIN
    UPDATE properties SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
BEGIN
    UPDATE agents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
