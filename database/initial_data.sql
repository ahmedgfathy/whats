-- Initial Data for Real Estate Database
-- Insert static reference data

-- Insert Property Types
INSERT OR IGNORE INTO property_types (type_code, name_arabic, name_english, description_arabic, description_english) VALUES
('apartment', 'شقة', 'Apartment', 'وحدات سكنية في مباني متعددة الطوابق', 'Residential units in multi-story buildings'),
('villa', 'فيلا', 'Villa', 'منازل مستقلة أو متصلة مع حدائق', 'Independent or attached houses with gardens'),
('land', 'أرض', 'Land', 'قطع أراضي للبيع أو الاستثمار', 'Land plots for sale or investment'),
('office', 'مكتب', 'Office', 'مساحات تجارية ومكتبية', 'Commercial and office spaces'),
('warehouse', 'مخزن', 'Warehouse', 'مساحات للتخزين والتوزيع', 'Storage and distribution spaces'),
('shop', 'محل', 'Shop', 'محلات تجارية ومعارض', 'Commercial shops and showrooms'),
('building', 'عمارة', 'Building', 'مباني كاملة للبيع أو الاستثمار', 'Complete buildings for sale or investment'),
('penthouse', 'بنتهاوس', 'Penthouse', 'شقق علوية فاخرة', 'Luxury top-floor apartments'),
('studio', 'استوديو', 'Studio', 'وحدات سكنية صغيرة', 'Small residential units'),
('duplex', 'دوبلكس', 'Duplex', 'شقق على مستويين', 'Two-level apartments');

-- Insert Areas (Egyptian Real Estate Areas)
INSERT OR IGNORE INTO areas (name_arabic, name_english, city, district) VALUES
-- القاهرة الكبرى
('مدينة نصر', 'Nasr City', 'القاهرة', 'شرق القاهرة'),
('المعادي', 'Maadi', 'القاهرة', 'جنوب القاهرة'),
('الزمالك', 'Zamalek', 'القاهرة', 'وسط القاهرة'),
('مصر الجديدة', 'Heliopolis', 'القاهرة', 'شرق القاهرة'),
('المهندسين', 'Mohandessin', 'الجيزة', 'غرب القاهرة'),
('الدقي', 'Dokki', 'الجيزة', 'غرب القاهرة'),
('وسط البلد', 'Downtown', 'القاهرة', 'وسط القاهرة'),
('المقطم', 'Mokattam', 'القاهرة', 'شرق القاهرة'),
('حلوان', 'Helwan', 'القاهرة', 'جنوب القاهرة'),
('شبرا الخيمة', 'Shubra El Kheima', 'القليوبية', 'شمال القاهرة'),

-- القاهرة الجديدة والمدن الحديثة
('التجمع الخامس', 'Fifth Settlement', 'القاهرة الجديدة', 'شرق القاهرة'),
('التجمع الأول', 'First Settlement', 'القاهرة الجديدة', 'شرق القاهرة'),
('التجمع الثالث', 'Third Settlement', 'القاهرة الجديدة', 'شرق القاهرة'),
('الرحاب', 'Rehab', 'القاهرة الجديدة', 'شرق القاهرة'),
('مدينتي', 'Madinaty', 'القاهرة الجديدة', 'شرق القاهرة'),
('الشروق', 'El Shorouk', 'القاهرة الجديدة', 'شرق القاهرة'),
('بدر', 'Badr', 'القاهرة الجديدة', 'شرق القاهرة'),
('العبور', 'El Obour', 'القليوبية', 'شرق القاهرة'),

-- الجيزة والمدن الجديدة
('الشيخ زايد', 'Sheikh Zayed', 'الجيزة', 'غرب القاهرة'),
('6 أكتوبر', '6th of October', 'الجيزة', 'غرب القاهرة'),
('الحي العاشر', '10th District', 'الجيزة', 'غرب القاهرة'),
('الحي الحادي عشر', '11th District', 'الجيزة', 'غرب القاهرة'),
('الحي الثاني عشر', '12th District', 'الجيزة', 'غرب القاهرة'),
('دريم لاند', 'Dreamland', 'الجيزة', 'غرب القاهرة'),
('البياضية', 'El Byadeyah', 'الجيزة', 'غرب القاهرة'),

-- العاصمة الإدارية الجديدة
('العاصمة الإدارية', 'New Administrative Capital', 'العاصمة الإدارية', 'شرق القاهرة'),
('الحي الحكومي', 'Government District', 'العاصمة الإدارية', 'شرق القاهرة'),
('الحي المالي', 'Financial District', 'العاصمة الإدارية', 'شرق القاهرة'),
('الحي السكني الأول', 'R1 District', 'العاصمة الإدارية', 'شرق القاهرة'),
('الحي السكني الثالث', 'R3 District', 'العاصمة الإدارية', 'شرق القاهرة'),

-- مناطق أخرى
('العاشر من رمضان', '10th of Ramadan', 'الشرقية', 'شرق القاهرة'),
('الخصوص', 'El Khosous', 'القليوبية', 'شمال القاهرة'),
('المطرية', 'El Matareya', 'القاهرة', 'شمال القاهرة'),
('عين شمس', 'Ain Shams', 'القاهرة', 'شرق القاهرة'),
('النزهة', 'El Nozha', 'القاهرة', 'شرق القاهرة'),
('مصر القديمة', 'Old Cairo', 'القاهرة', 'جنوب القاهرة'),
('البساتين', 'El Basateen', 'القاهرة', 'جنوب القاهرة'),
('الهرم', 'Haram', 'الجيزة', 'غرب القاهرة'),
('فيصل', 'Faisal', 'الجيزة', 'غرب القاهرة'),

-- المحافظات القريبة
('القناطر الخيرية', 'El Kanater El Khaireyah', 'القليوبية', 'شمال القاهرة'),
('بنها', 'Benha', 'القليوبية', 'شمال القاهرة'),
('الفيوم', 'Fayoum', 'الفيوم', 'جنوب القاهرة'),
('بني سويف', 'Beni Suef', 'بني سويف', 'جنوب القاهرة');

-- Insert Default User
INSERT OR IGNORE INTO users (username, password, email, role) VALUES 
('xinreal', 'zerocall', 'admin@realestate.com', 'admin');

-- Insert Sample Agents with Egyptian Phone Numbers
INSERT OR IGNORE INTO agents (name, phone, phone_operator, company_name, specialization, years_experience, description) VALUES
('أحمد السمسار', '01234567890', '012', 'مكتب أحمد للعقارات', 'عقارات سكنية وتجارية', 8, 'سمسار عقاري محترف متخصص في العقارات السكنية والتجارية'),
('محمد العقاري', '01123456789', '011', 'شركة محمد للتطوير العقاري', 'فيلل ومشاريع سكنية', 12, 'خبرة أكثر من 10 سنوات في السوق العقاري المصري'),
('سارة للعقارات', '01012345678', '010', 'مؤسسة سارة للاستثمار العقاري', 'أراضي واستثمار عقاري', 6, 'وكيل عقاري معتمد ومتخصص في الاستثمار العقاري'),
('عمرو المطور', '01534567890', '015', 'شركة المستقبل للتطوير', 'مشاريع تجارية وإدارية', 15, 'مطور عقاري ومستشار في شراء وبيع العقارات'),
('فاطمة الوسطاء', '01098765432', '010', 'مكتب الثقة للعقارات', 'شقق وفيلل للإيجار', 5, 'سمسار معتمد لدى الشهر العقاري والتطوير العمراني'),
('خالد العقارات', '01187654321', '011', 'مجموعة خالد العقارية', 'عقارات فاخرة ومتميزة', 9, 'متخصص في العقارات الفاخرة والمشاريع المتميزة'),
('نورا المطورة', '01276543210', '012', 'شركة نورا للاستثمار', 'تطوير ومقاولات', 7, 'مطورة عقارية متخصصة في المشاريع السكنية الحديثة'),
('حسام الاستثمار', '01543210987', '015', 'مؤسسة الاستثمار الذكي', 'استثمار وإدارة عقارية', 11, 'خبير في الاستثمار العقاري وإدارة المحافظ العقارية'),
('منى البناء', '01065432109', '010', 'شركة منى للمقاولات', 'بناء وتطوير', 8, 'مقاول ومطور عقاري معتمد بخبرة واسعة'),
('أحمد الشريف', '01154321098', '011', 'مكتب الشريف العقاري', 'عقارات متنوعة', 6, 'سمسار عقاري شامل لجميع أنواع العقارات');

-- Phone Operator Reference Data (for validation)
CREATE TABLE IF NOT EXISTS phone_operators (
  code TEXT PRIMARY KEY,
  name_arabic TEXT NOT NULL,
  name_english TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1
);

INSERT OR IGNORE INTO phone_operators (code, name_arabic, name_english) VALUES
('010', 'فودافون', 'Vodafone'),
('011', 'اتصالات', 'Etisalat'),
('012', 'اورنج', 'Orange'),
('015', 'وي', 'WE');

-- Create Views for commonly used queries
CREATE VIEW IF NOT EXISTS property_details_view AS
SELECT 
  p.*,
  pt.name_arabic as property_type_name,
  pt.type_code,
  a.name_arabic as area_name,
  a.city,
  a.district,
  ag.name as agent_name,
  ag.phone as agent_phone,
  ag.company_name,
  ag.description as agent_description
FROM properties p
LEFT JOIN property_types pt ON p.property_type_id = pt.id
LEFT JOIN areas a ON p.area_id = a.id
LEFT JOIN agents ag ON p.agent_id = ag.id
WHERE p.is_available = 1;

CREATE VIEW IF NOT EXISTS agent_stats_view AS
SELECT 
  ag.id,
  ag.name,
  ag.phone,
  ag.phone_operator,
  ag.company_name,
  COUNT(p.id) as total_properties,
  AVG(p.price) as avg_price,
  MIN(p.price) as min_price,
  MAX(p.price) as max_price
FROM agents ag
LEFT JOIN properties p ON ag.id = p.agent_id AND p.is_available = 1
GROUP BY ag.id, ag.name, ag.phone, ag.phone_operator, ag.company_name;
