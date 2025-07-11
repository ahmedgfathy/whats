import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { getAllProperties } from '../services/apiService';

const PropertyHeroSlider = ({ language = 'arabic', isBackground = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Virtual property image generator
  const getVirtualPropertyImage = (propertyType, messageId) => {
    const imageCategories = {
      apartment: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.2&contrast=0.8',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.3&contrast=0.7',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.2&contrast=0.8',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.3&contrast=0.7',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.2&contrast=0.8'
      ],
      villa: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.2&contrast=0.8',
        'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.3&contrast=0.7',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.4&contrast=0.6',
        'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.2&contrast=0.8',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.3&contrast=0.7'
      ],
      land: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.3&contrast=0.7',
        'https://images.unsplash.com/photo-1566467712871-f3d5aba3f6c7?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.2&contrast=0.8',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.4&contrast=0.6',
        'https://images.unsplash.com/photo-1494280686715-9fd497f4c1a5?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.3&contrast=0.7',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.2&contrast=0.8'
      ]
    };
    
    const typeKey = propertyType?.toLowerCase().includes('villa') ? 'villa' :
                   propertyType?.toLowerCase().includes('apartment') || 
                   propertyType?.toLowerCase().includes('duplex') || 
                   propertyType?.toLowerCase().includes('roof') ? 'apartment' :
                   propertyType?.toLowerCase().includes('land') ? 'land' : 'apartment';
    
    const images = imageCategories[typeKey] || imageCategories.apartment;
    const imageIndex = (messageId || 1) % images.length;
    return images[imageIndex];
  };

  // Property type mapping for display
  const getPropertyTypeLabel = (propertyType) => {
    if (!propertyType) return language === 'arabic' ? 'عقار' : 'Property';
    
    const mappings = {
      'apartment': language === 'arabic' ? 'شقة' : 'Apartment',
      'villa': language === 'arabic' ? 'فيلا' : 'Villa', 
      'land': language === 'arabic' ? 'أرض' : 'Land',
      'office': language === 'arabic' ? 'مكتب' : 'Office',
      'warehouse': language === 'arabic' ? 'مخزن' : 'Warehouse'
    };
    
    // Check for direct matches first
    const lowerType = propertyType.toLowerCase();
    for (const [key, value] of Object.entries(mappings)) {
      if (lowerType.includes(key)) return value;
    }
    
    // Specific mappings for database categories
    if (lowerType.includes('compound') || lowerType.includes('local apartments') || 
        lowerType.includes('duplex') || lowerType.includes('roof')) {
      return mappings.apartment;
    }
    if (lowerType.includes('villa') || lowerType.includes('townhouse') || 
        lowerType.includes('twin house')) {
      return mappings.villa;
    }
    if (lowerType.includes('land')) {
      return mappings.land;
    }
    if (lowerType.includes('commercial') || lowerType.includes('administrative')) {
      return mappings.office;
    }
    
    return propertyType;
  };

  // Default featured properties (fallback)
  const defaultProperties = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.2&contrast=0.8',
      title: language === 'arabic' ? 'فيلا فاخرة في الشيخ زايد' : 'Luxury Villa in Sheikh Zayed',
      location: language === 'arabic' ? 'الشيخ زايد، الجيزة' : 'Sheikh Zayed, Giza',
      price: language === 'arabic' ? 'تبدأ من 4.5 مليون جنيه' : 'Starting from 4.5M EGP',
      priceValue: '4.5M',
      type: 'villa',
      area: '300م²'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=600&fit=crop&auto=format&q=80&brightness=1.3&contrast=0.7',
      title: language === 'arabic' ? 'شقة مودرن في التجمع الخامس' : 'Modern Apartment in New Cairo',
      location: language === 'arabic' ? 'التجمع الخامس، القاهرة الجديدة' : 'Fifth Settlement, New Cairo',
      price: language === 'arabic' ? 'تبدأ من 2.8 مليون جنيه' : 'Starting from 2.8M EGP',
      priceValue: '2.8M',
      type: 'apartment',
      area: '180م²'
    }
  ];

  // Fetch real properties from database
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        console.log('Fetching properties for slider...');
        
        const response = await getAllProperties(1, 6); // Get first 6 properties for slider
        console.log('Slider API response:', response);
        
        if (response && response.success && response.data && response.data.length > 0) {
          // Transform real data for slider format
          const transformedProperties = response.data.map((property, index) => ({
            id: property.id,
            image: getVirtualPropertyImage(property.property_type, property.id),
            title: `${getPropertyTypeLabel(property.property_type)} ${property.location ? (language === 'arabic' ? `في ${property.location}` : `in ${property.location}`) : ''}`,
            location: property.location || (language === 'arabic' ? 'الموقع غير محدد' : 'Location not specified'),
            price: property.price || (language === 'arabic' ? 'السعر عند الاتصال' : 'Price on inquiry'),
            priceValue: property.price || 'N/A',
            type: property.property_type,
            area: property.area || (language === 'arabic' ? 'المساحة غير محددة' : 'Area not specified'),
            message: property.message
          }));
          
          console.log('Transformed properties for slider:', transformedProperties);
          setFeaturedProperties(transformedProperties);
        } else {
          console.log('No properties found, using default');
          setFeaturedProperties(defaultProperties);
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error);
        setFeaturedProperties(defaultProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, [language]);

  // Set default properties if still empty after loading
  useEffect(() => {
    if (!loading && featuredProperties.length === 0) {
      setFeaturedProperties(defaultProperties);
    }
  }, [loading, featuredProperties.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProperties.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredProperties.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + featuredProperties.length) % featuredProperties.length);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % featuredProperties.length);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const getPropertyTypeColor = (type) => {
    const colors = {
      apartment: 'from-blue-500 to-cyan-500',
      villa: 'from-green-500 to-emerald-500',
      land: 'from-orange-500 to-red-500',
      office: 'from-indigo-500 to-purple-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  return (
    <div 
      className={`relative w-full overflow-hidden ${
        isBackground 
          ? 'h-full' 
          : 'h-96 md:h-[500px] rounded-2xl shadow-2xl'
      }`} 
      dir={language === 'arabic' ? 'rtl' : 'ltr'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background Image with Enhanced Dark Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${featuredProperties[currentSlide].image})`,
              filter: 'brightness(0.8) contrast(1.1) saturate(1.2)'
            }}
          >
            {/* Enhanced Dark Overlay for better contrast and readability */}
            {isBackground ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-800/60 to-slate-700/40"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-slate-900/30 to-blue-900/40"></div>
                <div className="absolute inset-0 bg-black/20"></div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/70 to-slate-700/50"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-slate-900/40 to-blue-900/50"></div>
                <div className="absolute inset-0 bg-black/25"></div>
              </>
            )}
          </div>

          {/* Content - Only show in regular mode, not background mode */}
          {!isBackground && (
            <div className="absolute inset-0 flex items-end">
              <div className="w-full p-6 md:p-8 lg:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-2xl"
                >
                  {/* Property Type Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-4"
                  >
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${getPropertyTypeColor(featuredProperties[currentSlide].type)} text-white shadow-lg border-2 border-white/20`}>
                      {getPropertyTypeLabel(featuredProperties[currentSlide].type)}
                      <span className="mx-2">•</span>
                      {featuredProperties[currentSlide].area}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
                  >
                    {featuredProperties[currentSlide].title}
                  </motion.h2>

                  {/* Location */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex items-center gap-2 text-gray-200 mb-4 text-lg"
                  >
                    <MapPinIcon className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">{featuredProperties[currentSlide].location}</span>
                  </motion.div>

                  {/* Price with "Starting from" text */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                      <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                        {language === 'arabic' ? 'السعر يبدأ من' : 'Price Starting From'}
                      </span>
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-green-400 drop-shadow-lg">
                      {featuredProperties[currentSlide].priceValue} 
                      <span className="text-lg text-gray-300 ml-2">
                        {language === 'arabic' ? 'جنيه مصري' : 'EGP'}
                      </span>
                    </div>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-white/30"
                  >
                    {language === 'arabic' ? 'عرض التفاصيل' : 'View Details'}
                  </motion.button>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Hide in background mode */}
      {!isBackground && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute top-1/2 -translate-y-1/2 ${language === 'arabic' ? 'right-4' : 'left-4'} p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110`}
          >
            {language === 'arabic' ? (
              <ChevronRightIcon className="w-6 h-6" />
            ) : (
              <ChevronLeftIcon className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={goToNext}
            className={`absolute top-1/2 -translate-y-1/2 ${language === 'arabic' ? 'left-4' : 'right-4'} p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110`}
          >
            {language === 'arabic' ? (
              <ChevronLeftIcon className="w-6 h-6" />
            ) : (
              <ChevronRightIcon className="w-6 h-6" />
            )}
          </button>
        </>
      )}

      {/* Dot Indicators - Position differently for background mode */}
      <div className={`absolute ${isBackground ? 'bottom-8 right-8' : 'bottom-4 left-1/2 -translate-x-1/2'} flex items-center gap-2`}>
        {featuredProperties.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125 shadow-lg' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Auto-play indicator - Position differently for background mode */}
      <div className={`absolute ${isBackground ? 'top-8 right-8' : 'top-4 right-4'} flex items-center gap-2 text-white/70 text-sm`}>
        <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="hidden md:inline">
          {isAutoPlaying 
            ? (language === 'arabic' ? 'تشغيل تلقائي' : 'Auto-play') 
            : (language === 'arabic' ? 'متوقف' : 'Paused')
          }
        </span>
      </div>
    </div>
  );
};

export default PropertyHeroSlider;
