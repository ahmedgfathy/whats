import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  CpuChipIcon,
  ChartBarIcon,
  LanguageIcon,
  EyeIcon,
  ClockIcon,
  ArrowRightIcon,
  PhoneIcon,
  StarIcon,
  FireIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { getAllProperties, searchProperties, getPropertyTypeStats } from '../services/apiService';
import PropertyHeroSlider from './PropertyHeroSlider';

// Virtual property image generator
const getVirtualPropertyImage = (propertyType, messageId) => {
  const imageCategories = {
    apartment: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop&auto=format'
    ],
    villa: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop&auto=format'
    ],
    land: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1566467712871-f3d5aba3f6c7?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1494280686715-9fd497f4c1a5?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop&auto=format'
    ],
    office: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400&h=250&fit=crop&auto=format'
    ],
    warehouse: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1580687774429-74ee6e4a3fb4?w=400&h=250&fit=crop&auto=format'
    ]
  };

  // Default to apartment images if property type not found
  const images = imageCategories[propertyType] || imageCategories.apartment;
  
  // Use message ID to consistently select the same image for the same property
  const imageIndex = Math.abs(messageId || 0) % images.length;
  return images[imageIndex];
};

const HomePage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [stats, setStats] = useState([]);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [itemsToShow, setItemsToShow] = useState(10); // Initial load: 10 properties (2 rows of 5)
  const [language, setLanguage] = useState('arabic');
  const [isInitialized, setIsInitialized] = useState(false); // Prevent multiple initializations

  const propertyFilters = [
    { id: 'all', label: 'جميع العقارات', labelEn: 'All Properties', icon: BuildingOffice2Icon, color: 'from-purple-500 to-pink-500' },
    { id: 'apartment', label: 'شقق', labelEn: 'Apartments', icon: HomeModernIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'villa', label: 'فيلل', labelEn: 'Villas', icon: HomeModernIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'land', label: 'أراضي', labelEn: 'Land', icon: MapPinIcon, color: 'from-orange-500 to-red-500' },
    { id: 'office', label: 'مكاتب', labelEn: 'Offices', icon: BuildingStorefrontIcon, color: 'from-indigo-500 to-purple-500' },
    { id: 'warehouse', label: 'مخازن', labelEn: 'Warehouses', icon: BuildingLibraryIcon, color: 'from-pink-500 to-rose-500' }
  ];

  useEffect(() => {
    if (!isInitialized) {
      loadInitialData();
      setIsInitialized(true);
    }
    // Check saved language preference
    const savedLanguage = localStorage.getItem('publicLanguage') || 'arabic';
    setLanguage(savedLanguage);
  }, [isInitialized]);

  const loadInitialData = async () => {
    if (loading) return; // Prevent multiple simultaneous calls
    
    setLoading(true);
    try {
      console.log('🔄 Starting to load initial data...');
      
      // Load properties first
      const allProperties = await getAllProperties(10000);
      console.log('✅ Loaded properties:', allProperties?.length || 0);
      if (allProperties && allProperties.length > 0) {
        setMessages(allProperties);
        console.log('✅ Properties set successfully');
        
        // Calculate stats from properties if API fails
        const calculateStatsFromProperties = (properties) => {
          const stats = [
            { property_type: 'apartment', count: 0 },
            { property_type: 'villa', count: 0 },
            { property_type: 'land', count: 0 },
            { property_type: 'office', count: 0 },
            { property_type: 'warehouse', count: 0 }
          ];
          
          console.log('📊 Calculating stats from', properties.length, 'properties');
          
          properties.forEach(property => {
            const category = property.property_category?.toLowerCase() || '';
            const name = property.property_name?.toLowerCase() || '';
            const combined = `${category} ${name}`;
            
            if (combined.includes('شقق') || combined.includes('شقة') || combined.includes('apartment')) {
              stats.find(s => s.property_type === 'apartment').count++;
            } else if (combined.includes('فيلات') || combined.includes('فيلا') || combined.includes('villa')) {
              stats.find(s => s.property_type === 'villa').count++;
            } else if (combined.includes('اراضي') || combined.includes('أرض') || combined.includes('land')) {
              stats.find(s => s.property_type === 'land').count++;
            } else if (combined.includes('محلات') || combined.includes('اداري') || combined.includes('مكتب') || combined.includes('office') || combined.includes('commercial')) {
              stats.find(s => s.property_type === 'office').count++;
            } else if (combined.includes('دوبلكس') || combined.includes('تاون') || combined.includes('duplex') || combined.includes('townhouse') || combined.includes('penthouse')) {
              stats.find(s => s.property_type === 'warehouse').count++;
            }
          });
          
          console.log('📊 Calculated stats:', stats);
          return stats;
        };
        
        // Try to load property stats from API
        try {
          const propertyStats = await getPropertyTypeStats();
          console.log('✅ Property stats received:', propertyStats);
          if (propertyStats && propertyStats.length > 0) {
            setStats(propertyStats);
          } else {
            console.warn('⚠️ No property stats from API, calculating from properties');
            const calculatedStats = calculateStatsFromProperties(allProperties);
            setStats(calculatedStats);
          }
        } catch (statsError) {
          console.warn('⚠️ Stats API failed, calculating from properties:', statsError);
          const calculatedStats = calculateStatsFromProperties(allProperties);
          setStats(calculatedStats);
        }
        
      } else {
        console.warn('⚠️ No properties received');
        setMessages([]);
        setStats([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setStats([]); // Set empty array on error
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadInitialData();
      return;
    }

    setLoading(true);
    try {
      // Use the selectedFilter for more accurate search
      const filterType = selectedFilter === 'all' ? null : selectedFilter;
      const searchResults = await searchProperties(searchTerm, filterType, 10000);
      setMessages(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
      // Show error message to user
      alert(language === 'arabic' ? 'حدث خطأ في البحث. يرجى المحاولة مرة أخرى.' : 'Search error. Please try again.');
    }
    setLoading(false);
  };

  const handleStatClick = (filterType) => {
    handleFilterChange(filterType);
    
    // If there's an active search, re-run it with the new filter
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      // If no search term, load all data for the new filter
      loadFilteredData(filterType);
    }
  };

  // New function to load data by filter
  const loadFilteredData = async (filterType = 'all') => {
    setLoading(true);
    try {
      const filterParam = filterType === 'all' ? null : filterType;
      const filteredMessages = await searchProperties('', filterParam, 10000);
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error loading filtered data:', error);
    }
    setLoading(false);
  };

  const handleLanguageSwitch = () => {
    const newLanguage = language === 'arabic' ? 'english' : 'arabic';
    setLanguage(newLanguage);
    localStorage.setItem('publicLanguage', newLanguage);
  };

  const getPropertyTypeLabel = (type) => {
    const labels = language === 'arabic' ? {
      apartment: 'شقة',
      villa: 'فيلا',
      land: 'أرض',
      office: 'مكتب',
      warehouse: 'مخزن'
    } : {
      apartment: 'Apartment',
      villa: 'Villa',
      land: 'Land',
      office: 'Office',
      warehouse: 'Warehouse'
    };
    return labels[type] || type;
  };

  const getPropertyTypeColorClass = (type) => {
    const colors = {
      apartment: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      villa: 'bg-green-500/20 text-green-300 border-green-500/30',
      land: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      office: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      warehouse: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // Update displayed messages when messages or itemsToShow changes
  useEffect(() => {
    if (messages && messages.length > 0) {
      const messagesToShow = messages.slice(0, itemsToShow);
      setDisplayedMessages(messagesToShow);
      setHasMore(messagesToShow.length < messages.length);
      console.log(`📊 Displaying ${messagesToShow.length} of ${messages.length} messages`);
    } else {
      setDisplayedMessages([]);
      setHasMore(false);
    }
  }, [messages, itemsToShow]);

  // Load more properties
  const loadMoreProperties = () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    setTimeout(() => {
      const newItemsToShow = itemsToShow + 5; // Load 5 more properties (1 row)
      setItemsToShow(newItemsToShow);
      setLoadingMore(false);
    }, 500); // Small delay for smooth loading animation
  };

  // Add scroll event listener - use useCallback to prevent recreating the function
  const handleScrollCallback = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000 && hasMore && !loadingMore) {
      loadMoreProperties();
    }
  }, [hasMore, loadingMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollCallback);
    return () => window.removeEventListener('scroll', handleScrollCallback);
  }, [handleScrollCallback]);

  // Reset when search or filter changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setItemsToShow(10);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setItemsToShow(10);
  };

  const texts = language === 'arabic' ? {
    title: 'كونتابو',
    subtitle: 'اكتشف أفضل العقارات في مصر',
    search: 'ابحث عن العقار المناسب...',
    searchBtn: 'بحث',
    login: 'دخول النظام',
    allProperties: 'جميع العقارات',
    latestProperties: 'أحدث العقارات',
    viewDetails: 'عرض التفاصيل',
    price: 'السعر',
    location: 'الموقع',
    notSpecified: 'غير محدد',
    page: 'صفحة',
    of: 'من',
    showingProperties: 'عرض العقارات',
    to: 'إلى',
    totalProperties: 'إجمالي العقارات',
    english: 'English',
    brandName: 'كونتابو',
    brandSubtitle: 'منصة العقارات الذكية',
    propertyListing: 'إعلان عقاري'
  } : {
    title: 'Contaboo',
    subtitle: 'Discover the best properties in Egypt',
    search: 'Search for the perfect property...',
    searchBtn: 'Search',
    login: 'System Login',
    allProperties: 'All Properties',
    latestProperties: 'Latest Properties',
    viewDetails: 'View Details',
    price: 'Price',
    location: 'Location',
    notSpecified: 'Not specified',
    page: 'Page',
    of: 'of',
    showingProperties: 'Showing properties',
    to: 'to',
    totalProperties: 'Total Properties',
    english: 'العربية',
    brandName: 'Contaboo',
    brandSubtitle: 'Smart Real Estate Platform',
    propertyListing: 'Property Listing'
  };

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${language === 'arabic' ? 'font-cairo lang-arabic' : 'font-roboto lang-english'}`} 
      dir={language === 'arabic' ? 'rtl' : 'ltr'}
      lang={language === 'arabic' ? 'ar' : 'en'}
    >
      {/* Header */}
      <motion.header className="relative z-30">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-6">
            
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 lg:gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <BuildingOffice2Icon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold text-white">{texts.title}</h1>
                <p className="text-xs lg:text-sm text-gray-300 hidden sm:block">{texts.brandSubtitle}</p>
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Language Switch Button */}
              <motion.button
                onClick={handleLanguageSwitch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden flex items-center px-3 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-semibold text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-white/20 transition-all duration-300 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <LanguageIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative">{texts.english}</span>
              </motion.button>

              {/* Login Button */}
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden flex items-center px-4 lg:px-8 py-2 lg:py-4 text-xs lg:text-sm font-semibold text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-white/20 transition-all duration-300 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <UserIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-3 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative">{texts.login}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with Search/Stats moved higher */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="absolute inset-0">
          <PropertyHeroSlider language={language} isBackground={true} />
        </div>
        
        <div className="relative z-20 flex-1 flex flex-col justify-center">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Main Hero Content */}
            <motion.div 
              className="text-center space-y-8 mb-16"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Main Title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
                  <span className="block gradient-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 lg:mb-10 relative -top-1 pb-2">{texts.brandName}</span>
                  <span className="gradient-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {texts.brandSubtitle}
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p 
                className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {language === 'arabic' 
                  ? 'اكتشف أفضل العقارات في مصر مع تقنيات الذكاء الاصطناعي المتطورة'
                  : 'Discover the best properties in Egypt with advanced AI technology'
                }
              </motion.p>
            </motion.div>

            {/* Search and Stats Section - Moved Higher */}
            <motion.div 
              id="search-section"
              className="relative max-w-4xl mx-auto mb-16"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    {language === 'arabic' ? 'ابحث عن عقارك المثالي' : 'Find Your Perfect Property'}
                  </h3>
                  
                  {/* Search Input */}
                  <div className="relative mb-6">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder={texts.search}
                      className="w-full px-6 py-4 bg-gray-50 text-gray-800 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/20 placeholder-gray-500 text-lg pr-14"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          loadInitialData();
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                    <motion.button
                      onClick={handleSearch}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5" />
                    </motion.button>
                  </div>

                  {/* Quick Stats */}
                  <motion.div
                    className="grid grid-cols-3 gap-4 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    {stats.slice(0, 3).map((stat, index) => (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-lg font-bold text-purple-600">{stat.count?.toLocaleString() || '0'}</div>
                        <div className="text-xs text-gray-600">{stat.property_type === 'apartment' ? (language === 'arabic' ? 'شقق' : 'Apartments') : stat.property_type === 'villa' ? (language === 'arabic' ? 'فيلل' : 'Villas') : (language === 'arabic' ? 'أراضي' : 'Land')}</div>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Properties Slider Section */}
      <motion.div 
        className="relative z-20 bg-gradient-to-b from-transparent to-slate-900/50 py-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              {language === 'arabic' ? 'العقارات المميزة' : 'Featured Properties'}
            </h2>
            <p className="text-xl text-gray-300">
              {language === 'arabic' ? 'أفضل العقارات المختارة بعناية' : 'Carefully selected premium properties'}
            </p>
          </motion.div>

          {/* Horizontal Property Slider */}
          <motion.div 
            className="relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {displayedMessages.slice(0, 8).map((message, index) => (
                <motion.div 
                  key={message.id} 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => navigate(`/property/${message.id}`)}
                  className="flex-shrink-0 w-80 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-xl border border-gray-600 cursor-pointer snap-start"
                >
                  {/* Property Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={getVirtualPropertyImage(message.property_type, message.id)}
                      alt={getPropertyTypeLabel(message.property_type)}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop&auto=format';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getPropertyTypeColorClass(message.property_type)}`}
                    >
                      {getPropertyTypeLabel(message.property_type)}
                    </motion.span>
                    <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                      <ClockIcon className="h-3 w-3" />
                      {message.timestamp}
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
                      <FireIcon className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-bold">{language === 'arabic' ? 'مميز' : 'Featured'}</span>
                    </div>
                  </div>

                  {/* Property Content */}
                  <div className="p-6">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2 text-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      {getPropertyTypeLabel(message.property_type)} - {message.location || texts.notSpecified}
                    </h4>
                    
                    <p className="text-gray-300 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {message.message}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{texts.location}:</span>
                        <span className="text-gray-300">{message.location || texts.notSpecified}</span>
                      </div>
                      {message.price && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{texts.price}:</span>
                          <span className="text-green-400 font-semibold">{message.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* View All Button */}
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <motion.button
              onClick={() => document.getElementById('properties-section').scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <EyeIcon className="h-5 w-5" />
              {language === 'arabic' ? 'عرض جميع العقارات' : 'View All Properties'}
              <ArrowRightIcon className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Properties Section */}
      <div id="properties-section" className="relative z-20 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Property Type Filter Cards */}
          <motion.div 
            className="mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 justify-items-center max-w-7xl">
                {propertyFilters.map((filter, index) => {
                  const IconComponent = BuildingOffice2Icon;
                  
                  let count = 0;
                  if (filter.id === 'all') {
                    count = stats.reduce((sum, stat) => sum + parseInt(stat.count || 0), 0);
                  } else {
                    // Calculate count for each filter type
                    count = stats.filter(stat => {
                      if (!stat.property_type) return false;
                      return stat.property_type.toLowerCase().includes(filter.id);
                    }).reduce((sum, stat) => sum + parseInt(stat.count || 0), 0);
                  }
                  
                  const isActive = selectedFilter === filter.id;
                  
                  return (
                    <motion.button
                      key={filter.id}
                      initial={{ scale: 0.8, opacity: 0, y: 30 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.1 * index,
                        type: "spring",
                        stiffness: 100
                      }}
                      onClick={() => handleStatClick(filter.id)}
                      whileHover={{ 
                        scale: 1.08, 
                        y: -8,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative group transition-all duration-500 ${
                        isActive ? 'transform scale-110' : ''
                      }`}
                    >
                      <div className={`
                        relative w-32 h-32 flex flex-col items-center justify-center
                        bg-gradient-to-br transition-all duration-500 shadow-2xl 
                        border-4 border-white/10 group-hover:border-white/30 overflow-hidden
                        rounded-full
                        ${isActive 
                          ? `${filter.color} ring-4 ring-white/40 shadow-3xl border-white/40` 
                          : 'from-slate-700/90 to-slate-800/90 group-hover:from-slate-600/90 group-hover:to-slate-700/90'
                        }
                      `}>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className={`
                            relative rounded-2xl backdrop-blur-sm transition-all duration-300 group-hover:scale-110
                            flex items-center justify-center p-2 mb-1
                            ${isActive 
                              ? 'bg-white/40 shadow-lg' 
                              : 'bg-white/20 group-hover:bg-white/30'
                            }
                          `}>
                            <IconComponent className="text-white drop-shadow-lg h-5 w-5" />
                          </div>
                          
                          <div className="text-center">
                            <motion.div 
                              className="text-2xl font-black text-white drop-shadow-lg leading-none"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 + index * 0.1 }}
                            >
                              {count?.toLocaleString() || '0'}
                            </motion.div>
                            <div className="text-xs text-white/90 font-semibold tracking-wide leading-tight">
                              {language === 'arabic' ? 'عقار' : 'Units'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-center">
                        <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">
                          {language === 'arabic' ? filter.label : filter.labelEn}
                        </h3>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Properties Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-7xl mx-auto bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900 rounded-2xl p-8 shadow-2xl border border-gray-700"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 pb-6 border-b border-gray-700">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  {selectedFilter === 'all' ? texts.allProperties : `${language === 'arabic' ? propertyFilters.find(f => f.id === selectedFilter)?.label : propertyFilters.find(f => f.id === selectedFilter)?.labelEn}`}
                </h3>
                <p className="text-gray-400 flex items-center gap-2 text-sm md:text-base">
                  <BuildingOffice2Icon className="h-5 w-5" />
                  {stats.length > 0 ? stats.reduce((sum, stat) => sum + parseInt(stat.count || 0), 0) : messages.length} {texts.totalProperties} • {language === 'arabic' ? 'عرض' : 'Showing'} {displayedMessages.length}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"
                ></motion.div>
                <p className="text-gray-400 text-lg">جاري تحميل البيانات...</p>
              </div>
            ) : (
              <>
                {/* Properties Grid - 5 per row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-8">
                  {displayedMessages.map((message, index) => (
                    <motion.div 
                      key={message.id} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      onClick={() => navigate(`/property/${message.id}`)}
                      className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-xl border border-gray-600 cursor-pointer min-h-[400px]"
                    >
                      {/* Property Image */}
                      <div className="relative h-56 overflow-hidden">
                        <img 
                          src={getVirtualPropertyImage(message.property_type, message.id)}
                          alt={getPropertyTypeLabel(message.property_type)}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop&auto=format';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getPropertyTypeColorClass(message.property_type)}`}
                        >
                          {getPropertyTypeLabel(message.property_type)}
                        </motion.span>
                        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                          <ClockIcon className="h-3 w-3" />
                          {message.timestamp}
                        </div>
                      </div>

                      {/* Property Content */}
                      <div className="p-7">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2 text-lg">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          {getPropertyTypeLabel(message.property_type)} - {message.location || texts.notSpecified}
                        </h4>
                        
                        <p className="text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed min-h-[60px]">
                          {message.message}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{texts.location}:</span>
                            <span className="text-gray-300">{message.location || texts.notSpecified}</span>
                          </div>
                          {message.price && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">{texts.price}:</span>
                              <span className="text-green-400 font-semibold">{message.price}</span>
                            </div>
                          )}
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/property/${message.id}`);
                              }}
                              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                            >
                              <EyeIcon className="h-4 w-4" />
                              {texts.viewDetails}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Loading More Indicator */}
                {loadingMore && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-8"
                  >
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <span className="mr-4 text-gray-300 text-lg font-medium">
                      {language === 'arabic' ? 'جاري تحميل المزيد...' : 'Loading more...'}
                    </span>
                  </motion.div>
                )}

                {/* End of Results Indicator */}
                {!hasMore && displayedMessages.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="inline-flex items-center px-6 py-3 bg-gray-800 rounded-full border border-gray-700">
                      <SparklesIcon className="w-5 h-5 text-purple-400 mr-2" />
                      <span className="text-gray-300 font-medium">
                        {language === 'arabic' ? 'تم عرض جميع العقارات المتاحة' : 'All properties displayed'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>

          {/* Footer */}
          <motion.footer 
            className="mt-16 text-center py-8 border-t border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="text-gray-400">
              <p className="mb-2">© 2025 {texts.title}</p>
              <p className="text-sm">{language === 'arabic' ? 'منصة ذكية لعرض العقارات' : 'Smart Platform for Real Estate Listings'}</p>
            </div>
          </motion.footer>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
