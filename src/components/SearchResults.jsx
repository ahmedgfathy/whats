import React, { useState } from 'react';
import { MessageSquare, Clock, MapPin, Tag, DollarSign, User, ChevronLeft, ChevronRight, Eye, Star, Heart, Share2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyDetailsModal from './PropertyDetailsModal';

const SearchResults = ({ messages, loading, currentPage, totalPages, totalMessages, onPageChange }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePropertyClick = (propertyId) => {
    setSelectedPropertyId(propertyId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPropertyId(null);
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

  const getPropertyTypeColor = (type) => {
    const colors = {
      apartment: 'bg-blue-50 text-blue-700 border border-blue-200',
      villa: 'bg-green-50 text-green-700 border border-green-200',
      land: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      office: 'bg-purple-50 text-purple-700 border border-purple-200',
      warehouse: 'bg-gray-50 text-gray-700 border border-gray-200',
      other: 'bg-gray-50 text-gray-600 border border-gray-200'
    };
    return colors[type] || 'bg-gray-50 text-gray-600 border border-gray-200';
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-500/10 p-12 border border-white/20">
        <div className="flex items-center justify-center h-32">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <span className="mr-4 text-gray-600 text-lg font-medium">جاري البحث...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-500/10 p-12 border border-white/20">
        <div className="text-center py-12">
          <div className="relative inline-block">
            <MessageSquare className="mx-auto h-20 w-20 text-gray-300" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xs">0</span>
            </div>
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-700">
            لا توجد نتائج
          </h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto leading-relaxed">
            لم يتم العثور على عقارات مطابقة لبحثك. جرب استخدام مصطلحات مختلفة أو تغيير المرشحات.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-500/10 border border-white/20 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <h3 className="text-xl font-bold text-gray-800 text-right flex items-center justify-end">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-semibold ml-3">
            {totalMessages || messages.length}
          </span>
          نتائج البحث
        </h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className="p-6 hover:bg-white/50 transition-all duration-300 cursor-pointer group"
            onClick={() => handlePropertyClick(message.id)}
          >
            <div className="space-y-4">
              {/* Header with sender and timestamp */}
              <div className="flex justify-between items-start" dir="rtl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center ml-3">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-base font-semibold text-gray-800">
                    {message.sender}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePropertyClick(message.id);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 group-hover:bg-blue-100"
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    عرض التفاصيل
                  </button>
                  <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                    <Clock className="h-4 w-4 ml-1" />
                    {message.timestamp}
                  </div>
                </div>
              </div>

              {/* Message content */}
              <div className="text-gray-700 leading-relaxed text-right bg-gray-50 p-4 rounded-xl border border-gray-100">
                {message.message}
              </div>

              {/* Tags and metadata */}
              <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                {/* Property type */}
                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${
                  getPropertyTypeColor(message.property_type)
                }`}>
                  <Tag className="h-4 w-4 ml-2" />
                  {getPropertyTypeLabel(message.property_type)}
                </span>

                {/* Location */}
                {message.location && (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-green-50 text-green-700 border border-green-200 shadow-sm">
                    <MapPin className="h-4 w-4 ml-2" />
                    {message.location}
                  </span>
                )}

                {/* Price */}
                {message.price && (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm">
                    <DollarSign className="h-4 w-4 ml-2" />
                    {message.price}
                  </span>
                )}
              </div>

              {/* Keywords */}
              {message.keywords && (
                <div className="text-sm text-gray-500 text-right bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="font-semibold text-blue-700">الكلمات المفتاحية: </span>
                  <span className="text-blue-600">{message.keywords}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Property Details Modal */}
      <PropertyDetailsModal
        propertyId={selectedPropertyId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
          <div className="flex items-center justify-between" dir="rtl">
            <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              عرض {((currentPage - 1) * 10) + 1} إلى {Math.min(currentPage * 10, totalMessages)} من {totalMessages} عقار
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm ${
                      currentPage === pageNumber
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      <PropertyDetailsModal
        propertyId={selectedPropertyId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SearchResults;
