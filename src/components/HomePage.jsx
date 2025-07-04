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
      console.log('Loaded messages:', allMessages.length); // Debug log
      setMessages(allMessages);
      
      const propertyStats = await getPropertyTypeStats();
      console.log('Property stats:', propertyStats); // Debug log
      setStats(propertyStats || []); // Ensure stats is always an array
    } catch (error) {
      console.error('Error loading data:', error);
      setStats([]); // Set empty array on error
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

      {/* Floating Property Icons - Like Login Page */}
      {[
        { Icon: HomeModernIcon, delay: 0, position: "top-24 left-16", rotation: "0deg" },
        { Icon: BuildingOffice2Icon, delay: 0.3, position: "top-40 right-24", rotation: "15deg" },
        { Icon: MapPinIcon, delay: 0.6, position: "bottom-40 left-24", rotation: "-10deg" },
        { Icon: BuildingStorefrontIcon, delay: 0.9, position: "bottom-32 right-16", rotation: "20deg" },
        { Icon: BuildingLibraryIcon, delay: 1.2, position: "top-1/2 left-8", rotation: "-15deg" },
        { Icon: SparklesIcon, delay: 1.5, position: "top-1/3 right-12", rotation: "10deg" }
      ].map(({ Icon, delay, position, rotation }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} text-white/5 pointer-events-none z-5 hidden lg:block`}
          initial={{ opacity: 0, y: 100, rotate: 0 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            rotate: [0, 15, -15, 0],
          }}
          transition={{ 
            delay,
            duration: 2,
            rotate: {
              repeat: Infinity,
              duration: 6,
              ease: "easeInOut"
            }
          }}
          style={{ transform: `rotate(${rotation})` }}
        >
          <Icon className="h-20 w-20" />
        </motion.div>
      ))}

      {/* Animated Phone CRM Feature */}
      <motion.div
        className="fixed bottom-8 right-8 z-50 pointer-events-auto"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: 2,
          duration: 0.8,
          type: "spring",
          stiffness: 200
        }}
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative group"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Phone Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="relative p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
          >
            <PhoneIcon className="h-6 w-6" />
          </motion.button>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute right-full top-1/2 transform -translate-y-1/2 mr-4 px-3 py-2 bg-black/80 backdrop-blur-sm text-white text-sm rounded-lg border border-white/20 whitespace-nowrap pointer-events-none"
          >
            {language === 'arabic' ? 'اتصل بنا - نظام CRM متقدم' : 'Contact Us - Advanced CRM System'}
            <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-black/80"></div>
          </motion.div>

          {/* Pulse Effect */}
          <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping"></div>
        </motion.div>
      </motion.div>

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
                <h1 className="text-xl lg:text-3xl font-bold gradient-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {texts.title}
                </h1>
                <div className="flex items-center space-x-2 mt-2 lg:mt-3">
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

      {/* Hero Section - New Design */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="absolute inset-0">
          <PropertyHeroSlider language={language} isBackground={true} />
        </div>
        
        <div className="relative z-20 w-full">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
              
              {/* Left Side - Hero Content */}
              <motion.div 
                className="text-center lg:text-right space-y-8"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Main Title */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                    <span className="block gradient-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 lg:mb-4">{texts.brandName}</span>
                    <span className="gradient-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {texts.brandSubtitle}
                    </span>
                  </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.p 
                  className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {language === 'arabic' 
                    ? 'اكتشف أفضل العقارات في مصر مع تقنيات الذكاء الاصطناعي المتطورة'
                    : 'Discover the best properties in Egypt with advanced AI technology'
                  }
                </motion.p>

                {/* Features */}
                <motion.div 
                  className="flex flex-wrap justify-center lg:justify-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  {[
                    { icon: CpuChipIcon, text: language === 'arabic' ? 'بحث ذكي' : 'Smart Search' },
                    { icon: ChartBarIcon, text: language === 'arabic' ? 'إحصائيات متقدمة' : 'Advanced Analytics' },
                    { icon: StarIcon, text: language === 'arabic' ? 'عقارات مميزة' : 'Premium Properties' }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-lg"
                    >
                      <feature.icon className="h-5 w-5 text-purple-600" />
                      <span className="text-gray-700 font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <motion.button
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 justify-center"
                  >
                    <UserIcon className="h-5 w-5" />
                    {texts.login}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => document.getElementById('properties-section').scrollIntoView({ behavior: 'smooth' })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-800 font-bold rounded-2xl border-2 border-gray-300 hover:border-purple-400 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 justify-center"
                  >
                    <EyeIcon className="h-5 w-5" />
                    {language === 'arabic' ? 'استكشف العقارات' : 'Explore Properties'}
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Right Side - Search Section */}
              <motion.div 
                className="lg:order-last"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
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
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Search Buttons */}
                    <div className="flex gap-3">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSearch}
                        disabled={loading || !searchTerm.trim()}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg text-base"
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
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedFilter('all');
                            loadInitialData();
                          }}
                          className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg text-base"
                        >
                          {language === 'arabic' ? 'مسح' : 'Clear'}
                        </motion.button>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <motion.div 
                      className="mt-6 grid grid-cols-3 gap-4"
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
      </div>

      {/* Properties Section */}
      <div id="properties-section" className="relative z-20 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Property Type Filter Cards - Enhanced Design */}
        <motion.div 
          className="mb-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
            {propertyFilters.map((filter, index) => {
              // Use BuildingOffice2Icon for all property types
              const IconComponent = BuildingOffice2Icon;
              const count = filter.id === 'all' ? messages.length : stats.find(s => s.property_type === filter.id)?.count || 0;
              const isActive = selectedFilter === filter.id;
              
              // All cards use the same circular shape now
              const shapeClass = 'rounded-full';
              
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
                  {/* Multi-layer glow effect */}
                  <div className={`absolute inset-0 blur-2xl opacity-20 transition-opacity duration-300 ${
                    isActive ? 'opacity-50' : 'group-hover:opacity-40'
                  } bg-gradient-to-r ${filter.color} ${shapeClass}`}></div>
                  
                  <div className={`absolute inset-0 blur-xl opacity-30 transition-opacity duration-300 ${
                    isActive ? 'opacity-60' : 'group-hover:opacity-50'
                  } bg-gradient-to-r ${filter.color} ${shapeClass}`}></div>
                  
                  {/* Main Card - All circular now */}
                  <div className={`
                    relative w-32 h-32 flex flex-col items-center justify-center
                    bg-gradient-to-br transition-all duration-500 shadow-2xl 
                    border-4 border-white/10 group-hover:border-white/30 overflow-hidden
                    ${shapeClass}
                    ${isActive 
                      ? `${filter.color} ring-4 ring-white/40 shadow-3xl border-white/40` 
                      : 'from-slate-700/90 to-slate-800/90 group-hover:from-slate-600/90 group-hover:to-slate-700/90'
                    }
                  `}>
                    
                    {/* Background pattern overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20"></div>
                      {/* Geometric pattern */}
                      <div className="absolute top-2 right-2 w-8 h-8 border border-white/20 rounded-full"></div>
                      <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/10 rounded-full"></div>
                    </div>
                    
                    {/* Content Container - Perfectly Centered */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      {/* Icon Container - centered and consistent */}
                      <div className={`
                        relative rounded-2xl backdrop-blur-sm transition-all duration-300 group-hover:scale-110
                        flex items-center justify-center
                        ${filter.id === 'all' ? 'p-3 mb-2' : 'p-2 mb-1'}
                        ${isActive 
                          ? 'bg-white/40 shadow-lg' 
                          : 'bg-white/20 group-hover:bg-white/30'
                        }
                      `}>
                        <IconComponent className={`text-white drop-shadow-lg ${
                          filter.id === 'all' ? 'h-7 w-7' : 'h-5 w-5'
                        }`} />
                        
                        {/* Pulse animation for active */}
                        {isActive && (
                          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping"></div>
                        )}
                      </div>
                      
                      {/* Count Display - perfectly centered */}
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

                    {/* Animated Border Effects */}
                    {isActive && (
                      <>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`absolute inset-0 border-2 border-white/50 ${shapeClass}`}
                        >
                          <div className={`absolute inset-0 border-2 border-white/30 animate-pulse ${shapeClass}`}></div>
                        </motion.div>
                        
                        {/* Rotating ring effect for all circles */}
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-2 border-2 border-dashed border-white/40 rounded-full"
                        />
                      </>
                    )}
                  </div>
                  
                  {/* Enhanced Label */}
                  <div className="mt-2 text-center">
                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">
                      {language === 'arabic' ? filter.label : filter.labelEn}
                    </h3>
                    <div className="flex items-center justify-center text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FireIcon className="h-3 w-3 mr-1" />
                      </motion.div>
                      <span>{language === 'arabic' ? 'انقر للعرض' : 'Click to View'}</span>
                    </div>
                  </div>
                  
                  {/* Active indicator with enhanced design */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/30"
                    >
                      <StarIcon className="w-5 h-5 text-white animate-pulse" />
                    </motion.div>
                  )}

                  {/* Enhanced floating particles */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-white/60 rounded-full"
                        style={{
                          left: `${15 + i * 20}%`,
                          top: `${25 + i * 12}%`,
                        }}
                        animate={{
                          y: [-15, -30, -15],
                          x: [0, 5, 0],
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.4,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
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
          transition={{ duration: 0.5, delay: 0.4 }}
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
                    onClick={() => navigate(`/property/${message.id}`)}
                    className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg border border-gray-600 cursor-pointer"
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
    </div>
  );
};

export default HomePage;
