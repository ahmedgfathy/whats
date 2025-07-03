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
  TrashIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { getAllMessages, searchMessages, getPropertyTypeStats, removeDuplicateMessages } from '../services/apiService';
import ChatImportEnglish from './ChatImport-English';
import CSVImportEnglish from './CSVImport-English';

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

  const images = imageCategories[propertyType] || imageCategories.apartment;
  const imageIndex = Math.abs(messageId || 0) % images.length;
  return images[imageIndex];
};

const DashboardEnglish = ({ onLogout, onLanguageSwitch }) => {
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
  const [showCSVImport, setShowCSVImport] = useState(false);

  const propertyFilters = [
    { id: 'all', label: 'All Properties', icon: BuildingOffice2Icon, color: 'from-purple-500 to-pink-500' },
    { id: 'apartment', label: 'Apartments', icon: HomeModernIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'villa', label: 'Villas', icon: HomeModernIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'land', label: 'Land', icon: MapPinIcon, color: 'from-orange-500 to-red-500' },
    { id: 'office', label: 'Offices', icon: BuildingStorefrontIcon, color: 'from-indigo-500 to-purple-500' },
    { id: 'warehouse', label: 'Warehouses', icon: BuildingLibraryIcon, color: 'from-pink-500 to-rose-500' }
  ];

  const tabs = [
    { 
      id: 'units', 
      label: 'Complete Properties Table', 
      icon: BuildingOffice2Icon, 
      gradient: 'from-purple-500 to-blue-500',
      description: 'All properties in detail'
    },
    { 
      id: 'recent', 
      label: 'Recent Results', 
      icon: ChartBarIcon, 
      gradient: 'from-blue-500 to-indigo-500',
      description: 'Latest added properties'
    },
    { 
      id: 'import', 
      label: 'Import Chats', 
      icon: ArrowUpTrayIcon, 
      gradient: 'from-green-500 to-emerald-500',
      description: 'Upload WhatsApp files'
    },
    { 
      id: 'csv-import', 
      label: 'Import CSV', 
      icon: DocumentArrowUpIcon, 
      gradient: 'from-purple-500 to-indigo-500',
      description: 'Upload CSV & Excel files'
    },
    { 
      id: 'admin', 
      label: 'System Administration', 
      icon: ShieldCheckIcon, 
      gradient: 'from-red-500 to-pink-500',
      description: 'Management & maintenance tools'
    }
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      console.log('English Dashboard: Loading initial data...');
      
      // Get all messages - remove the limit to get actual count
      const allMessages = await getAllMessages('all', 10000);
      console.log(`English Dashboard: Loaded ${allMessages.length} messages`);
      setMessages(allMessages);

      // Get property type statistics
      const propertyStats = await getPropertyTypeStats();
      console.log('English Dashboard: Property stats:', propertyStats);
      setStats(propertyStats);
      
      const totalCount = propertyStats.reduce((sum, stat) => sum + stat.count, 0);
      console.log(`English Dashboard: Total count from stats: ${totalCount}`);
      console.log(`English Dashboard: Messages length: ${allMessages.length}`);
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
      const searchResults = await searchMessages(searchTerm, selectedFilter === 'all' ? null : selectedFilter);
      setMessages(searchResults);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching:', error);
    }
    setLoading(false);
  };

  const handleStatClick = async (filterType) => {
    setSelectedFilter(filterType);
    setCurrentPage(1);
    setLoading(true);
    
    try {
      const filteredMessages = await getAllMessages(filterType === 'all' ? null : filterType, 10000);
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error filtering messages:', error);
    }
    setLoading(false);
  };

  const handleRemoveDuplicates = async () => {
    setAdminLoading(true);
    setAdminResult(null);
    
    try {
      console.log('English Dashboard: Starting duplicate removal...');
      const result = await removeDuplicateMessages();
      console.log('English Dashboard: Duplicate removal result:', result);
      
      setAdminResult({
        success: true,
        message: `Successfully removed ${result.removed} duplicate messages`,
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
        message: 'An error occurred while removing duplicate messages'
      });
    } finally {
      setAdminLoading(false);
    }
  };

  // CSV Import handler
  const handleCSVImportComplete = async (result) => {
    console.log('CSV import completed:', result);
    setShowCSVImport(false);
    
    // Refresh data after import
    await loadInitialData();
    
    // Show success message
    setAdminResult({
      success: true,
      message: `Successfully imported ${result.imported || result.total || 0} records from CSV file`,
      imported: result.imported || result.total || 0
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4" /> : 
      <ChevronDownIcon className="h-4 w-4" />;
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
      apartment: 'Apartment',
      villa: 'Villa',
      land: 'Land',
      office: 'Office',
      warehouse: 'Warehouse'
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

  // Function to clean agent names from phone numbers
  const cleanAgentName = (agentName) => {
    if (!agentName) return agentName;
    
    // Remove Egyptian phone numbers in various formats
    // Patterns: +20 XX XXXXXXXX, 01XXXXXXXXX, +201XXXXXXXXX, etc.
    const phonePatterns = [
      /\+?20\s*\d{2}\s*\d{8}/g,  // +20 XX XXXXXXXX
      /\+?20\s*\d{10}/g,         // +20XXXXXXXXXX
      /01\d{9}/g,                // 01XXXXXXXXX
      /\+201\d{8}/g,             // +201XXXXXXXX
      /\d{11}/g,                 // Any 11-digit number
      /\+\d{12,}/g,              // Any international format
      /\d{3}\s*\d{3}\s*\d{4}/g,  // XXX XXX XXXX format
      /\d{4}\s*\d{3}\s*\d{4}/g   // XXXX XXX XXXX format
    ];
    
    let cleanedName = agentName;
    
    // Remove all phone number patterns
    phonePatterns.forEach(pattern => {
      cleanedName = cleanedName.replace(pattern, '');
    });
    
    // Clean up extra spaces and special characters
    cleanedName = cleanedName
      .replace(/[-\(\)\s]+/g, ' ')  // Replace dashes, parentheses, and multiple spaces
      .trim()                       // Remove leading/trailing spaces
      .replace(/\s+/g, ' ');        // Replace multiple spaces with single space
    
    return cleanedName || agentName; // Return original if cleaning results in empty string
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-roboto lang-english" dir="ltr" lang="en">
      {/* Header with Language Switcher */}
      <motion.header 
        className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <motion.div 
              className="flex items-center space-x-6" 
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
                  Contaboo
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <SparklesIcon className="h-4 w-4 text-purple-400" />
                  <CpuChipIcon className="h-4 w-4 text-purple-400 animate-pulse" />
                  <p className="text-sm text-gray-300">Smart Real Estate Platform</p>
                </div>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-4">
              {/* View Public Homepage Button */}
              <motion.button
                onClick={() => window.open('/', '_blank')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden flex items-center px-6 py-3 text-sm font-semibold text-gray-300 hover:text-white glass-light rounded-2xl border border-white/20 transition-all duration-300 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <EyeIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">Public Homepage</span>
              </motion.button>

              {/* Language Switcher */}
              <motion.button
                onClick={onLanguageSwitch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden flex items-center px-6 py-3 text-sm font-semibold text-gray-300 hover:text-white glass-light rounded-2xl border border-white/20 transition-all duration-300 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <LanguageIcon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative">العربية</span>
              </motion.button>

              <motion.button
                onClick={onLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden flex items-center px-8 py-4 text-sm font-semibold text-gray-300 hover:text-white glass-light rounded-2xl border border-white/20 transition-all duration-300 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative">Logout</span>
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
          <nav className="relative">
            <div className="flex justify-center space-x-4 glass p-4 rounded-3xl border border-white/20 shadow-2xl max-w-5xl mx-auto">
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
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
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
                Welcome
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Welcome!</h2>
            <p className="text-blue-100 text-sm leading-relaxed">To Contaboo - Smart Real Estate Platform for WhatsApp Chat Analysis</p>
          </motion.div>

          {/* Search Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-600/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Smart Search</h3>
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
                placeholder="Search apartments, villas, land..."
                className="flex-1 px-3 py-2 bg-slate-600/50 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 placeholder-slate-300 text-sm"
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
                Search
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
            <h3 className="text-lg font-bold mb-2">All Properties</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-3">Click to view all properties</p>
            <div className="flex items-center text-xs opacity-70">
              <SparklesIcon className="h-3 w-3 mr-1" />
              <span>Interactive</span>
            </div>
          </motion.button>
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
                  {selectedFilter === 'all' ? 'All Properties' : `${getPropertyTypeLabel(selectedFilter)} Properties`}
                </h3>
                <p className="text-gray-400 flex items-center gap-2">
                  <BuildingOffice2Icon className="h-5 w-5" />
                  {sortedMessages.length} property • page {currentPage} of {totalPages}
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
                    <BuildingOffice2Icon className="h-4 w-4 mr-2 inline" />
                    Show All
                  </motion.button>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-lg border border-gray-600">
                  <SparklesIcon className="h-4 w-4" />
                  <span>Sorted by: {sortField === 'timestamp' ? 'Date' : sortField === 'sender' ? 'Sender' : sortField === 'property_type' ? 'Type' : sortField}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Table */}
            {loading ? (
              <div className="text-center py-16">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"
                ></motion.div>
                <p className="text-gray-400 text-lg">Loading data...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-gray-600 shadow-lg">
                  <table className="w-full text-left bg-gray-900">
                    <thead className="bg-gradient-to-r from-gray-700 to-gray-800 border-b border-gray-600">
                      <tr>
                        <th className="py-4 px-6 text-left w-36">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('sender')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-gray-200"
                          >
                            Sender
                            {renderSortIcon('sender')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-left w-32">Agent Phone</th>
                        <th className="py-4 px-6 text-left w-28">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('property_type')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-gray-200"
                          >
                            Property Type
                            {renderSortIcon('property_type')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-left font-bold text-gray-200 min-w-[280px]">Content</th>
                        <th className="py-4 px-6 text-left w-32">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('location')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-gray-200"
                          >
                            Location
                            {renderSortIcon('location')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-left w-36">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('price')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-gray-200"
                          >
                            Price
                            {renderSortIcon('price')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-left w-32">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSort('timestamp')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-gray-200"
                          >
                            Date
                            {renderSortIcon('timestamp')}
                          </motion.button>
                        </th>
                        <th className="py-4 px-6 text-left font-bold text-gray-200 w-32">Details</th>
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
                          <td className="py-4 px-6 font-semibold text-white w-36">{cleanAgentName(message.sender)}</td>
                          <td className="py-4 px-6 w-32">
                            <span className="text-green-400 font-mono text-sm bg-green-400/10 px-2 py-1 rounded border border-green-400/30">
                              {message.agent_phone || 'N/A'}
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
                              {message.location || 'Not specified'}
                            </div>
                          </td>
                          <td className="py-4 px-6 w-36">
                            {message.price ? (
                              <span className="text-emerald-400 font-semibold bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/30 text-sm">
                                {message.price}
                              </span>
                            ) : (
                              <span className="text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full text-sm">Not specified</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-gray-400 text-sm w-32">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {message.timestamp}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-left w-32">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => showUnitDetails(message)}
                              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm shadow-md hover:shadow-lg font-medium"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View Details
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
                      Showing <span className="text-purple-400 font-semibold">{indexOfFirstMessage + 1}</span> to <span className="text-purple-400 font-semibold">{Math.min(indexOfLastMessage, sortedMessages.length)}</span> of <span className="text-purple-400 font-semibold">{sortedMessages.length}</span> properties
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                      >
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        Previous
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
                        Next
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'import' && (
          <ChatImportEnglish onImportSuccess={loadInitialData} />
        )}

        {activeTab === 'csv-import' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-purple-900/30 via-gray-900 to-indigo-900/30 rounded-2xl p-8 shadow-2xl border border-purple-500/20"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-purple-500/20">
              <div>
                <h3 className="text-3xl font-bold text-purple-400 flex items-center gap-3">
                  <DocumentArrowUpIcon className="h-8 w-8" />
                  Import CSV Files
                </h3>
                <p className="text-gray-400 mt-2">Upload and convert CSV & Excel files to database</p>
              </div>
              <div className="bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/30">
                <span className="text-purple-400 text-sm font-medium">Data Files</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* CSV Import Instructions */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <DocumentArrowUpIcon className="h-6 w-6 text-blue-400" />
                  <h4 className="text-xl font-bold text-blue-400">Import Instructions</h4>
                </div>
                
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <span className="font-semibold text-green-400">Supported Files:</span>
                      <p className="text-sm mt-1">CSV, Excel (.xlsx)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <div>
                      <span className="font-semibold text-yellow-400">Data Structure:</span>
                      <p className="text-sm mt-1">First row will be used as column headers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div>
                      <span className="font-semibold text-purple-400">Preview:</span>
                      <p className="text-sm mt-1">Preview first 5 rows before import</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                    <div>
                      <span className="font-semibold text-red-400">Warning:</span>
                      <p className="text-sm mt-1">Verify data accuracy before importing</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Import Action */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/20"
              >
                <div className="flex items-center gap-3 mb-6">
                  <ArrowUpTrayIcon className="h-6 w-6 text-green-400" />
                  <h4 className="text-xl font-bold text-green-400">Upload File</h4>
                </div>

                <div className="text-center">
                  <motion.button
                    onClick={() => setShowCSVImport(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <DocumentArrowUpIcon className="h-6 w-6" />
                    <span>Choose CSV File to Import</span>
                  </motion.button>
                  
                  <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                    Click to select CSV or Excel file from your device
                    <br />
                    Data will be previewed before final import
                  </p>
                </div>

                {/* Sample CSV Format */}
                <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
                  <h5 className="text-sm font-bold text-gray-300 mb-2">Sample CSV Format:</h5>
                  <code className="text-xs text-gray-400 font-mono">
                    Property Name,Property Type,Price,Location,Description
                    <br />
                    120m Apartment,apartment,750000,Cairo,Premium apartment...
                  </code>
                </div>
              </motion.div>
            </div>

            {/* CSV Import Statistics */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-500/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <ChartBarIcon className="h-6 w-6 text-indigo-400" />
                <h4 className="text-xl font-bold text-indigo-400">Import Statistics</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{messages.length.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Current Total Properties</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{stats.length}</div>
                  <div className="text-sm text-gray-400">Property Types</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">21,049</div>
                  <div className="text-sm text-gray-400">Records in Attached CSV</div>
                </div>
              </div>
            </motion.div>
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
                <ChartBarIcon className="h-8 w-8 text-blue-400" />
                Latest Added Properties
              </h3>
              <span className="text-gray-400">Latest 9 properties</span>
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
                  
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    {message.sender}
                  </h4>
                  
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {message.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <MapPinIcon className="h-4 w-4" />
                      {message.location || 'Not specified'}
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
                    View Full Details
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
                  System Administration
                </h3>
                <p className="text-gray-400 mt-2">Database maintenance and management tools</p>
              </div>
              <div className="bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/30">
                <span className="text-red-400 text-sm font-medium">Admin Area</span>
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
                  <h4 className="text-xl font-bold text-orange-400">Remove Duplicate Messages</h4>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-black text-xs font-bold">!</span>
                    </div>
                    <div>
                      <h5 className="text-yellow-400 font-semibold mb-1">Warning</h5>
                      <p className="text-yellow-300 text-sm">
                        This action is irreversible. Make sure to backup your data before proceeding.
                      </p>
                    </div>
                  </div>
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
                      Removing duplicates...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-5 w-5" />
                      Remove Duplicate Messages
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
                  <h4 className="text-xl font-bold text-blue-400">System Statistics</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">Total Messages</span>
                    <span className="text-blue-400 font-bold">{messages.length.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">Total Properties</span>
                    <span className="text-green-400 font-bold">
                      {stats.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">Property Types</span>
                    <span className="text-purple-400 font-bold">{stats.length}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Result Message */}
            {adminResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`mt-8 p-6 rounded-xl border ${
                  adminResult.success 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {adminResult.success ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h4 className={`font-bold mb-2 ${adminResult.success ? 'text-green-400' : 'text-red-400'}`}>
                      {adminResult.success ? 'Operation Successful' : 'Operation Failed'}
                    </h4>
                    <p className="text-gray-300 mb-3">{adminResult.message}</p>
                    {adminResult.success && adminResult.removed !== undefined && (
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>• Removed {adminResult.removed} duplicate messages</p>
                        <p>• Count before cleanup: {adminResult.totalBefore.toLocaleString()}</p>
                        <p>• Count after cleanup: {adminResult.totalAfter.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Success Message */}
        <div className="mt-8 bg-green-800/20 border border-green-600 rounded-xl p-6">
          <h4 className="text-green-400 font-semibold mb-2">🎉 Database connected successfully!</h4>
          <div className="text-green-300 space-y-1">
            <p>✅ Loaded {messages.length} properties from database</p>
            <p>✅ System running at full capacity with search, classification and sorting</p>
            <p>✅ You can now click on statistics to filter and sort the table</p>
            <p>✅ Interactive table with pagination and advanced sorting capabilities</p>
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
                Property Details
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <strong className="text-blue-700 block mb-2">Sender:</strong> 
                  <span className="text-gray-800 font-medium">{selectedUnit.sender}</span>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <strong className="text-purple-700 block mb-2">Property Type:</strong> 
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
                  <strong className="text-green-700 block mb-2">Location:</strong> 
                  <span className="text-gray-800">{selectedUnit.location || 'Not specified'}</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <strong className="text-emerald-700 block mb-2">Price:</strong> 
                  <span className="text-emerald-600 font-bold text-lg">
                    {selectedUnit.price || 'Not specified'}
                  </span>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <strong className="text-indigo-700 block mb-2">Date:</strong> 
                  <span className="text-gray-800">{selectedUnit.timestamp}</span>
                </div>
                {selectedUnit.agent_phone && (
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <strong className="text-teal-700 block mb-2">Phone:</strong> 
                    <a href={`tel:${selectedUnit.agent_phone}`} className="text-teal-600 hover:text-teal-800 font-medium hover:underline">
                      {selectedUnit.agent_phone}
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <strong className="text-slate-700 block mb-3">Full Message:</strong>
                  <p className="text-gray-800 bg-white p-4 rounded-lg border leading-relaxed">{selectedUnit.message}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <strong className="text-orange-700 block mb-2">Keywords:</strong>
                  <p className="text-gray-800">{selectedUnit.keywords || 'None'}</p>
                </div>
                {selectedUnit.agent_description && (
                  <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                    <strong className="text-rose-700 block mb-2">Agent Description:</strong>
                    <p className="text-gray-800">{selectedUnit.agent_description}</p>
                  </div>
                )}
                {selectedUnit.full_description && (
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <strong className="text-cyan-700 block mb-3">Full Description:</strong>
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
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportEnglish 
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImportComplete={handleCSVImportComplete}
      />
    </div>
  );
};

export default DashboardEnglish;
