import React, { useState, useEffect } from 'react';
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
import { getAllMessages, searchMessages, getPropertyTypeStats } from '../services/apiService';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(51);
  const [language, setLanguage] = useState('arabic');

  const propertyFilters = [
    { id: 'all', label: 'جميع العقارات', labelEn: 'All Properties', icon: BuildingOffice2Icon, color: 'from-purple-500 to-pink-500' },
    { id: 'apartment', label: 'شقق', labelEn: 'Apartments', icon: HomeModernIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'villa', label: 'فيلل', labelEn: 'Villas', icon: HomeModernIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'land', label: 'أراضي', labelEn: 'Land', icon: MapPinIcon, color: 'from-orange-500 to-red-500' },
    { id: 'office', label: 'مكاتب', labelEn: 'Offices', icon: BuildingStorefrontIcon, color: 'from-indigo-500 to-purple-500' },
    { id: 'warehouse', label: 'مخازن', labelEn: 'Warehouses', icon: BuildingLibraryIcon, color: 'from-pink-500 to-rose-500' }
  ];

  useEffect(() => {
    loadInitialData();
    // Check saved language preference
    const savedLanguage = localStorage.getItem('publicLanguage') || 'arabic';
    setLanguage(savedLanguage);
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const allMessages = await getAllMessages('all', 10000);
      setMessages(allMessages);
      const propertyStats = await getPropertyTypeStats();
      setStats(propertyStats);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
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
      const searchResults = await searchMessages(searchTerm, filterType, 10000);
      setMessages(searchResults);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching:', error);
      // Show error message to user
      alert(language === 'arabic' ? 'حدث خطأ في البحث. يرجى المحاولة مرة أخرى.' : 'Search error. Please try again.');
    }
    setLoading(false);
  };

  const handleStatClick = (filterType) => {
    setSelectedFilter(filterType);
    setCurrentPage(1);
    
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
      const filteredMessages = await searchMessages('', filterParam, 10000);
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error loading filtered data:', error);
      }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredMessages([]);
    setCurrentPage(1);
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

  // No need to filter again since API already handles filtering
  const filteredMessages = messages; // Use messages directly from API

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

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
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 lg:h-24">
            <motion.div 
              className="flex items-center gap-3 lg:gap-6" 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl lg:rounded-3xl blur opacity-75"></div>
                <div className="relative p-2 lg:p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl lg:rounded-3xl shadow-2xl">
                  <BuildingOffice2Icon className="h-6 w-6 lg:h-10 lg:w-10 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-3xl font-bold gradient-text">
                  {texts.title}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <SparklesIcon className="h-3 w-3 lg:h-4 lg:w-4 text-purple-400" />
                  <CpuChipIcon className="h-3 w-3 lg:h-4 lg:w-4 text-purple-400 animate-pulse" />
                  <p className="text-xs lg:text-sm text-gray-300">{texts.subtitle}</p>
                </div>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Language Switcher */}
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

      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h2 
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {texts.title}
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {texts.subtitle}
          </motion.p>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          className="mb-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={texts.search}
                  className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-600/50 text-white rounded-2xl border border-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 placeholder-slate-300 text-base md:text-lg pr-12"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      loadInitialData();
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  disabled={loading || !searchTerm.trim()}
                  className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg text-base md:text-lg min-w-fit"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  )}
                  {texts.searchBtn}
                </motion.button>
                {searchTerm && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedFilter('all');
                      loadInitialData();
                    }}
                    className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg text-base md:text-lg"
                  >
                    {language === 'arabic' ? 'مسح' : 'Clear'}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          className="mb-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {propertyFilters.map((filter, index) => {
              const IconComponent = filter.icon;
              const count = filter.id === 'all' ? messages.length : stats.find(s => s.property_type === filter.id)?.count || 0;
              const isActive = selectedFilter === filter.id;
              
              return (
                <motion.button
                  key={filter.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  onClick={() => handleStatClick(filter.id)}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-gradient-to-br rounded-2xl p-6 text-white transition-all duration-300 shadow-xl hover:shadow-2xl border ${
                    isActive 
                      ? `${filter.color} ring-2 ring-white/30 shadow-lg border-white/40` 
                      : 'from-gray-600/80 to-gray-800/80 hover:from-gray-500 hover:to-gray-700 border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-bold">{count}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{language === 'arabic' ? filter.label : filter.labelEn}</h3>
                  <div className="flex items-center text-xs opacity-70">
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    <span>{texts.viewDetails}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Properties Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900 rounded-2xl p-8 shadow-2xl border border-gray-700"
        >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 pb-6 border-b border-gray-700">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  {selectedFilter === 'all' ? texts.allProperties : `${language === 'arabic' ? propertyFilters.find(f => f.id === selectedFilter)?.label : propertyFilters.find(f => f.id === selectedFilter)?.labelEn}`}
                </h3>
                <p className="text-gray-400 flex items-center gap-2 text-sm md:text-base">
                  <BuildingOffice2Icon className="h-5 w-5" />
                  {filteredMessages.length} {texts.totalProperties} • {texts.page} {currentPage} {texts.of} {totalPages}
                </p>
              </div>
              
              {/* Filter Reset Button */}
              {selectedFilter !== 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {setSelectedFilter('all'); setCurrentPage(1);}}
                  className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg font-medium text-sm md:text-base"
                >
                  <BuildingOffice2Icon className="h-4 w-4 mr-2 inline" />
                  {language === 'arabic' ? 'عرض الكل' : 'Show All'}
                </motion.button>
              )}
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
              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentMessages.map((message, index) => (
                  <motion.div 
                    key={message.id} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg border border-gray-600"
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
                    </div>

                    {/* Property Content */}
                    <div className="p-6">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        {getPropertyTypeLabel(message.property_type)} - {texts.propertyListing}
                      </h4>
                      
                      <p className="text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
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
                          <p className="text-xs text-gray-400 text-center">
                            {language === 'arabic' ? 'للمزيد من التفاصيل وبيانات الاتصال، يرجى تسجيل الدخول' : 'For more details and contact information, please login'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center justify-between mt-8 bg-gray-750 rounded-lg p-4"
                >
                  <div className="text-gray-400 text-sm">
                    {texts.showingProperties} <span className="text-purple-400 font-semibold">{indexOfFirstMessage + 1}</span> {texts.to} <span className="text-purple-400 font-semibold">{Math.min(indexOfLastMessage, filteredMessages.length)}</span> {texts.of} <span className="text-purple-400 font-semibold">{filteredMessages.length}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                    >
                      {language === 'arabic' ? 'السابق' : 'Previous'}
                    </motion.button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <motion.button
                            key={pageNumber}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-4 py-2 rounded-lg transition-all duration-300 font-semibold ${
                              currentPage === pageNumber
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-110'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                            }`}
                          >
                            {pageNumber}
                          </motion.button>
                        );
                      })}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                    >
                      {language === 'arabic' ? 'التالي' : 'Next'}
                    </motion.button>
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
  );
};

export default HomePage;
