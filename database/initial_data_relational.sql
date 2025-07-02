-- Initial Data for Real Estate Chat Database
-- Static and reference data

-- Insert Property Types
INSERT INTO property_types (code, name_arabic, name_english, keywords) VALUES
('apartment', 'شقة', 'Apartment', '["شقة", "شقق", "دور", "أدوار", "طابق", "غرفة", "غرف", "استوديو"]'),
('villa', 'فيلا', 'Villa', '["فيلا", "فيلات", "قصر", "قصور", "بيت", "بيوت", "منزل", "منازل", "دوبلكس", "تاون هاوس"]'),
('land', 'أرض', 'Land', '["أرض", "أراضي", "قطعة", "قطع", "مساحة", "متر", "فدان", "قيراط"]'),
('office', 'مكتب', 'Office', '["مكتب", "مكاتب", "إداري", "تجاري", "محل", "محلات", "عيادة", "عيادات"]'),
('warehouse', 'مخزن', 'Warehouse', '["مخزن", "مخازن", "مستودع", "مستودعات", "ورشة", "ورش", "مصنع"]');

-- Insert Areas/Locations (Common Cairo and Giza areas)
INSERT INTO areas (name, name_arabic, city, region) VALUES
-- New Cairo Areas
('New Cairo', 'القاهرة الجديدة', 'Cairo', 'East Cairo'),
('Fifth Settlement', 'التجمع الخامس', 'Cairo', 'East Cairo'),
('First Settlement', 'التجمع الأول', 'Cairo', 'East Cairo'),
('Third Settlement', 'التجمع الثالث', 'Cairo', 'East Cairo'),
('Madinaty', 'مدينتي', 'Cairo', 'East Cairo'),
('Rehab City', 'الرحاب', 'Cairo', 'East Cairo'),
('Shorouk City', 'الشروق', 'Cairo', 'East Cairo'),
('Badr City', 'بدر', 'Cairo', 'East Cairo'),
('10th District', 'الحي العاشر', 'Cairo', 'East Cairo'),

-- Giza Areas
('6th October', '6 أكتوبر', 'Giza', 'West Cairo'),
('Sheikh Zayed', 'الشيخ زايد', 'Giza', 'West Cairo'),
('Beverly Hills', 'بيفرلي هيلز', 'Giza', 'West Cairo'),
('Allegria', 'اليجريا', 'Giza', 'West Cairo'),
('Palm Hills', 'بالم هيلز', 'Giza', 'West Cairo'),
('Zayed 2000', 'زايد 2000', 'Giza', 'West Cairo'),
('Pyramids', 'الأهرام', 'Giza', 'West Cairo'),
('Haram', 'الهرم', 'Giza', 'West Cairo'),

-- Central Cairo
('Zamalek', 'الزمالك', 'Cairo', 'Central Cairo'),
('Downtown', 'وسط البلد', 'Cairo', 'Central Cairo'),
('Garden City', 'جاردن سيتي', 'Cairo', 'Central Cairo'),
('Kasr El Nil', 'قصر النيل', 'Cairo', 'Central Cairo'),
('Heliopolis', 'مصر الجديدة', 'Cairo', 'North Cairo'),
('Nasr City', 'مدينة نصر', 'Cairo', 'North Cairo'),
('Maadi', 'المعادي', 'Cairo', 'South Cairo'),
('Mohandessin', 'المهندسين', 'Giza', 'Central Giza'),
('Dokki', 'الدقي', 'Giza', 'Central Giza'),
('Agouza', 'العجوزة', 'Giza', 'Central Giza');

-- Insert Default User
INSERT INTO users (username, password, email, role) VALUES
('xinreal', 'zerocall', 'admin@xinreal.com', 'admin');

-- Insert Sample Agents with Egyptian phone numbers
INSERT INTO agents (name, phone, phone_verified, phone_carrier, description) VALUES
('أحمد السمسار', '01234567890', 1, 'Vodafone', 'أحمد السمسار - سمسار عقاري محترف متخصص في العقارات السكنية والتجارية، خبرة أكثر من 5 سنوات'),
('محمد العقاري', '01123456789', 1, 'Orange', 'محمد العقاري - خبرة أكثر من 10 سنوات في السوق العقاري المصري، متخصص في الفيلل والعقارات الفاخرة'),
('سارة للعقارات', '01012345678', 1, 'Etisalat', 'سارة للعقارات - وكيل عقاري معتمد ومتخصص في الاستثمار العقاري والأراضي'),
('خالد الاستثمار', '01567890123', 1, 'WE', 'خالد الاستثمار - مستشار عقاري ومطور، متخصص في المشاريع الكبرى والعقارات التجارية'),
('فاطمة العقارية', '01098765432', 1, 'Vodafone', 'فاطمة العقارية - سمسار معتمد لدى الشهر العقاري، خبرة واسعة في عقارات القاهرة الجديدة'),
('عمرو المطور', '01187654321', 1, 'Orange', 'عمرو المطور - مطور عقاري ومستشار في شراء وبيع العقارات السكنية والتجارية');

-- Insert Sample Chat Messages
INSERT INTO chat_messages (agent_id, property_type_id, area_id, message, timestamp, sender_name) VALUES
(1, 1, 9, 'شقة للبيع في الحي العاشر مساحة 120 متر 3 غرف نوم وصالة ومطبخ وحمامين الدور الثالث بأسانسير السعر 850 ألف جنيه', '2/7/2025, 8:51:23 PM', 'أحمد السمسار'),
(2, 2, 5, 'فيلا دوبلكس للإيجار في التجمع الخامس 250 متر مبني على قطعة 300 متر 4 غرف نوم وصالتين ومطبخ وحديقة', '2/7/2025, 8:52:15 PM', 'محمد العقاري'),
(3, 3, 12, 'أرض للبيع في الشيخ زايد 500 متر على شارع رئيسي مباشرة موقع مميز جداً', '2/7/2025, 8:53:42 PM', 'سارة للعقارات'),
(1, 1, 21, 'شقة في الزمالك للبيع 150 متر 3 غرف وصالة كبيرة إطلالة على النيل الدور الخامس', '2/7/2025, 9:15:30 PM', 'أحمد السمسار'),
(4, 4, 25, 'مكتب إداري في المهندسين للإيجار 80 متر مقسم غرف ومكيف بالكامل', '2/7/2025, 9:30:45 PM', 'خالد الاستثمار'),
(2, 2, 10, 'فيلا ستاند الون في 6 أكتوبر 300 متر 4 غرف ماستر وحديقة وجراج مغطى', '2/7/2025, 10:00:12 PM', 'محمد العقاري');

-- Insert Sample Properties with detailed information
INSERT INTO properties (
    message_id, agent_id, property_type_id, area_id,
    price_text, price_numeric, area_size, rooms, bathrooms, floor_number, has_elevator,
    features, keywords, is_for_sale, is_for_rent
) VALUES
-- Apartment in 10th District
(1, 1, 1, 9, '850 ألف جنيه', 850000, 120, 3, 2, 3, 1,
 '["أسانسير", "مطبخ", "صالة"]', 'شقة, غرف, مطبخ, حمام, أسانسير', 1, 0),

-- Villa in 5th Settlement  
(2, 2, 2, 5, '15000 جنيه شهرياً', 15000, 250, 4, 3, NULL, 0,
 '["دوبلكس", "حديقة", "جراج"]', 'فيلا, حديقة, غرف, دوبلكس', 0, 1),

-- Land in Sheikh Zayed
(3, 3, 3, 12, '2.5 مليون جنيه', 2500000, 500, NULL, NULL, NULL, 0,
 '["شارع رئيسي", "موقع مميز"]', 'أرض, شارع رئيسي', 1, 0),

-- Apartment in Zamalek
(4, 1, 1, 21, NULL, NULL, 150, 3, 2, 5, 1,
 '["إطلالة على النيل", "صالة كبيرة"]', 'شقة, غرف, صالة, إطلالة, النيل', 1, 0),

-- Office in Mohandessin
(5, 4, 4, 25, NULL, NULL, 80, NULL, NULL, NULL, 0,
 '["مكيف", "مقسم غرف", "إداري"]', 'مكتب, إداري, مكيف, غرف', 0, 1),

-- Villa in 6th October
(6, 2, 2, 10, NULL, NULL, 300, 4, 4, NULL, 0,
 '["ستاند الون", "غرف ماستر", "حديقة", "جراج مغطى"]', 'فيلا, ستاند الون, غرف, ماستر, حديقة, جراج', 1, 0);

-- Update agent property counts
UPDATE agents SET total_properties = (
    SELECT COUNT(*) FROM properties WHERE agent_id = agents.id
);
