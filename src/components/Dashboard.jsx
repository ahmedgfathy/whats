import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  BugAntIcon,
  ArrowRightOnRectangleIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  BoltIcon,
  StarIcon,
  TrendingUpIcon,
  UsersIcon,
  FireIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import ChatImport from './ChatImport';
import SearchResults from './SearchResults';
import PropertyStats from './PropertyStats';
import { searchMessages, getAllMessages, getMessageById } from '../services/mockDatabase';

const Dashboard = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10);

  const propertyFilters = [
    { id: 'all', label: 'جميع العقارات', icon: BuildingOffice2Icon, color: 'from-purple-500 to-pink-500' },
    { id: 'apartment', label: 'شقق', icon: HomeModernIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'villa', label: 'فيلل', icon: HomeModernIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'land', label: 'أراضي', icon: MapPinIcon, color: 'from-orange-500 to-red-500' },
    { id: 'office', label: 'مكاتب', icon: BuildingStorefrontIcon, color: 'from-indigo-500 to-purple-500' },
    { id: 'warehouse', label: 'مخازن', icon: BuildingLibraryIcon, color: 'from-pink-500 to-rose-500' }
  ];

  const tabs = [
    { 
      id: 'search', 
      label: 'البحث والاستكشاف', 
      icon: MagnifyingGlassIcon, 
      gradient: 'from-purple-500 to-blue-500',
      description: 'ابحث في آلاف العقارات'
    },
    { 
      id: 'import', 
      label: 'استيراد البيانات', 
      icon: ArrowUpTrayIcon, 
      gradient: 'from-blue-500 to-indigo-500',
      description: 'رفع ملفات WhatsApp'
    },
    { 
      id: 'stats', 
      label: 'التحليلات المتقدمة', 
      icon: ChartBarIcon, 
      gradient: 'from-indigo-500 to-purple-500',
      description: 'إحصائيات ذكية'
    },
    { 
      id: 'debug', 
      label: 'أدوات المطور', 
      icon: BugAntIcon, 
      gradient: 'from-purple-500 to-pink-500',
      description: 'أدوات التشخيص'
    }
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await searchMessages(searchTerm, selectedFilter);
      setMessages(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    
    if (searchTerm.trim() || selectedFilter !== 'all') {
      const delayedSearch = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(delayedSearch);
    } else {
      handleSearch();
    }
  }, [searchTerm, selectedFilter]);

  // Calculate pagination
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Debug functions
  const testDatabase = async () => {
    console.log('=== Database Test ===');
    try {
      const allMessages = await getAllMessages();
      console.log('Total messages:', allMessages.length);
      
      if (allMessages.length > 0) {
        const firstMessage = allMessages[0];
        console.log('First message structure:', {
          id: firstMessage.id,
          hasAgentPhone: !!firstMessage.agent_phone,
          hasAgentDescription: !!firstMessage.agent_description,
          hasFullDescription: !!firstMessage.full_description,
          sender: firstMessage.sender,
          propertyType: firstMessage.property_type
        });
        
        const messageById = await getMessageById(firstMessage.id);
        console.log('getMessageById works:', !!messageById);
        
        if (messageById) {
          console.log('Message by ID has all fields:', {
            hasAgentPhone: !!messageById.agent_phone,
            hasAgentDescription: !!messageById.agent_description,
            hasFullDescription: !!messageById.full_description
          });
        }
      }
    } catch (error) {
      console.error('Database test error:', error);
    }
  };

  const testPropertyModal = () => {
    console.log('=== Property Modal Test ===');
    console.log('Available messages for modal test:', messages.length);
    if (messages.length > 0) {
      console.log('First message ID:', messages[0].id);
      console.log('Click on any property card to test the modal');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-slate-900"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative glass border-b border-white/10 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <motion.div 
              className="flex items-center space-x-6" 
              dir="rtl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur opacity-75"></div>
                <div className="relative p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl">
                  <BuildingOffice2Icon className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">
                  منصة العقارات الذكية
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <SparklesIcon className="h-4 w-4 text-purple-400" />
                  <CpuChipIcon className="h-4 w-4 text-purple-400 animate-pulse" />
                  <p className="text-sm text-gray-300">تقنية الذكاء الاصطناعي للبحث المتقدم</p>
                </div>
              </div>
            </motion.div>
            
            <motion.button
              onClick={onLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden flex items-center px-8 py-4 text-sm font-semibold text-gray-300 hover:text-white glass-light rounded-2xl border border-white/20 transition-all duration-300 shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <ArrowRightOnRectangleIcon className="h-5 w-5 ml-3 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative">تسجيل الخروج</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Tabs */}
        <motion.div 
          className="mb-16"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <nav className="relative" dir="rtl">
            <div className="flex space-x-4 glass p-3 rounded-3xl border border-white/20 shadow-2xl">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative overflow-hidden px-8 py-6 text-sm font-bold rounded-2xl transition-all duration-500 flex flex-col items-center space-y-2 min-w-[140px] ${
                      isActive
                        ? 'text-white shadow-2xl transform scale-105'
                        : 'text-gray-300 hover:text-white glass-light'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-2xl`}
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className="relative flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5" />
                        {isActive && <SparklesIcon className="h-4 w-4 animate-pulse" />}
                      </div>
                      <span className="text-xs">{tab.label}</span>
                      <span className="text-xs opacity-70">{tab.description}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </nav>
        </motion.div>

        {/* Search Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Enhanced Search Section */}
              <motion.div 
                className="relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
                <div className="relative glass-light rounded-3xl border border-white/20 p-10 shadow-2xl">
                  <div className="flex flex-col space-y-8">
                    {/* Search Input */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-purple-400 transition-colors duration-300" />
                        <input
                          type="text"
                          placeholder="ابحث عن العقارات المثالية... شقق فاخرة، فيلل، أراضي استثمارية"
                          className="w-full pl-16 pr-8 py-6 bg-slate-800/50 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 text-right text-lg placeholder-gray-400 text-white font-medium shadow-lg backdrop-blur-xl"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          dir="rtl"
                        />
                        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                          <BoltIcon className="h-5 w-5 text-purple-400 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Property Type Filters */}
                    <div className="flex flex-wrap gap-4 justify-center" dir="rtl">
                      {propertyFilters.map((filter, index) => {
                        const IconComponent = filter.icon;
                        const isSelected = selectedFilter === filter.id;
                        
                        return (
                          <motion.button
                            key={filter.id}
                            onClick={() => setSelectedFilter(filter.id)}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            className={`relative overflow-hidden group flex items-center px-8 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${
                              isSelected
                                ? 'text-white shadow-2xl transform scale-105'
                                : 'text-gray-300 hover:text-white glass border border-white/20'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="selectedFilter"
                                className={`absolute inset-0 bg-gradient-to-r ${filter.color} rounded-2xl`}
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                            <div className="relative flex items-center space-x-3">
                              <IconComponent className="h-5 w-5" />
                              <span>{filter.label}</span>
                              {isSelected && <StarIcon className="h-4 w-4 animate-pulse" />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Quick Stats */}
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    >
                      <div className="text-center p-6 glass rounded-2xl border border-white/20">
                        <div className="text-3xl font-bold text-purple-400 mb-2 flex items-center justify-center gap-2">
                          <FireIcon className="h-6 w-6" />
                          {messages.length}+
                        </div>
                        <div className="text-sm text-gray-300">عقار متاح</div>
                      </div>
                      <div className="text-center p-6 glass rounded-2xl border border-white/20">
                        <div className="text-3xl font-bold text-purple-400 mb-2 flex items-center justify-center gap-2">
                          <TrendingUpIcon className="h-6 w-6" />
                          24/7
                        </div>
                        <div className="text-sm text-gray-300">دعم مستمر</div>
                      </div>
                      <div className="text-center p-6 glass rounded-2xl border border-white/20">
                        <div className="text-3xl font-bold text-purple-400 mb-2 flex items-center justify-center gap-2">
                          <CpuChipIcon className="h-6 w-6 animate-pulse" />
                          AI
                        </div>
                        <div className="text-sm text-gray-300">ذكاء اصطناعي</div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Search Results */}
              <SearchResults 
                messages={currentMessages} 
                loading={loading} 
                currentPage={currentPage}
                totalPages={totalPages}
                totalMessages={messages.length}
                onPageChange={handlePageChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Import Tab */}
        {activeTab === 'import' && <ChatImport />}

        {/* Stats Tab */}
        {activeTab === 'stats' && <PropertyStats />}

        {/* Debug Tab */}
        {activeTab === 'debug' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-light rounded-3xl shadow-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-right flex items-center justify-end">
              <BugAntIcon className="h-6 w-6 ml-3 text-purple-400" />
              أدوات المطور والتشخيص
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={testDatabase}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
                >
                  <ChartBarIcon className="h-5 w-5 inline ml-2" />
                  اختبار قاعدة البيانات
                </motion.button>
                <motion.button
                  onClick={testPropertyModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg"
                >
                  <HomeModernIcon className="h-5 w-5 inline ml-2" />
                  اختبار نافذة العقارات
                </motion.button>
              </div>
              <div className="text-center p-6 glass rounded-2xl border border-white/20">
                <p className="text-gray-300 text-sm leading-relaxed">
                  🔧 افتح وحدة تحكم المطور بالضغط على F12 ثم انقر على الأزرار أعلاه لرؤية نتائج الاختبار المفصلة
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
