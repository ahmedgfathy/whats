import React, { useState, useEffect } from 'react';
import { LogOut, Search, Upload, Building, Home, MapPin, Briefcase, Warehouse, BarChart3, Bug, Sparkles, Zap, Filter, Star, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    { id: 'all', label: 'جميع العقارات', icon: Building },
    { id: 'apartment', label: 'شقق', icon: Home },
    { id: 'villa', label: 'فيلل', icon: Home },
    { id: 'land', label: 'أراضي', icon: MapPin },
    { id: 'office', label: 'مكاتب', icon: Briefcase },
    { id: 'warehouse', label: 'مخازن', icon: Warehouse }
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
    // Load initial data when component mounts
    handleSearch();
  }, []);

  useEffect(() => {
    // Reset to page 1 when search term or filter changes
    setCurrentPage(1);
    
    if (searchTerm.trim() || selectedFilter !== 'all') {
      const delayedSearch = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(delayedSearch);
    } else {
      // If no search term and filter is 'all', load all messages
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
        
        // Test getMessageById
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
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-2xl"
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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-75"></div>
                <div className="relative p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl">
                  <Building className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  منصة العقارات الذكية
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <p className="text-sm text-gray-300">تقنية الذكاء الاصطناعي للبحث المتقدم</p>
                </div>
              </div>
            </motion.div>
            
            <motion.button
              onClick={onLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden flex items-center px-8 py-4 text-sm font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <LogOut className="h-5 w-5 ml-3 group-hover:rotate-12 transition-transform duration-300" />
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
            <div className="flex space-x-4 bg-white/5 backdrop-blur-xl p-3 rounded-3xl border border-white/10 shadow-2xl">
              {[
                { id: 'search', label: 'البحث والاستكشاف', icon: Search, gradient: 'from-purple-500 to-blue-500' },
                { id: 'import', label: 'استيراد البيانات', icon: Upload, gradient: 'from-blue-500 to-indigo-500' },
                { id: 'stats', label: 'التحليلات المتقدمة', icon: BarChart3, gradient: 'from-indigo-500 to-purple-500' },
                { id: 'debug', label: 'أدوات المطور', icon: Bug, gradient: 'from-purple-500 to-pink-500' }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative overflow-hidden px-8 py-5 text-sm font-bold rounded-2xl transition-all duration-500 flex items-center space-x-3 ${
                      isActive
                        ? 'text-white shadow-2xl transform scale-105'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
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
                    <div className="relative flex items-center space-x-3">
                      <IconComponent className="h-5 w-5" />
                      <span>{tab.label}</span>
                      {isActive && <Sparkles className="h-4 w-4 animate-pulse" />}
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
              {/* Search Bar with Modern Glass Effect */}
              <motion.div 
                className="relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-10 shadow-2xl">
                  <div className="flex flex-col space-y-8">
                    {/* Search Input */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative">
                        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-300 h-6 w-6 group-focus-within:text-purple-400 transition-colors duration-300" />
                        <input
                          type="text"
                          placeholder="ابحث عن العقارات المثالية... شقق فاخرة، فيلل، أراضي استثمارية"
                          className="w-full pl-16 pr-8 py-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 focus:bg-white/15 transition-all duration-300 text-right text-lg placeholder-gray-400 text-white font-medium shadow-lg"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          dir="rtl"
                        />
                        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                          <Zap className="h-5 w-5 text-purple-400 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Property Type Filters */}
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
                                : 'text-gray-300 hover:text-white backdrop-blur-xl bg-white/5 hover:bg-white/15 border border-white/10'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="selectedFilter"
                                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                            <div className="relative flex items-center space-x-3">
                              <IconComponent className="h-5 w-5" />
                              <span>{filter.label}</span>
                              {isSelected && <Star className="h-4 w-4 animate-pulse" />}
                            </div>
                            {!isSelected && (
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Quick Stats */}
                    <motion.div 
                      className="flex justify-center space-x-8 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    >
                      <div className="text-gray-300">
                        <div className="text-2xl font-bold text-purple-400">{messages.length}+</div>
                        <div className="text-sm">عقار متاح</div>
                      </div>
                      <div className="text-gray-300">
                        <div className="text-2xl font-bold text-blue-400">24/7</div>
                        <div className="text-sm">دعم مستمر</div>
                      </div>
                      <div className="text-gray-300">
                        <div className="text-2xl font-bold text-indigo-400">AI</div>
                        <div className="text-sm">ذكاء اصطناعي</div>
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
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-500/10 p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right flex items-center justify-end">
              <Bug className="h-6 w-6 ml-3 text-blue-600" />
              أدوات المطور والتشخيص
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={testDatabase}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
                >
                  <BarChart3 className="h-5 w-5 inline ml-2" />
                  اختبار قاعدة البيانات
                </button>
                <button
                  onClick={testPropertyModal}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
                >
                  <Home className="h-5 w-5 inline ml-2" />
                  اختبار نافذة العقارات
                </button>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                <p className="text-gray-600 text-sm leading-relaxed">
                  🔧 افتح وحدة تحكم المطور بالضغط على F12 ثم انقر على الأزرار أعلاه لرؤية نتائج الاختبار المفصلة
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
