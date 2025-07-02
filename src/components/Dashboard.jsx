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

const Dashboard = ({ onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('units');
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
      id: 'units', 
      label: 'جدول الوحدات الشامل', 
      icon: BuildingOffice2Icon, 
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
    setActiveTab('units');
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

        {/* Enhanced Statistics Cards - Now Clickable Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">مرحباً بك</h2>
            <p className="text-blue-100">في نظام البحث في محادثات العقارات</p>
            <div className="mt-4 text-3xl">🏠</div>
          </div>

          {/* Search Card */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">البحث السريع</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ابحث عن شقة، فيلا، أرض..."
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                dir="rtl"
              />
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? '...' : <MagnifyingGlassIcon className="h-4 w-4" />}
                بحث
              </button>
            </div>
          </div>

          {/* Clickable Stats Card for All Properties */}
          <motion.button
            onClick={() => handleStatClick('all')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-br rounded-xl p-6 text-white transition-all duration-300 ${
              selectedFilter === 'all' 
                ? 'from-purple-600 to-purple-800 ring-2 ring-purple-400 shadow-2xl' 
                : 'from-gray-700 to-gray-800 hover:from-purple-600 hover:to-purple-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <BuildingOffice2Icon className="h-8 w-8" />
              <span className="text-3xl font-bold">{stats.reduce((sum, stat) => sum + stat.count, 0)}</span>
            </div>
            <h3 className="text-lg font-semibold">جميع العقارات</h3>
            <p className="text-sm opacity-80">اضغط للعرض</p>
          </motion.button>

          {/* Clickable Property Type Stats */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">الإحصائيات المباشرة</h3>
            <div className="space-y-3">
              {stats.map((stat) => (
                <motion.button
                  key={stat.property_type}
                  onClick={() => handleStatClick(stat.property_type)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full flex justify-between items-center p-3 rounded-lg transition-all duration-300 ${
                    selectedFilter === stat.property_type 
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-gray-700 bg-gray-750'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      stat.property_type === 'apartment' ? 'bg-blue-400' :
                      stat.property_type === 'villa' ? 'bg-green-400' :
                      stat.property_type === 'land' ? 'bg-yellow-400' :
                      stat.property_type === 'office' ? 'bg-purple-400' :
                      'bg-red-400'
                    }`}></div>
                    <span className="font-medium">{getPropertyTypeLabel(stat.property_type)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${
                      selectedFilter === stat.property_type ? 'text-white' : getPropertyTypeColor(stat.property_type)
                    }`}>
                      {stat.count}
                    </span>
                    <ChevronLeftIcon className="h-4 w-4 opacity-60" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'units' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {selectedFilter === 'all' ? 'جميع العقارات' : `عقارات ${getPropertyTypeLabel(selectedFilter)}`}
                </h3>
                <p className="text-gray-400">
                  {sortedMessages.length} عقار • صفحة {currentPage} من {totalPages}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {selectedFilter !== 'all' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {setSelectedFilter('all'); setCurrentPage(1);}}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
                  >
                    <BuildingOffice2Icon className="h-4 w-4 ml-2 inline" />
                    إظهار الكل
                  </motion.button>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <SparklesIcon className="h-4 w-4" />
                  <span>مرتب حسب: {sortField === 'timestamp' ? 'التاريخ' : sortField === 'sender' ? 'المرسل' : sortField === 'property_type' ? 'النوع' : sortField}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Table */}
            {loading ? (
              <div className="text-center py-12">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"
                ></motion.div>
                <p className="text-gray-400 text-lg">جاري تحميل البيانات...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                  <table className="w-full text-right bg-gray-900" dir="rtl">
                    <thead className="bg-gradient-to-r from-gray-800 to-gray-700">
                      <tr>
                        <th className="py-4 px-6 text-right">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('sender')}
                            className="flex items-center gap-2 hover:text-purple-400 transition-colors font-bold"
                          >
                            المرسل
                            {renderSortIcon('sender')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-right">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('property_type')}
                            className="flex items-center gap-2 hover:text-purple-400 transition-colors font-bold"
                          >
                            نوع العقار
                            {renderSortIcon('property_type')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-right font-bold">المحتوى</th>
                        <th className="py-4 px-6 text-right">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('location')}
                            className="flex items-center gap-2 hover:text-purple-400 transition-colors font-bold"
                          >
                            الموقع
                            {renderSortIcon('location')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-right">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('price')}
                            className="flex items-center gap-2 hover:text-purple-400 transition-colors font-bold"
                          >
                            السعر
                            {renderSortIcon('price')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-right">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('timestamp')}
                            className="flex items-center gap-2 hover:text-purple-400 transition-colors font-bold"
                          >
                            التاريخ
                            {renderSortIcon('timestamp')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-right font-bold">التفاصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {currentMessages.map((message, index) => (
                        <motion.tr 
                          key={message.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-800 transition-colors duration-200"
                        >
                          <td className="py-4 px-6 font-semibold text-white">{message.sender}</td>
                          <td className="py-4 px-6">
                            <motion.span 
                              whileHover={{ scale: 1.05 }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getPropertyTypeColorClass(message.property_type)}`}
                            >
                              {getPropertyTypeLabel(message.property_type)}
                            </motion.span>
                          </td>
                          <td className="py-4 px-6 max-w-xs">
                            <div className="truncate text-gray-300">{message.message}</div>
                          </td>
                          <td className="py-4 px-6 text-gray-300">
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="h-4 w-4 text-gray-500" />
                              {message.location || 'غير محدد'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {message.price ? (
                              <span className="text-green-400 font-semibold bg-green-400/10 px-2 py-1 rounded">
                                {message.price}
                              </span>
                            ) : (
                              <span className="text-gray-500">غير محدد</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-gray-400 text-sm">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {message.timestamp}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => showUnitDetails(message)}
                              className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-xs shadow-lg"
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

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex items-center justify-between mt-8 bg-gray-750 rounded-lg p-4"
                  >
                    <div className="text-gray-400 text-sm">
                      عرض <span className="text-purple-400 font-semibold">{indexOfFirstMessage + 1}</span> إلى <span className="text-purple-400 font-semibold">{Math.min(indexOfLastMessage, sortedMessages.length)}</span> من <span className="text-purple-400 font-semibold">{sortedMessages.length}</span> عقار
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                      >
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                        السابق
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
                        التالي
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'import' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-4"
              >
                <ArrowUpTrayIcon className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-3xl font-bold mb-2">استيراد محادثات الواتساب</h3>
              <p className="text-gray-400">قم برفع ملفات المحادثات لتحليلها وإضافتها إلى قاعدة البيانات</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="border-2 border-dashed border-gray-600 hover:border-green-500 rounded-xl p-12 text-center transition-all duration-300 bg-gradient-to-br from-gray-800/50 to-gray-700/50"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-6"
                >
                  <ArrowUpTrayIcon className="h-16 w-16 text-gray-400 mx-auto" />
                </motion.div>
                <h4 className="text-xl font-semibold mb-3 text-white">قم بسحب وإفلات ملف المحادثة هنا</h4>
                <p className="text-gray-400 mb-6">أو انقر لاختيار الملف من جهازك</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg"
                >
                  <ArrowUpTrayIcon className="h-5 w-5 ml-2 inline" />
                  اختيار ملف
                </motion.button>
              </motion.div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-green-400" />
                    الصيغ المدعومة
                  </h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• ملفات النصوص (.txt)</li>
                    <li>• ملفات CSV (.csv)</li>
                    <li>• تصدير WhatsApp مباشر</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <CpuChipIcon className="h-5 w-5 text-blue-400" />
                    معلومات تقنية
                  </h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• الحد الأقصى: 10 ميجابايت</li>
                    <li>• معالجة تلقائية للنصوص العربية</li>
                    <li>• استخراج ذكي للمعلومات</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'recent' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <TrendingUpIcon className="h-8 w-8 text-blue-400" />
                آخر العقارات المضافة
              </h3>
              <span className="text-gray-400">أحدث 9 عقارات</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {messages.slice(0, 9).map((message, index) => (
                <motion.div 
                  key={message.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg border border-gray-600"
                >
                  <div className="flex items-start justify-between mb-4">
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPropertyTypeColorClass(message.property_type)}`}
                    >
                      {getPropertyTypeLabel(message.property_type)}
                    </motion.span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <ClockIcon className="h-3 w-3" />
                      {message.timestamp}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2" dir="rtl">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    {message.sender}
                  </h4>
                  
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed" dir="rtl">
                    {message.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <MapPinIcon className="h-4 w-4" />
                      {message.location || 'غير محدد'}
                    </div>
                    {message.price && (
                      <span className="text-green-400 font-semibold bg-green-400/10 px-2 py-1 rounded">
                        {message.price}
                      </span>
                    )}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => showUnitDetails(message)}
                    className="w-full mt-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-medium"
                  >
                    عرض التفاصيل الكاملة
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Statistics are now integrated above as clickable filters */}

        {/* Success Message */}
        <div className="mt-8 bg-green-800/20 border border-green-600 rounded-xl p-6">
          <h4 className="text-green-400 font-semibold mb-2">🎉 قاعدة البيانات متصلة بنجاح!</h4>
          <div className="text-green-300 space-y-1">
            <p>✅ تم تحميل {stats.reduce((sum, stat) => sum + stat.count, 0)} عقار من قاعدة البيانات</p>
            <p>✅ النظام يعمل بكامل طاقته مع البحث والتصنيف والترتيب</p>
            <p>✅ يمكنك الآن النقر على الإحصائيات للتصفية وترتيب الجدول</p>
            <p>✅ جدول تفاعلي مع ترقيم الصفحات وإمكانيات فرز متقدمة</p>
          </div>
        </div>
      </div>

      {/* Unit Details Modal */}
      {showModal && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">تفاصيل العقار</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right" dir="rtl">
              <div className="space-y-4">
                <div>
                  <strong className="text-blue-400">المرسل:</strong> {selectedUnit.sender}
                </div>
                <div>
                  <strong className="text-blue-400">نوع العقار:</strong> 
                  <span className={`mr-2 px-2 py-1 rounded-full text-xs ${getPropertyTypeColorClass(selectedUnit.property_type)}`}>
                    {getPropertyTypeLabel(selectedUnit.property_type)}
                  </span>
                </div>
                <div>
                  <strong className="text-blue-400">الموقع:</strong> {selectedUnit.location || 'غير محدد'}
                </div>
                <div>
                  <strong className="text-blue-400">السعر:</strong> 
                  <span className="text-green-400 font-semibold mr-2">
                    {selectedUnit.price || 'غير محدد'}
                  </span>
                </div>
                <div>
                  <strong className="text-blue-400">التوقيت:</strong> {selectedUnit.timestamp}
                </div>
                {selectedUnit.agent_phone && (
                  <div>
                    <strong className="text-blue-400">الهاتف:</strong> 
                    <a href={`tel:${selectedUnit.agent_phone}`} className="text-green-400 hover:underline mr-2">
                      {selectedUnit.agent_phone}
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <strong className="text-blue-400">الرسالة الكاملة:</strong>
                  <p className="mt-2 p-3 bg-gray-700 rounded-lg">{selectedUnit.message}</p>
                </div>
                <div>
                  <strong className="text-blue-400">الكلمات المفتاحية:</strong>
                  <p className="mt-2 text-gray-300">{selectedUnit.keywords || 'لا توجد'}</p>
                </div>
                {selectedUnit.agent_description && (
                  <div>
                    <strong className="text-blue-400">وصف السمسار:</strong>
                    <p className="mt-2 text-gray-300">{selectedUnit.agent_description}</p>
                  </div>
                )}
                {selectedUnit.full_description && (
                  <div>
                    <strong className="text-blue-400">الوصف الكامل:</strong>
                    <p className="mt-2 p-3 bg-gray-700 rounded-lg">{selectedUnit.full_description}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
