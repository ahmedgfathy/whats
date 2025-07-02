import React, { useState, useEffect } from 'react';
import { 
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  HomeModernIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  BuildingLibraryIcon,
  ChevronUpDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { searchMessages, getAllMessages, getPropertyTypeStats, getMessageById } from '../services/mockDatabase';
import PropertyDetailsModal from './PropertyDetailsModal';

const SimpleDashboard = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSearchMessages();
  }, [messages, searchTerm, selectedFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allMessages, propertyStats] = await Promise.all([
        getAllMessages(),
        getPropertyTypeStats()
      ]);
      setMessages(allMessages);
      setStats(propertyStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchMessages = () => {
    let filtered = messages;

    // Filter by property type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(msg => msg.property_type === selectedFilter);
    }

    // Search in message content
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort messages
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'timestamp') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredMessages(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleStatClick = (propertyType) => {
    setSelectedFilter(propertyType);
    setSearchTerm('');
  };

  const handleViewProperty = (propertyId) => {
    setSelectedPropertyId(propertyId);
    setShowModal(true);
  };

  const getPropertyTypeLabel = (type) => {
    const labels = {
      apartment: 'شقة',
      villa: 'فيلا',
      land: 'أرض',
      office: 'مكتب',
      warehouse: 'مخزن',
      other: 'أخرى'
    };
    return labels[type] || 'غير محدد';
  };

  const getPropertyTypeIcon = (type) => {
    const icons = {
      apartment: HomeModernIcon,
      villa: HomeModernIcon,
      land: MapPinIcon,
      office: BuildingStorefrontIcon,
      warehouse: BuildingLibraryIcon
    };
    return icons[type] || BuildingStorefrontIcon;
  };

  const getPropertyTypeColor = (type) => {
    const colors = {
      apartment: 'from-blue-500 to-cyan-500',
      villa: 'from-green-500 to-emerald-500',
      land: 'from-orange-500 to-red-500',
      office: 'from-indigo-500 to-purple-500',
      warehouse: 'from-pink-500 to-rose-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  // Pagination
  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <h1 className="text-3xl font-bold text-white">نظام البحث في العقارات</h1>
                <p className="text-sm text-gray-300">Real Estate Chat Search System</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 ml-2" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards - Clickable */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => handleStatClick('all')}
            className={`p-4 rounded-xl border transition-all duration-200 text-right ${
              selectedFilter === 'all' 
                ? 'bg-blue-600 border-blue-500 scale-105' 
                : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
            }`}
          >
            <div className="text-2xl font-bold">{messages.length}</div>
            <div className="text-sm text-gray-300">إجمالي العقارات</div>
          </button>

          {stats.map((stat) => {
            const IconComponent = getPropertyTypeIcon(stat.property_type);
            const colorClass = getPropertyTypeColor(stat.property_type);
            const isSelected = selectedFilter === stat.property_type;
            
            return (
              <button
                key={stat.property_type}
                onClick={() => handleStatClick(stat.property_type)}
                className={`p-4 rounded-xl border transition-all duration-200 text-right ${
                  isSelected 
                    ? `bg-gradient-to-r ${colorClass} border-opacity-50 scale-105` 
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="h-6 w-6" />
                  <div className="text-2xl font-bold">{stat.count}</div>
                </div>
                <div className="text-sm">{getPropertyTypeLabel(stat.property_type)}</div>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن شقة، فيلا، أرض، موقع..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                dir="rtl"
              />
            </div>
          </div>

          {/* Import Button */}
          <button className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <ArrowUpTrayIcon className="h-5 w-5 ml-2" />
            استيراد المحادثات
          </button>
        </div>

        {/* Results Header */}
        <div className="bg-gray-800 rounded-t-xl p-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {selectedFilter === 'all' 
                ? 'جميع العقارات' 
                : `عقارات: ${getPropertyTypeLabel(selectedFilter)}`}
            </h2>
            <div className="text-sm text-gray-400">
              {filteredMessages.length} من {messages.length} عقار
            </div>
          </div>
        </div>

        {/* Property Table */}
        <div className="bg-gray-800 rounded-b-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr className="text-right">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th 
                    className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort('sender')}
                  >
                    <div className="flex items-center justify-end">
                      المرسل
                      <ChevronUpDownIcon className="h-4 w-4 mr-2" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort('property_type')}
                  >
                    <div className="flex items-center justify-end">
                      النوع
                      <ChevronUpDownIcon className="h-4 w-4 mr-2" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center justify-end">
                      الموقع
                      <ChevronUpDownIcon className="h-4 w-4 mr-2" />
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium">الرسالة</th>
                  <th 
                    className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center justify-end">
                      التاريخ
                      <ChevronUpDownIcon className="h-4 w-4 mr-2" />
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paginatedMessages.map((message, index) => (
                  <tr key={message.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-4 py-3 text-gray-400">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">{message.sender}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPropertyTypeColor(message.property_type)} text-white`}>
                        {getPropertyTypeLabel(message.property_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-blue-400">{message.location || '-'}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="truncate" dir="rtl">
                        {message.message}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {message.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewProperty(message.id)}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 ml-1" />
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-700 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                صفحة {currentPage} من {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50 hover:bg-gray-500"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50 hover:bg-gray-500"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>

        {/* No Results */}
        {filteredMessages.length === 0 && (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">لا توجد نتائج</h3>
            <p className="text-gray-400">جرب البحث بكلمات مختلفة أو غير المرشح المحدد</p>
          </div>
        )}
      </main>

      {/* Property Details Modal */}
      <PropertyDetailsModal
        propertyId={selectedPropertyId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default SimpleDashboard;
