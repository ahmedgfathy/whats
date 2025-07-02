// Arabic real estate keywords and classification
export const PROPERTY_TYPES = {
  apartment: {
    ar: 'شقة',
    keywords: ['شقة', 'شقق', 'دور', 'أدوار', 'طابق', 'غرفة', 'غرف', 'صالة', 'حمام', 'مطبخ']
  },
  villa: {
    ar: 'فيلا',
    keywords: ['فيلا', 'فيلات', 'قصر', 'قصور', 'بيت', 'بيوت', 'منزل', 'منازل', 'دوبلكس']
  },
  land: {
    ar: 'أرض',
    keywords: ['أرض', 'أراضي', 'قطعة', 'قطع', 'مساحة', 'متر', 'فدان', 'قيراط']
  },
  office: {
    ar: 'مكتب',
    keywords: ['مكتب', 'مكاتب', 'إداري', 'تجاري', 'محل', 'محلات', 'متجر']
  },
  warehouse: {
    ar: 'مخزن',
    keywords: ['مخزن', 'مخازن', 'مستودع', 'مستودعات', 'ورشة', 'ورش']
  }
};

export const AREA_KEYWORDS = [
  'الحي', 'منطقة', 'شارع', 'طريق', 'ميدان', 'كوبري', 'جسر', 'حدائق', 'مدينة',
  'قرية', 'العاشر', 'الخامس', 'السادس', 'التجمع', 'المعادي', 'مصر الجديدة',
  'الزمالك', 'وسط البلد', 'مدينة نصر', 'الهرم', 'فيصل', 'إمبابة', 'شبرا'
];

export const PRICE_KEYWORDS = [
  'جنيه', 'ألف', 'مليون', 'سعر', 'ثمن', 'تكلفة', 'مقدم', 'قسط', 'أقساط',
  'نقدي', 'كاش', 'تمويل', 'بنك', 'عربون'
];

// Function to classify property type based on Arabic text
export const classifyPropertyType = (text) => {
  const normalizedText = text.toLowerCase();
  
  for (const [type, data] of Object.entries(PROPERTY_TYPES)) {
    for (const keyword of data.keywords) {
      if (normalizedText.includes(keyword)) {
        return type;
      }
    }
  }
  
  return 'other';
};

// Function to extract keywords from Arabic text
export const extractKeywords = (text) => {
  const keywords = [];
  const normalizedText = text.toLowerCase();
  
  // Extract property-related keywords
  Object.values(PROPERTY_TYPES).forEach(propertyData => {
    propertyData.keywords.forEach(keyword => {
      if (normalizedText.includes(keyword)) {
        keywords.push(keyword);
      }
    });
  });
  
  // Extract area keywords
  AREA_KEYWORDS.forEach(keyword => {
    if (normalizedText.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  // Extract price keywords
  PRICE_KEYWORDS.forEach(keyword => {
    if (normalizedText.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  return [...new Set(keywords)]; // Remove duplicates
};

// Function to extract location information
export const extractLocation = (text) => {
  const normalizedText = text.toLowerCase();
  const locations = [];
  
  AREA_KEYWORDS.forEach(keyword => {
    if (normalizedText.includes(keyword)) {
      // Try to extract context around the location keyword
      const index = normalizedText.indexOf(keyword);
      const start = Math.max(0, index - 10);
      const end = Math.min(text.length, index + keyword.length + 10);
      locations.push(text.substring(start, end).trim());
    }
  });
  
  return locations.join(', ');
};

// Function to extract price information
export const extractPrice = (text) => {
  const normalizedText = text.toLowerCase();
  const priceRegex = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(جنيه|ألف|مليون|k|m)/g;
  const matches = [...normalizedText.matchAll(priceRegex)];
  
  if (matches.length > 0) {
    return matches.map(match => match[0]).join(', ');
  }
  
  return '';
};

// Function to process WhatsApp chat text and extract message data
export const parseWhatsAppMessage = (line) => {
  // WhatsApp message format: [date, time] sender: message
  const messageRegex = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]?\s*([^:]+):\s*(.+)$/;
  const match = line.match(messageRegex);
  
  if (match) {
    const [, date, time, sender, message] = match;
    const timestamp = `${date} ${time}`;
    
    return {
      sender: sender.trim(),
      message: message.trim(),
      timestamp,
      property_type: classifyPropertyType(message),
      keywords: extractKeywords(message).join(', '),
      location: extractLocation(message),
      price: extractPrice(message)
    };
  }
  
  return null;
};

// Function to process entire WhatsApp chat file
export const parseWhatsAppChatFile = (fileContent) => {
  const lines = fileContent.split('\n');
  const messages = [];
  
  lines.forEach(line => {
    if (line.trim()) {
      const messageData = parseWhatsAppMessage(line.trim());
      if (messageData) {
        messages.push(messageData);
      }
    }
  });
  
  return messages;
};
