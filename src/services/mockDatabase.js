// Mock database service for frontend demo
// In production, this would connect to a backend API

// Helper functions for generating data
const extractKeywordsFromMessage = (message) => {
  const keywords = [];
  const propertyKeywords = ['شقة', 'فيلا', 'أرض', 'مكتب', 'مخزن', 'غرف', 'متر', 'حديقة', 'جراج', 'أسانسير'];
  
  propertyKeywords.forEach(keyword => {
    if (message.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  return keywords.join(', ');
};

const generatePhoneNumber = () => {
  return `0${Math.floor(Math.random() * 2) + 1}${Math.floor(Math.random() * 9000000000) + 1000000000}`;
};

const generateAgentDescription = (agentName) => {
  const descriptions = [
    `${agentName} - سمسار عقاري محترف متخصص في العقارات السكنية والتجارية`,
    `${agentName} - خبرة أكثر من 10 سنوات في السوق العقاري المصري`,
    `${agentName} - وكيل عقاري معتمد ومتخصص في الاستثمار العقاري`,
    `${agentName} - مطور عقاري ومستشار في شراء وبيع العقارات`,
    `${agentName} - سمسار معتمد لدى الشهر العقاري والتطوير العمراني`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const generateFullDescription = (type, area, location) => {
  const baseDesc = {
    apartment: `شقة مميزة في موقع استراتيجي بـ${location}، المساحة ${area} متر مربع، تشطيبات عالية الجودة، إطلالة رائعة، قريبة من المواصلات والخدمات، تصلح للسكن أو الاستثمار.`,
    villa: `فيلا فاخرة في ${location} بمساحة ${area} متر مربع، تصميم عصري، حديقة منسقة، جراج مغطى، أمن وحراسة 24 ساعة، موقع هادئ ومميز.`,
    land: `قطعة أرض في موقع مميز بـ${location}، المساحة ${area} متر مربع، على شارع رئيسي، مرافق متاحة، صالحة للبناء السكني أو التجاري، استثمار مضمون.`,
    office: `مكتب في برج تجاري بـ${location}، المساحة ${area} متر مربع، تشطيب راقي، أمن وحراسة، موقف سيارات، مناسب لجميع الأنشطة التجارية.`,
    warehouse: `مخزن في منطقة صناعية بـ${location}، المساحة ${area} متر مربع، ارتفاع مناسب، بوابات واسعة، ساحة مناورة، مناسب للتخزين والتوزيع.`
  };
  
  return baseDesc[type];
};

// Generate realistic sample data
const generateSampleData = () => {
  const senders = [
    'أحمد السمسار', 'محمد العقاري', 'سارة للعقارات', 'عمرو المطور', 'مكتب النور',
    'فاطمة الوسطاء', 'خالد العقارات', 'نورا المطورة', 'حسام الاستثمار', 'منى البناء',
    'أحمد الشريف', 'سعد المكتب', 'ليلى التطوير', 'عمار السمسار', 'دينا العقارية',
    'مصطفى التسويق', 'رانيا الاستثمار', 'طارق المشاريع', 'هنا العقارات', 'وليد التطوير'
  ];

  const locations = [
    'الحي العاشر', 'التجمع الخامس', 'الشيخ زايد', 'مدينة نصر', 'المعادي', '6 أكتوبر',
    'الرحاب', 'شارع الهرم', 'الزمالك', 'مدينة بدر', 'مصر الجديدة', 'الفيوم', 'وسط البلد',
    'المهندسين', 'الشروق', 'العبور', 'بدر', 'الخصوص', 'شبرا الخيمة', 'القاهرة الجديدة',
    'العاصمة الإدارية', 'مدينتي', 'الرحاب', 'المقطم', 'حلوان', 'المطرية', 'عين شمس',
    'النزهة', 'مصر القديمة', 'الدقي', 'الجيزة', 'فيصل', 'الهرم', 'البساتين'
  ];

  const apartmentMessages = [
    'شقة للبيع في {location} مساحة {area} متر {rooms} غرف نوم وصالة ومطبخ وحمامين الدور الثالث بأسانسير',
    'شقة مفروشة للإيجار في {location} {area} متر غرفتين وصالة ومطبخ وحمام إطلالة رائعة',
    'شقة للإيجار في {location} {area} متر {rooms} غرف وصالة كبيرة ومطبخ وحمامين',
    'شقة دور أرضي في {location} {area} متر {rooms} غرف وصالة وحديقة صغيرة',
    'شقة علوي في {location} {area} متر قريب من المواصلات للبيع بسعر ممتاز',
    'شقة بالقرب من {location} {area} متر {rooms} غرف ماستر وصالة واسعة ومطبخ أمريكي'
  ];

  const villaMessages = [
    'فيلا دوبلكس للإيجار في {location} {area} متر مبني على قطعة {landArea} متر {rooms} غرف نوم وصالتين ومطبخ وحديقة',
    'فيلا ستاند الون في {location} {area} متر مبني {rooms} غرف ماستر وصالة كبيرة وحديقة وجراج',
    'فيلا تويناهوس في {location} {area} متر 3 طوابق حديقة وجراج مغطى',
    'فيلا للبيع في {location} {area} متر {rooms} غرف وصالات وحديقة واسعة ومسبح',
    'فيلا مستقلة في {location} {area} متر على قطعة {landArea} متر حديقة أمامية وخلفية',
    'فيلا دوبلكس مفروشة في {location} {area} متر {rooms} غرف كاملة التشطيب'
  ];

  const landMessages = [
    'أرض للبيع في {location} {area} متر على شارع رئيسي مباشرة موقع مميز جداً',
    'قطعة أرض في {location} {area} متر على شارع {streetWidth} متر مرافق كاملة',
    'أرض زراعية في {location} {area} فدان على ترعة مباشرة صالحة للزراعة والاستثمار',
    'أرض سكنية في {location} {area} متر في منطقة حيوية بالقرب من الخدمات',
    'قطعة أرض تجارية في {location} {area} متر واجهة {streetWidth} متر موقع استثماري',
    'أرض للبناء في {location} {area} متر مرافق جاهزة كهرباء ومياه وصرف'
  ];

  const officeMessages = [
    'مكتب للإيجار في {location} {area} متر الدور الخامس مكيف بالكامل وأثاث مودرن',
    'محل تجاري للبيع في {location} {area} متر واجهة {streetWidth} متر موقع حيوي جداً',
    'مكتب إداري في برج تجاري بـ{location} {area} متر مقسم غرف ومكيف',
    'محل للإيجار في شارع {location} {area} متر واجهة كبيرة مناسب لجميع الأنشطة',
    'مكتب للبيع في {location} {area} متر مقسم استقبال وغرف اجتماعات',
    'عيادة للإيجار في {location} {area} متر مجهزة بالكامل في موقع طبي'
  ];

  const warehouseMessages = [
    'مخزن للإيجار في {location} {area} متر ارتفاع {height} متر مع ساحة خارجية',
    'مستودع للبيع في {location} {area} متر بوابات واسعة مناسب للتخزين',
    'ورشة للإيجار في {location} {area} متر مع مكاتب إدارية وحمامات',
    'مخزن في {location} {area} متر على الطريق الدائري مناسب للتوزيع',
    'مستودع مبرد في {location} {area} متر مجهز بالتبريد والتهوية',
    'مخزن بالدور الأرضي في {location} {area} متر مع مصعد بضائع'
  ];

  const prices = [
    '850 ألف جنيه', '1.2 مليون جنيه', '2.5 مليون جنيه', '750 ألف جنيه', 
    '1.8 مليون جنيه', '3 مليون جنيه', '950 ألف جنيه', '1.5 مليون جنيه',
    '2 مليون جنيه', '4 مليون جنيه', '680 ألف جنيه', '1.3 مليون جنيه'
  ];

  const messages = [];
  const propertyTypes = [
    { type: 'apartment', templates: apartmentMessages, count: 400 },
    { type: 'villa', templates: villaMessages, count: 250 },
    { type: 'land', templates: landMessages, count: 200 },
    { type: 'office', templates: officeMessages, count: 100 },
    { type: 'warehouse', templates: warehouseMessages, count: 50 }
  ];

  let id = 1;
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2025-01-31');

  propertyTypes.forEach(({ type, templates, count }) => {
    for (let i = 0; i < count; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const sender = senders[Math.floor(Math.random() * senders.length)];
      const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
      
      // Generate random property details
      const area = type === 'land' ? Math.floor(Math.random() * 500) + 200 : Math.floor(Math.random() * 200) + 80;
      const landArea = Math.floor(Math.random() * 200) + 300;
      const rooms = Math.floor(Math.random() * 4) + 2;
      const streetWidth = Math.floor(Math.random() * 15) + 8;
      const height = Math.floor(Math.random() * 4) + 4;
      
      let message = template
        .replace('{location}', location)
        .replace('{area}', area)
        .replace('{landArea}', landArea)
        .replace('{rooms}', rooms)
        .replace('{streetWidth}', streetWidth)
        .replace('{height}', height);

      // Add price randomly
      const hasPrice = Math.random() > 0.6;
      if (hasPrice) {
        const price = prices[Math.floor(Math.random() * prices.length)];
        message += ` السعر ${price}`;
      }

      messages.push({
        id: id++,
        sender,
        message,
        timestamp: randomDate.toLocaleDateString('ar-EG') + ', ' + randomDate.toLocaleTimeString('ar-EG'),
        property_type: type,
        keywords: extractKeywordsFromMessage(message),
        location,
        price: hasPrice ? prices[Math.floor(Math.random() * prices.length)] : '',
        agent_phone: generatePhoneNumber(),
        agent_description: generateAgentDescription(sender),
        full_description: generateFullDescription(type, area, location)
      });
    }
  });

  return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Mock data storage - Generate 1000 properties
let messages = generateSampleData();

// Function to reset database to initial state
export const resetDatabase = () => {
  messages = generateSampleData();
  return messages.length;
};

// Function to get current database size
export const getDatabaseSize = () => {
  return messages.length;
};

// Simulate database delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication
export const authenticateUser = async (username, password) => {
  await delay(500);
  return username === 'xinreal' && password === 'zerocall';
};

// Get message by ID
export const getMessageById = async (id) => {
  await delay(200);
  return messages.find(msg => msg.id === id);
};

// Insert new message
export const insertMessage = async (messageData) => {
  await delay(300);
  
  const newMessage = {
    id: messages.length + 1,
    ...messageData,
    timestamp: messageData.timestamp || new Date().toLocaleString('ar-EG'),
    // Add missing fields for PropertyDetailsModal
    agent_phone: generatePhoneNumber(),
    agent_description: generateAgentDescription(messageData.sender || 'مستخدم جديد'),
    full_description: generateFullDescription(
      messageData.property_type || 'other',
      Math.floor(Math.random() * 200) + 80,
      messageData.location || 'موقع غير محدد'
    )
  };
  
  messages.unshift(newMessage);
  return newMessage;
};

// Search messages
export const searchMessages = async (searchTerm = '', propertyType = 'all', limit = 1000) => {
  await delay(300);
  
  let filtered = messages;
  
  if (searchTerm.trim()) {
    const lowerSearch = searchTerm.toLowerCase();
    filtered = filtered.filter(msg => 
      msg.message.toLowerCase().includes(lowerSearch) ||
      msg.keywords.toLowerCase().includes(lowerSearch) ||
      (msg.location && msg.location.toLowerCase().includes(lowerSearch)) ||
      msg.sender.toLowerCase().includes(lowerSearch)
    );
  }
  
  if (propertyType && propertyType !== 'all') {
    filtered = filtered.filter(msg => msg.property_type === propertyType);
  }
  
  return filtered.slice(0, limit);
};

// Get all messages
export const getAllMessages = async (propertyType = 'all', limit = 1000) => {
  return searchMessages('', propertyType, limit);
};

// Get property type statistics
export const getPropertyTypeStats = async () => {
  await delay(200);
  
  const stats = {};
  messages.forEach(msg => {
    if (msg.property_type) {
      stats[msg.property_type] = (stats[msg.property_type] || 0) + 1;
    }
  });
  
  return Object.entries(stats).map(([type, count]) => ({
    property_type: type,
    count
  }));
};

// Import messages from WhatsApp chat file
export const importChatMessages = async (parsedMessages) => {
  console.log(`Starting import of ${parsedMessages.length} messages...`);
  
  // Reduced delay for better UX with large imports
  await delay(500);
  
  let importedCount = 0;
  let skippedCount = 0;
  let propertyCount = 0;
  
  // Process in batches for better performance
  const batchSize = 100;
  const totalBatches = Math.ceil(parsedMessages.length / batchSize);
  
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const startIndex = batchIndex * batchSize;
    const endIndex = Math.min(startIndex + batchSize, parsedMessages.length);
    const batch = parsedMessages.slice(startIndex, endIndex);
    
    console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} messages)`);
    
    for (const messageData of batch) {
      try {
        // Check if message already exists (basic duplicate check)
        const existingMessage = messages.find(msg => 
          msg.message === messageData.message && 
          msg.sender === messageData.sender
        );
        
        if (existingMessage) {
          skippedCount++;
          continue;
        }
        
        // Direct insertion without await delay for batch processing
        const newMessage = {
          id: messages.length + 1,
          ...messageData,
          timestamp: messageData.timestamp || new Date().toLocaleString('ar-EG'),
          agent_phone: generatePhoneNumber(),
          agent_description: generateAgentDescription(messageData.sender || 'مستخدم جديد'),
          full_description: generateFullDescription(
            messageData.property_type || 'other',
            Math.floor(Math.random() * 200) + 80,
            messageData.location || 'موقع غير محدد'
          )
        };
        
        messages.unshift(newMessage);
        importedCount++;
        
        if (messageData.property_type !== 'other') {
          propertyCount++;
        }
      } catch (error) {
        console.error('Error importing message:', error);
        skippedCount++;
      }
    }
    
    // Small delay between batches to prevent UI freeze
    if (batchIndex < totalBatches - 1) {
      await delay(50);
    }
  }
  
  console.log(`Import complete: ${importedCount} imported, ${skippedCount} skipped`);
  
  return {
    success: true,
    imported: importedCount,
    total: parsedMessages.length,
    skipped: skippedCount,
    propertyMessages: propertyCount
  };
};

export default {
  authenticateUser,
  insertMessage,
  searchMessages,
  getAllMessages,
  getPropertyTypeStats,
  importChatMessages,
  getMessageById,
  resetDatabase,
  getDatabaseSize
};
