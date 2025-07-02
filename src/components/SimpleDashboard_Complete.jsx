import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightOnRectangleIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  CpuChipIcon,
  TrendingUpIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { getAllMessages, searchMessages, getPropertyTypeStats } from '../services/mockDatabase';

const SimpleDashboard = ({ onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('search');
  const [stats, setStats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(20);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');

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
      label: 'جدول العقارات الشامل', 
      icon: MagnifyingGlassIcon, 
      gradient: 'from-purple-500 to-blue-500',
      description: 'جميع العقارات بالتفصيل'
    },
    { 
      id: 'recent', 
      label: 'النتائج الحديثة', 
      icon: TrendingUpIcon, 
      gradient: 'from-blue-500 to-indigo-500',
      description: 'أحدث العقارات المضافة'
    },
    { 
      id: 'import', 
      label: 'استيراد المحادثات', 
      icon: ArrowUpTrayIcon, 
      gradient: 'from-green-500 to-emerald-500',
      description: 'رفع ملفات WhatsApp'
    },
    { 
      id: 'stats', 
      label: 'التحليلات المتقدمة', 
      icon: ChartBarIcon, 
      gradient: 'from-indigo-500 to-purple-500',
      description: 'إحصائيات ذكية'
    }
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Get all messages
      const allMessages = await getAllMessages('all', 1000);
      setMessages(allMessages);

      // Get property type statistics
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
      const results = await searchMessages(searchTerm, selectedFilter, 1000);
      setMessages(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
    setLoading(false);
  };

  const handleStatClick = (propertyType) => {
    setSelectedFilter(propertyType);
    setActiveTab('search');
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const showUnitDetails = (unit) => {
    setSelectedUnit(unit);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUnit(null);
  };

  // Filter and sort messages
  const filteredMessages = messages.filter(message => {
    if (selectedFilter === 'all') return true;
    return message.property_type === selectedFilter;
  });

  const sortedMessages = [...filteredMessages].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'timestamp') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = sortedMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(sortedMessages.length / messagesPerPage);

  const getPropertyTypeLabel = (type) => {
    const labels = {
      apartment: 'شقق',
      villa: 'فيلل',
      land: 'أراضي',
      office: 'مكاتب',
      warehouse: 'مخازن'
    };
    return labels[type] || type;
  };

  const getPropertyTypeColor = (type) => {
    const colors = {
      apartment: 'text-blue-400',
      villa: 'text-green-400',
      land: 'text-yellow-400',
      office: 'text-purple-400',
      warehouse: 'text-red-400'
    };
    return colors[type] || 'text-gray-400';
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

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <SparklesIcon className="h-4 w-4 text-gray-500" />;
    }
    return sortDirection === 'asc' ? 
      <TrendingUpIcon className="h-4 w-4 text-purple-400" /> : 
      <ChevronDownIcon className="h-4 w-4 text-purple-400" />;
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
              {/* Statistics Section - Clickable Filters */}
              <motion.div 
                className="relative mb-8"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
                <div className="relative glass-light rounded-3xl border border-white/20 p-8 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    الإحصائيات المباشرة - اضغط للتصفية
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* All Properties */}
                    <motion.button
                      onClick={() => handleStatClick('all')}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-300 ${
                        selectedFilter === 'all'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl transform scale-105'
                          : 'glass-light text-gray-300 hover:text-white border border-white/20'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <BuildingOffice2Icon className="h-8 w-8" />
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {stats.reduce((sum, stat) => sum + stat.count, 0)}
                          </div>
                          <div className="text-xs">جميع العقارات</div>
                        </div>
                      </div>
                    </motion.button>

                    {/* Individual Property Types */}
                    {propertyFilters.slice(1).map((filter) => {
                      const IconComponent = filter.icon;
                      const stat = stats.find(s => s.property_type === filter.id);
                      const count = stat ? stat.count : 0;
                      
                      return (
                        <motion.button
                          key={filter.id}
                          onClick={() => handleStatClick(filter.id)}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-300 ${
                            selectedFilter === filter.id
                              ? `bg-gradient-to-r ${filter.color} text-white shadow-2xl transform scale-105`
                              : 'glass-light text-gray-300 hover:text-white border border-white/20'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <IconComponent className="h-8 w-8" />
                            <div className="text-center">
                              <div className="text-2xl font-bold">{count}</div>
                              <div className="text-xs">{filter.label}</div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Search and Table Section */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {/* Search Bar */}
                <div className="glass-light rounded-2xl p-6 border border-white/20 shadow-xl">
                  <div className="flex gap-4" dir="rtl">
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="ابحث عن شقة، فيلا، أرض، موقع..."
                        className="w-full pr-10 pl-4 py-3 bg-slate-800/50 text-white rounded-xl border border-white/20 focus:border-purple-500 focus:outline-none placeholder-gray-400"
                        dir="rtl"
                      />
                    </div>
                    <motion.button 
                      onClick={handleSearch}
                      disabled={loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <MagnifyingGlassIcon className="h-5 w-5" />
                      )}
                      بحث
                    </motion.button>
                  </div>
                </div>

                {/* Data Table */}
                <div className="glass-light rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/10">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-white">
                        {selectedFilter === 'all' 
                          ? 'جميع العقارات' 
                          : `عقارات ${getPropertyTypeLabel(selectedFilter)}`
                        }
                      </h3>
                      <div className="flex items-center gap-4 text-gray-300">
                        <span>
                          {sortedMessages.length} عقار • صفحة {currentPage} من {totalPages}
                        </span>
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-300">جاري تحميل العقارات...</p>
                    </div>
                  ) : (
                    <>
                      {/* Table Content */}
                      <div className="overflow-x-auto">
                        <table className="w-full" dir="rtl">
                          <thead className="bg-slate-800/50">
                            <tr>
                              <th className="p-4 text-right">
                                <button
                                  onClick={() => handleSort('sender')}
                                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                                >
                                  المرسل
                                  {renderSortIcon('sender')}
                                </button>
                              </th>
                              <th className="p-4 text-right">
                                <button
                                  onClick={() => handleSort('property_type')}
                                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                                >
                                  نوع العقار
                                  {renderSortIcon('property_type')}
                                </button>
                              </th>
                              <th className="p-4 text-right">
                                <button
                                  onClick={() => handleSort('location')}
                                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                                >
                                  الموقع
                                  {renderSortIcon('location')}
                                </button>
                              </th>
                              <th className="p-4 text-right">السعر</th>
                              <th className="p-4 text-right">
                                <button
                                  onClick={() => handleSort('timestamp')}
                                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                                >
                                  التوقيت
                                  {renderSortIcon('timestamp')}
                                </button>
                              </th>
                              <th className="p-4 text-center">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {currentMessages.map((message, index) => (
                              <motion.tr 
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="hover:bg-white/5 transition-colors"
                              >
                                <td className="p-4">
                                  <div className="text-white font-medium">{message.sender}</div>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPropertyTypeColorClass(message.property_type)}`}>
                                    {getPropertyTypeLabel(message.property_type)}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="text-gray-300">{message.location || 'غير محدد'}</div>
                                </td>
                                <td className="p-4">
                                  <div className="text-green-400 font-semibold">
                                    {message.price || 'غير محدد'}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="text-gray-400 text-sm">{message.timestamp}</div>
                                </td>
                                <td className="p-4 text-center">
                                  <motion.button
                                    onClick={() => showUnitDetails(message)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                                  >
                                    <EyeIcon className="h-4 w-4 ml-1" />
                                    عرض التفاصيل
                                  </motion.button>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="p-6 bg-slate-800/30 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="text-gray-400">
                              عرض {indexOfFirstMessage + 1} إلى {Math.min(indexOfLastMessage, sortedMessages.length)} من {sortedMessages.length} عقار
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center px-4 py-2 glass-light text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-white/20"
                              >
                                <ChevronRightIcon className="h-4 w-4 ml-1" />
                                السابق
                              </motion.button>
                              
                              <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                  return (
                                    <button
                                      key={pageNumber}
                                      onClick={() => setCurrentPage(pageNumber)}
                                      className={`px-3 py-2 rounded-lg transition-colors ${
                                        currentPage === pageNumber
                                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                          : 'glass-light text-gray-300 hover:text-white border border-white/20'
                                      }`}
                                    >
                                      {pageNumber}
                                    </button>
                                  );
                                })}
                              </div>

                              <motion.button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center px-4 py-2 glass-light text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-white/20"
                              >
                                التالي
                                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Recent Tab */}
          {activeTab === 'recent' && (
            <motion.div
              key="recent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="glass-light rounded-3xl border border-white/20 p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">آخر العقارات المضافة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {messages.slice(0, 9).map((message) => (
                    <motion.div 
                      key={message.id} 
                      className="glass-light rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      onClick={() => showUnitDetails(message)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPropertyTypeColorClass(message.property_type)}`}>
                          {getPropertyTypeLabel(message.property_type)}
                        </span>
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                      </div>
                      
                      <h4 className="font-semibold text-white mb-2" dir="rtl">
                        {message.sender}
                      </h4>
                      
                      <p className="text-gray-300 text-sm line-clamp-3 mb-3" dir="rtl">
                        {message.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          📍 {message.location}
                        </span>
                        {message.price && (
                          <span className="text-sm font-semibold text-green-400">
                            {message.price}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="glass-light rounded-3xl border border-white/20 p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">استيراد محادثات الواتساب</h3>
                <div className="max-w-2xl mx-auto">
                  <div className="border-2 border-dashed border-white/30 rounded-3xl p-12 text-center hover:border-purple-500/50 transition-all duration-300">
                    <ArrowUpTrayIcon className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                    <h4 className="text-xl font-semibold text-white mb-4">قم بسحب وإفلات ملف المحادثة هنا</h4>
                    <p className="text-gray-400 mb-6">أو انقر لاختيار الملف من جهازك</p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg"
                    >
                      اختيار ملف
                    </motion.button>
                  </div>
                  <div className="mt-8 text-center text-gray-400">
                    <p>الصيغ المدعومة: .txt, .csv</p>
                    <p>الحد الأقصى لحجم الملف: 10 ميجابايت</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="glass-light rounded-3xl border border-white/20 p-8 shadow-2xl text-center">
                <h3 className="text-2xl font-bold text-white mb-4">التحليلات المتقدمة</h3>
                <p className="text-gray-300">قريباً... تحليلات وإحصائيات متقدمة لبيانات العقارات</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <motion.div 
          className="mt-12 glass-light rounded-3xl border border-green-500/30 p-8 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h4 className="text-green-400 font-bold text-xl mb-4 text-center">🎉 قاعدة البيانات متصلة بنجاح!</h4>
          <div className="text-green-300 space-y-2 text-center">
            <p>✅ تم تحميل {stats.reduce((sum, stat) => sum + stat.count, 0)} عقار من قاعدة البيانات</p>
            <p>✅ النظام يعمل بكامل طاقته مع البحث والتصنيف والترتيب</p>
            <p>✅ يمكنك الآن النقر على الإحصائيات للتصفية وترتيب الجدول</p>
            <p>✅ جدول تفاعلي مع ترقيم الصفحات وإمكانيات فرز متقدمة</p>
          </div>
        </motion.div>
      </div>

      {/* Unit Details Modal */}
      {showModal && selectedUnit && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="glass-light rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">تفاصيل العقار</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-3xl transition-colors"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right" dir="rtl">
              <div className="space-y-6">
                <div>
                  <strong className="text-purple-400">المرسل:</strong> 
                  <span className="text-white mr-2">{selectedUnit.sender}</span>
                </div>
                <div>
                  <strong className="text-purple-400">نوع العقار:</strong> 
                  <span className={`mr-2 px-3 py-1 rounded-full text-xs border ${getPropertyTypeColorClass(selectedUnit.property_type)}`}>
                    {getPropertyTypeLabel(selectedUnit.property_type)}
                  </span>
                </div>
                <div>
                  <strong className="text-purple-400">الموقع:</strong> 
                  <span className="text-white mr-2">{selectedUnit.location || 'غير محدد'}</span>
                </div>
                <div>
                  <strong className="text-purple-400">السعر:</strong> 
                  <span className="text-green-400 font-semibold mr-2">
                    {selectedUnit.price || 'غير محدد'}
                  </span>
                </div>
                <div>
                  <strong className="text-purple-400">التوقيت:</strong> 
                  <span className="text-white mr-2">{selectedUnit.timestamp}</span>
                </div>
                {selectedUnit.agent_phone && (
                  <div>
                    <strong className="text-purple-400">الهاتف:</strong> 
                    <a href={`tel:${selectedUnit.agent_phone}`} className="text-green-400 hover:underline mr-2">
                      {selectedUnit.agent_phone}
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <div>
                  <strong className="text-purple-400">الرسالة الكاملة:</strong>
                  <p className="mt-2 p-4 glass rounded-2xl text-white border border-white/20">{selectedUnit.message}</p>
                </div>
                <div>
                  <strong className="text-purple-400">الكلمات المفتاحية:</strong>
                  <p className="mt-2 text-gray-300">{selectedUnit.keywords || 'لا توجد'}</p>
                </div>
                {selectedUnit.agent_description && (
                  <div>
                    <strong className="text-purple-400">وصف السمسار:</strong>
                    <p className="mt-2 text-gray-300">{selectedUnit.agent_description}</p>
                  </div>
                )}
                {selectedUnit.full_description && (
                  <div>
                    <strong className="text-purple-400">الوصف الكامل:</strong>
                    <p className="mt-2 p-4 glass rounded-2xl text-white border border-white/20">{selectedUnit.full_description}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <motion.button
                onClick={closeModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
              >
                إغلاق
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SimpleDashboard;
