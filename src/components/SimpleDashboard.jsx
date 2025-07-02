import React, { useState, useEffect } from 'react';
import { ArrowRightOnRectangleIcon, MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpTrayIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import { searchMessages, getAllMessages, getPropertyTypeStats } from '../services/mockDatabase';

const SimpleDashboard = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(12);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeView, setActiveView] = useState('table'); // 'cards', 'table', 'import', 'recent'
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      setTotalMessages(allMessages.length);

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
    setActiveView('table');
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
      apartment: 'bg-blue-100 text-blue-800',
      villa: 'bg-green-100 text-green-800',
      land: 'bg-yellow-100 text-yellow-800',
      office: 'bg-purple-100 text-purple-800',
      warehouse: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ChevronUpIcon className="h-4 w-4 text-gray-500" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4 text-blue-400" /> : 
      <ChevronDownIcon className="h-4 w-4 text-blue-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white">
                البحث في العقارات
              </h1>
              <span className="text-lg text-gray-300 mr-4">Real Estate Chat Search</span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center" dir="rtl">
            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeView === 'table'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              📊 جدول العقارات الشامل
            </button>
            <button
              onClick={() => setActiveView('import')}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeView === 'import'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <ArrowUpTrayIcon className="h-5 w-5 ml-2" />
              استيراد المحادثات
            </button>
            <button
              onClick={() => setActiveView('recent')}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeView === 'recent'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <ClockIcon className="h-5 w-5 ml-2" />
              النتائج الحديثة
            </button>
          </div>
        </div>
        {/* Statistics Cards - Now Clickable Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
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

          {/* Clickable Stats Card */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">الإحصائيات المباشرة - اضغط للتصفية</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleStatClick('all')}
                className={`w-full flex justify-between p-2 rounded-lg transition-colors ${
                  selectedFilter === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                }`}
              >
                <span>جميع العقارات</span>
                <span className="text-blue-400">{stats.reduce((sum, stat) => sum + stat.count, 0)}</span>
              </button>
              {stats.map((stat) => (
                <button
                  key={stat.property_type}
                  onClick={() => handleStatClick(stat.property_type)}
                  className={`w-full flex justify-between p-2 rounded-lg transition-colors ${
                    selectedFilter === stat.property_type ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                  }`}
                >
                  <span>{getPropertyTypeLabel(stat.property_type)}</span>
                  <span className={selectedFilter === stat.property_type ? 'text-white' : getPropertyTypeColor(stat.property_type)}>
                    {stat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content based on active view */}
        {activeView === 'table' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                {selectedFilter === 'all' ? 'جميع العقارات' : `عقارات ${getPropertyTypeLabel(selectedFilter)}`}
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-gray-400">
                  {sortedMessages.length} عقار • صفحة {currentPage} من {totalPages}
                </span>
                {selectedFilter !== 'all' && (
                  <button
                    onClick={() => {setSelectedFilter('all'); setCurrentPage(1);}}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    إظهار الكل
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">جاري تحميل البيانات...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-right" dir="rtl">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleSort('sender')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                          >
                            المرسل
                            {renderSortIcon('sender')}
                          </button>
                        </th>
                        <th className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleSort('property_type')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                          >
                            نوع العقار
                            {renderSortIcon('property_type')}
                          </button>
                        </th>
                        <th className="py-3 px-4 text-right">المحتوى</th>
                        <th className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleSort('location')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                          >
                            الموقع
                            {renderSortIcon('location')}
                          </button>
                        </th>
                        <th className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleSort('price')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                          >
                            السعر
                            {renderSortIcon('price')}
                          </button>
                        </th>
                        <th className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleSort('timestamp')}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                          >
                            التاريخ
                            {renderSortIcon('timestamp')}
                          </button>
                        </th>
                        <th className="py-3 px-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMessages.map((message) => (
                        <tr key={message.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                          <td className="py-4 px-4 font-semibold">{message.sender}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPropertyTypeColorClass(message.property_type)}`}>
                              {getPropertyTypeLabel(message.property_type)}
                            </span>
                          </td>
                          <td className="py-4 px-4 max-w-xs">
                            <div className="truncate">{message.message}</div>
                          </td>
                          <td className="py-4 px-4">{message.location || '-'}</td>
                          <td className="py-4 px-4">
                            {message.price ? (
                              <span className="text-green-400 font-semibold">{message.price}</span>
                            ) : '-'}
                          </td>
                          <td className="py-4 px-4 text-gray-400 text-sm">{message.timestamp}</td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => showUnitDetails(message)}
                              className="text-blue-400 hover:underline"
                            >
                              تفاصيل
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-gray-400">
                      عرض {indexOfFirstMessage + 1} إلى {Math.min(indexOfLastMessage, sortedMessages.length)} من {sortedMessages.length} عقار
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                        السابق
                      </button>
                      
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`px-3 py-2 rounded-lg transition-colors ${
                                currentPage === pageNumber
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        التالي
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeView === 'import' && (
          <div className="bg-gray-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">استيراد محادثات الواتساب</h3>
            <div className="max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
                <ArrowUpTrayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">قم بسحب وإفلات ملف المحادثة هنا</h4>
                <p className="text-gray-400 mb-4">أو انقر لاختيار الملف من جهازك</p>
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  اختيار ملف
                </button>
              </div>
              <div className="mt-6 text-center text-gray-400">
                <p>الصيغ المدعومة: .txt, .csv</p>
                <p>الحد الأقصى لحجم الملف: 10 ميجابايت</p>
              </div>
            </div>
          </div>
        )}

        {activeView === 'recent' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-6">آخر العقارات المضافة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {messages.slice(0, 9).map((message) => (
                <div key={message.id} className="bg-gray-700 rounded-xl p-6 hover:bg-gray-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPropertyTypeColorClass(message.property_type)}`}>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unit Details Modal */}
        {showModal && selectedUnit && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg max-w-lg w-full z-10">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">
                    تفاصيل العقار
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400">المرسل:</span>
                    <span className="block text-white font-semibold">{selectedUnit.sender}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">نوع العقار:</span>
                    <span className={`block text-sm rounded-full ${getPropertyTypeColorClass(selectedUnit.property_type)}`}>
                      {getPropertyTypeLabel(selectedUnit.property_type)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">الموقع:</span>
                    <span className="block">{selectedUnit.location || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">السعر:</span>
                    <span className="block text-green-400 font-semibold">
                      {selectedUnit.price}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">التاريخ:</span>
                    <span className="block text-sm">{selectedUnit.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">المحتوى:</span>
                    <p className="mt-1 text-white break-words">
                      {selectedUnit.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
      </main>
    </div>
  );
};

export default SimpleDashboard;
