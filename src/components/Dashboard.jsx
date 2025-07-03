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
  ChartBarIcon,
  LanguageIcon,
  ShieldCheckIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { getAllMessages, searchMessages, getPropertyTypeStats, removeDuplicateMessages } from '../services/apiService';
import ChatImport from './ChatImport';

const Dashboard = ({ onLogout, onLanguageSwitch }) => {
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
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminResult, setAdminResult] = useState(null);

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
      icon: ChartBarIcon, 
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
      id: 'admin', 
      label: 'إدارة النظام', 
      icon: ShieldCheckIcon, 
      gradient: 'from-red-500 to-pink-500',
      description: 'أدوات الإدارة والصيانة'
    }
  ];

  // Debug: Monitor messages state changes
  useEffect(() => {
    console.log('Dashboard: Messages state updated:', messages.length);
  }, [messages]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Debug: Monitor messages state changes
  useEffect(() => {
    console.log('Dashboard: Messages state updated to length:', messages.length);
  }, [messages]);

  // Debug: Monitor stats changes
  useEffect(() => {
    console.log('Dashboard: Stats state updated:', stats);
    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    console.log('Dashboard: Total from current stats state:', total);
  }, [stats]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      console.log('Dashboard: Loading initial data...');
      
      // Get all messages - remove the limit to get actual count
      const allMessages = await getAllMessages('all', 10000);
      console.log(`Dashboard: Loaded ${allMessages.length} messages`);
      setMessages(allMessages);

      // Get property type statistics
      const propertyStats = await getPropertyTypeStats();
      console.log('Dashboard: Property stats:', propertyStats);
      setStats(propertyStats);
      
      const totalCount = propertyStats.reduce((sum, stat) => sum + stat.count, 0);
      console.log(`Dashboard: Total count from stats: ${totalCount}`);
      console.log(`Dashboard: Messages length: ${allMessages.length}`);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  // Admin function: Remove duplicates
  const handleRemoveDuplicates = async () => {
    if (!window.confirm('هل أنت متأكد من حذف الرسائل المكررة؟ هذا الإجراء غير قابل للتراجع.')) {
      return;
    }
    
    setAdminLoading(true);
    setAdminResult(null);
    
    try {
      console.log('Dashboard: Starting duplicate removal...');
      const result = await removeDuplicateMessages();
      
      setAdminResult({
        success: true,
        message: result.message,
        removed: result.removed,
        totalBefore: result.totalBefore,
        totalAfter: result.totalAfter
      });
      
      // Refresh data after cleanup
      await loadInitialData();
      
    } catch (error) {
      console.error('Error removing duplicates:', error);
      setAdminResult({
        success: false,
        message: 'حدث خطأ أثناء حذف الرسائل المكررة'
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadInitialData();
      return;
    }

    setLoading(true);
    try {
      const results = await searchMessages(searchTerm, selectedFilter, 10000);
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
      <ChevronUpIcon className="h-4 w-4 text-blue-400" /> : 
      <ChevronDownIcon className="h-4 w-4 text-blue-400" />;
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
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <motion.div 
              className="flex items-center gap-6" 
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
                <div className="flex items-center space-x-2 mt-2">
                  <SparklesIcon className="h-4 w-4 text-purple-400" />
                  <CpuChipIcon className="h-4 w-4 text-purple-400 animate-pulse" />
                  <p className="text-sm text-gray-300">تقنية الذكاء الاصطناعي للبحث المتقدم</p>
                </div>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-8 mr-16">
              {/* Language Switcher */}
              <motion.button
                onClick={onLanguageSwitch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden flex items-center px-6 py-3 text-sm font-semibold text-gray-300 hover:text-white glass-light rounded-2xl border border-white/20 transition-all duration-300 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <LanguageIcon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative">English</span>
              </motion.button>

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
        </div>
      </motion.header>

      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Tabs */}
        <motion.div 
          className="mb-16"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <nav className="relative" dir="rtl">
            <div className="flex justify-center gap-4 glass p-4 rounded-3xl border border-white/20 shadow-2xl max-w-5xl mx-auto">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative overflow-hidden px-8 py-5 text-sm font-bold rounded-2xl transition-all duration-500 flex flex-col items-center space-y-2 min-w-[160px] ${
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
                    <div className="relative z-10 flex flex-col items-center space-y-2">
                      <IconComponent className="h-6 w-6" />
                      <span className="text-xs font-medium">{tab.label}</span>
                      <span className="text-xs opacity-70">{tab.description}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </nav>
        </motion.div>

        {/* Enhanced Statistics Cards - Now Clickable Filters */}
        {/* First Row - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Welcome Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-400/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <span className="text-2xl">🏠</span>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium">
                مرحباً
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">أهلاً وسهلاً</h2>
            <p className="text-blue-100 text-sm leading-relaxed">في منصة العقارات الذكية لتحليل محادثات الواتساب</p>
          </motion.div>

          {/* Search Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-600/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">البحث الذكي</h3>
              <div className="bg-blue-500 p-2 rounded-lg">
                <MagnifyingGlassIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ابحث عن شقة، فيلا، أرض..."
                className="flex-1 px-3 py-2 bg-slate-600/50 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 placeholder-slate-300 text-sm"
                dir="rtl"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-1 font-medium shadow-lg text-sm"
              >
                {loading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <MagnifyingGlassIcon className="h-3 w-3" />
                )}
                بحث
              </motion.button>
            </div>
          </motion.div>

          {/* Total Properties Card */}
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => handleStatClick('all')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-br rounded-2xl p-6 text-white transition-all duration-300 shadow-xl hover:shadow-2xl border ${
              selectedFilter === 'all' 
                ? 'from-purple-500 to-purple-700 ring-2 ring-purple-300 shadow-purple-500/25 border-purple-400/50' 
                : 'from-gray-600 to-gray-800 hover:from-purple-500 hover:to-purple-700 border-gray-600/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <BuildingOffice2Icon className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold">{messages.length}</span>
            </div>
            <h3 className="text-lg font-bold mb-2">جميع العقارات</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-3">اضغط لعرض كافة العقارات</p>
            <div className="flex items-center text-xs opacity-70">
              <SparklesIcon className="h-3 w-3 ml-1" />
              <span>قابل للتفاعل</span>
            </div>
          </motion.button>
        </div>

        {/* Second Row - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          
          {/* Apartments Card */}
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => handleStatClick('apartment')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-br rounded-2xl p-6 text-white transition-all duration-300 shadow-xl hover:shadow-2xl border ${
              selectedFilter === 'apartment' 
                ? 'from-blue-500 to-blue-700 ring-2 ring-blue-300 shadow-blue-500/25 border-blue-400/50' 
                : 'from-blue-600/80 to-blue-800/80 hover:from-blue-500 hover:to-blue-700 border-blue-600/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <HomeModernIcon className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold">{stats.find(s => s.property_type === 'apartment')?.count || 0}</span>
            </div>
            <h3 className="text-lg font-bold mb-2">الشقق</h3>
            <p className="text-sm opacity-80 leading-relaxed">شقق سكنية للبيع والإيجار</p>
          </motion.button>

          {/* Villas Card */}
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            onClick={() => handleStatClick('villa')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-br rounded-2xl p-6 text-white transition-all duration-300 shadow-xl hover:shadow-2xl border ${
              selectedFilter === 'villa' 
                ? 'from-green-500 to-green-700 ring-2 ring-green-300 shadow-green-500/25 border-green-400/50' 
                : 'from-green-600/80 to-green-800/80 hover:from-green-500 hover:to-green-700 border-green-600/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <HomeModernIcon className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold">{stats.find(s => s.property_type === 'villa')?.count || 0}</span>
            </div>
            <h3 className="text-lg font-bold mb-2">الفيلل</h3>
            <p className="text-sm opacity-80 leading-relaxed">فيلل مستقلة ودوبلكس</p>
          </motion.button>

          {/* Land Card */}
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            onClick={() => handleStatClick('land')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-br rounded-2xl p-6 text-white transition-all duration-300 shadow-xl hover:shadow-2xl border ${
              selectedFilter === 'land' 
                ? 'from-orange-500 to-orange-700 ring-2 ring-orange-300 shadow-orange-500/25 border-orange-400/50' 
                : 'from-orange-600/80 to-orange-800/80 hover:from-orange-500 hover:to-orange-700 border-orange-600/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <MapPinIcon className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold">{stats.find(s => s.property_type === 'land')?.count || 0}</span>
            </div>
            <h3 className="text-lg font-bold mb-2">الأراضي</h3>
            <p className="text-sm opacity-80 leading-relaxed">أراضي سكنية وتجارية</p>
          </motion.button>

          {/* Commercial Properties Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-600/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">العقارات التجارية</h3>
              <div className="bg-emerald-500 p-2 rounded-lg">
                <BuildingStorefrontIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <motion.button
                onClick={() => handleStatClick('office')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex justify-between items-center p-2 rounded-lg transition-all duration-300 text-sm ${
                  selectedFilter === 'office' 
                    ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                    : 'hover:bg-gray-700 bg-gray-800/50 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="font-medium text-sm">المكاتب</span>
                </div>
                <span className="font-bold text-purple-400">{stats.find(s => s.property_type === 'office')?.count || 0}</span>
              </motion.button>
              <motion.button
                onClick={() => handleStatClick('warehouse')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex justify-between items-center p-2 rounded-lg transition-all duration-300 text-sm ${
                  selectedFilter === 'warehouse' 
                    ? 'bg-red-600 text-white shadow-lg transform scale-105' 
                    : 'hover:bg-gray-700 bg-gray-800/50 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <span className="font-medium text-sm">المخازن</span>
                </div>
                <span className="font-bold text-red-400">{stats.find(s => s.property_type === 'warehouse')?.count || 0}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'units' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900 rounded-2xl p-8 shadow-2xl border border-gray-700"
          >
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-700">
              <div>
                <h3 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  {selectedFilter === 'all' ? 'جميع العقارات' : `عقارات ${getPropertyTypeLabel(selectedFilter)}`}
                </h3>
                <p className="text-gray-400 flex items-center gap-2">
                  <BuildingOffice2Icon className="h-5 w-5" />
                  {sortedMessages.length} عقار • صفحة {currentPage} من {totalPages}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {selectedFilter !== 'all' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {setSelectedFilter('all'); setCurrentPage(1);}}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg font-medium"
                  >
                    <BuildingOffice2Icon className="h-4 w-4 ml-2 inline" />
                    إظهار الكل
                  </motion.button>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-lg border border-gray-600">
                  <SparklesIcon className="h-4 w-4" />
                  <span>مرتب حسب: {sortField === 'timestamp' ? 'التاريخ' : sortField === 'sender' ? 'المرسل' : sortField === 'property_type' ? 'النوع' : sortField}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Table */}
            {loading ? (
              <div className="text-center py-16">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                />
                <p className="mt-4 text-gray-300">جاري تحميل البيانات...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-gray-600 shadow-lg">
                  <table className="w-full text-right bg-gray-900" dir="rtl">
                    <thead className="bg-gradient-to-r from-gray-700 to-gray-800 border-b border-gray-600">
                      <tr>
                        <th className="py-4 px-6 text-right w-36">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('sender')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-gray-200"
                          >
                            المرسل
                            {renderSortIcon('sender')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-right w-32 font-bold text-gray-200">رقم السمسار</th>
                        <th className="py-4 px-6 text-right w-28">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('property_type')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-gray-200"
                          >
                            نوع العقار
                            {renderSortIcon('property_type')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-right font-bold text-gray-200 min-w-[280px]">المحتوى</th>
                        <th className="py-4 px-6 text-right w-32">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('location')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-gray-200"
                          >
                            الموقع
                            {renderSortIcon('location')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-right w-36">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('price')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-gray-200"
                          >
                            السعر
                            {renderSortIcon('price')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-right w-32">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('timestamp')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-gray-200"
                          >
                            التاريخ
                            {renderSortIcon('timestamp')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-right font-bold text-gray-200 w-32">التفاصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {currentMessages.map((message, index) => (
                        <motion.tr 
                          key={message.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-800 transition-colors duration-200 group"
                        >
                          <td className="py-4 px-6 font-semibold text-white w-36">{message.sender}</td>
                          <td className="py-4 px-6 w-32">
                            <span className="text-green-400 font-mono text-sm bg-green-400/10 px-2 py-1 rounded border border-green-400/30" dir="ltr">
                              {message.agent_phone || 'غير متاح'}
                            </span>
                          </td>
                          <td className="py-4 px-6 w-28">
                            <motion.span 
                              whileHover={{ scale: 1.05 }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getPropertyTypeColorClass(message.property_type)}`}
                            >
                              {getPropertyTypeLabel(message.property_type)}
                            </motion.span>
                          </td>
                          <td className="py-4 px-6 min-w-[280px]">
                            <div className="text-gray-300 leading-relaxed">{message.message}</div>
                          </td>
                          <td className="py-4 px-6 text-gray-300 w-32">
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="h-4 w-4 text-gray-500" />
                              {message.location || 'غير محدد'}
                            </div>
                          </td>
                          <td className="py-4 px-6 w-36">
                            {message.price ? (
                              <span className="text-emerald-400 font-semibold bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/30 text-sm">
                                {message.price}
                              </span>
                            ) : (
                              <span className="text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full text-sm">غير محدد</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-gray-400 text-sm w-32">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {message.timestamp}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right w-32">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => showUnitDetails(message)}
                              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm shadow-md hover:shadow-lg font-medium"
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
          <ChatImport onImportSuccess={loadInitialData} />
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
                <ChartBarIcon className="h-8 w-8 text-blue-400" />
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

        {activeTab === 'admin' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-red-900/30 via-gray-900 to-pink-900/30 rounded-2xl p-8 shadow-2xl border border-red-500/20"
          >
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-red-500/20">
              <div>
                <h3 className="text-3xl font-bold text-red-400 flex items-center gap-3">
                  <ShieldCheckIcon className="h-8 w-8" />
                  إدارة النظام
                </h3>
                <p className="text-gray-400 mt-2">أدوات صيانة وإدارة قاعدة البيانات</p>
              </div>
              <div className="bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/30">
                <span className="text-red-400 text-sm font-medium">منطقة إدارية</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Remove Duplicates Section */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-xl p-6 border border-orange-500/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrashIcon className="h-6 w-6 text-orange-400" />
                  <h4 className="text-xl font-bold text-orange-400">إزالة التكرار</h4>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  حذف الرسائل المكررة من قاعدة البيانات بناءً على نص الرسالة واسم المرسل. هذا يساعد في تنظيف البيانات وتحسين الأداء.
                </p>

                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-400 font-medium text-sm">تحذير</span>
                  </div>
                  <p className="text-yellow-300 text-sm">
                    هذا الإجراء غير قابل للتراجع. تأكد من عمل نسخة احتياطية قبل المتابعة.
                  </p>
                </div>

                <motion.button
                  onClick={handleRemoveDuplicates}
                  disabled={adminLoading}
                  whileHover={{ scale: adminLoading ? 1 : 1.02 }}
                  whileTap={{ scale: adminLoading ? 1 : 0.98 }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {adminLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      جارٍ حذف التكرار...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-5 w-5" />
                      حذف الرسائل المكررة
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Statistics Section */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl p-6 border border-blue-500/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <ChartBarIcon className="h-6 w-6 text-blue-400" />
                  <h4 className="text-xl font-bold text-blue-400">إحصائيات النظام</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">إجمالي الرسائل</span>
                    <span className="text-blue-400 font-bold">{messages.length.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">إجمالي العقارات</span>
                    <span className="text-green-400 font-bold">
                      {stats.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">أنواع العقارات</span>
                    <span className="text-purple-400 font-bold">{stats.length}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Result Message */}
            {adminResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 p-6 rounded-xl border ${
                  adminResult.success 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {adminResult.success ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h4 className={`font-bold mb-2 ${adminResult.success ? 'text-green-400' : 'text-red-400'}`}>
                      {adminResult.success ? 'تمت العملية بنجاح' : 'فشلت العملية'}
                    </h4>
                    <p className="text-gray-300 mb-3">{adminResult.message}</p>
                    {adminResult.success && adminResult.removed !== undefined && (
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>• تم حذف {adminResult.removed} رسالة مكررة</p>
                        <p>• العدد قبل التنظيف: {adminResult.totalBefore.toLocaleString()}</p>
                        <p>• العدد بعد التنظيف: {adminResult.totalAfter.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Statistics are now integrated above as clickable filters */}

        {/* Success Message */}
        <div className="mt-8 bg-green-800/20 border border-green-600 rounded-xl p-6">
          <h4 className="text-green-400 font-semibold mb-2">🎉 قاعدة البيانات متصلة بنجاح!</h4>
          <div className="text-green-300 space-y-1">
            <p>✅ تم تحميل {messages.length} عقار من قاعدة البيانات</p>
            <p>✅ النظام يعمل بكامل طاقته مع البحث والتصنيف والترتيب</p>
            <p>✅ يمكنك الآن النقر على الإحصائيات للتصفية وترتيب الجدول</p>
            <p>✅ جدول تفاعلي مع ترقيم الصفحات وإمكانيات فرز متقدمة</p>
          </div>
        </div>
      </div>

      {/* Unit Details Modal */}
      {showModal && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-slate-100 to-white rounded-2xl p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                تفاصيل العقار
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right" dir="rtl">
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <strong className="text-blue-700 block mb-2">المرسل:</strong> 
                  <span className="text-gray-800 font-medium">{selectedUnit.sender}</span>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <strong className="text-purple-700 block mb-2">نوع العقار:</strong> 
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedUnit.property_type === 'apartment' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                    selectedUnit.property_type === 'villa' ? 'bg-green-100 text-green-800 border border-green-300' :
                    selectedUnit.property_type === 'land' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                    selectedUnit.property_type === 'office' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                    'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {getPropertyTypeLabel(selectedUnit.property_type)}
                  </span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <strong className="text-green-700 block mb-2">الموقع:</strong> 
                  <span className="text-gray-800">{selectedUnit.location || 'غير محدد'}</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <strong className="text-emerald-700 block mb-2">السعر:</strong> 
                  <span className="text-emerald-600 font-bold text-lg">
                    {selectedUnit.price || 'غير محدد'}
                  </span>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <strong className="text-indigo-700 block mb-2">التوقيت:</strong> 
                  <span className="text-gray-800">{selectedUnit.timestamp}</span>
                </div>
                {selectedUnit.agent_phone && (
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <strong className="text-teal-700 block mb-2">الهاتف:</strong> 
                    <a href={`tel:${selectedUnit.agent_phone}`} className="text-teal-600 hover:text-teal-800 font-medium hover:underline font-mono" dir="ltr">
                      {selectedUnit.agent_phone}
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <strong className="text-slate-700 block mb-3">الرسالة الكاملة:</strong>
                  <p className="text-gray-800 bg-white p-4 rounded-lg border leading-relaxed">{selectedUnit.message}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <strong className="text-orange-700 block mb-2">الكلمات المفتاحية:</strong>
                  <p className="text-gray-800">{selectedUnit.keywords || 'لا توجد'}</p>
                </div>
                {selectedUnit.agent_description && (
                  <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                    <strong className="text-rose-700 block mb-2">وصف السمسار:</strong>
                    <p className="text-gray-800">{selectedUnit.agent_description}</p>
                  </div>
                )}
                {selectedUnit.full_description && (
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <strong className="text-cyan-700 block mb-3">الوصف الكامل:</strong>
                    <p className="text-gray-800 bg-white p-4 rounded-lg border leading-relaxed">{selectedUnit.full_description}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8 flex justify-center pt-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
