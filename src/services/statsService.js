import { getAllProperties } from './apiService';

// Fallback function to calculate stats from properties when API fails
export const calculateStatsFromProperties = (properties) => {
  if (!properties || !Array.isArray(properties)) {
    return [
      { property_type: 'apartment', count: 0 },
      { property_type: 'villa', count: 0 },
      { property_type: 'land', count: 0 },
      { property_type: 'office', count: 0 },
      { property_type: 'warehouse', count: 0 }
    ];
  }

  const stats = {
    apartment: 0,
    villa: 0,
    land: 0,
    office: 0,
    warehouse: 0
  };

  properties.forEach(property => {
    const category = (property.property_category || '').toLowerCase();
    
    if (category.includes('شقق') || category.includes('دوبلكس') || category.includes('روف')) {
      stats.apartment++;
    } else if (category.includes('فيلات') || category.includes('فيلا') || category.includes('تاون')) {
      stats.villa++;
    } else if (category.includes('اراضي') || category.includes('أرض')) {
      stats.land++;
    } else if (category.includes('محلات') || category.includes('اداري') || category.includes('مكتب')) {
      stats.office++;
    } else if (category.includes('مخزن') || category.includes('مخازن')) {
      stats.warehouse++;
    }
  });

  return [
    { property_type: 'apartment', count: stats.apartment },
    { property_type: 'villa', count: stats.villa },
    { property_type: 'land', count: stats.land },
    { property_type: 'office', count: stats.office },
    { property_type: 'warehouse', count: stats.warehouse }
  ];
};

// Enhanced function that tries API first, then falls back to calculation
export const getPropertyStatsReliable = async () => {
  try {
    // First, get all properties (this seems to be working from your image)
    console.log('🔄 Loading properties for stats calculation...');
    const properties = await getAllProperties(10000);
    
    if (!properties || properties.length === 0) {
      console.warn('⚠️ No properties loaded');
      return [];
    }

    console.log(`✅ Loaded ${properties.length} properties`);
    
    // Calculate stats from the properties
    const calculatedStats = calculateStatsFromProperties(properties);
    
    console.log('📊 Calculated stats:', calculatedStats);
    
    return calculatedStats;
    
  } catch (error) {
    console.error('❌ Error in getPropertyStatsReliable:', error);
    return [
      { property_type: 'apartment', count: 0 },
      { property_type: 'villa', count: 0 },
      { property_type: 'land', count: 0 },
      { property_type: 'office', count: 0 },
      { property_type: 'warehouse', count: 0 }
    ];
  }
};
