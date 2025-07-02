import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
  CurrencyDollarIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  BuildingStorefrontIcon,
  BuildingLibraryIcon,
  FireIcon
} from '@heroicons/react/24/outline';
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

  const getPropertyTypeIcon = (type) => {
    const icons = {
      apartment: HomeModernIcon,
      villa: HomeModernIcon,
      land: MapPinIcon,
      office: BuildingStorefrontIcon,
      warehouse: BuildingLibraryIcon,
      other: BuildingOffice2Icon
    };
    return icons[type] || BuildingOffice2Icon;
  };

  const getPropertyTypeColor = (type) => {
    const colors = {
      apartment: 'from-blue-500 to-cyan-500',
      villa: 'from-green-500 to-emerald-500',
      land: 'from-orange-500 to-red-500',
      office: 'from-indigo-500 to-purple-500',
      warehouse: 'from-pink-500 to-rose-500',
      other: 'from-gray-500 to-slate-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-light rounded-3xl shadow-2xl p-12 border border-border/50"
      >
        <div className="flex flex-col items-center justify-center h-40 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-primary"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <SparklesIcon className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <motion.p 
            className="text-muted-foreground text-lg font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            جارٍ البحث في قاعدة البيانات الذكية...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (messages.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-light rounded-3xl shadow-2xl p-12 border border-border/50 text-center"
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
            <div className="relative p-8 glass rounded-3xl border border-border/50">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-muted-foreground mx-auto" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">لم يتم العثور على نتائج</h3>
            <p className="text-muted-foreground text-lg">جرب البحث بكلمات مختلفة أو تغيير المرشحات</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-light rounded-2xl p-6 border border-border/50"
      >
        <div className="flex items-center justify-between" dir="rtl">
          <div className="flex items-center space-x-4">
            <FireIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              تم العثور على {totalMessages} عقار
            </h2>
          </div>
          <div className="text-sm text-muted-foreground">
            صفحة {currentPage} من {totalPages}
          </div>
        </div>
      </motion.div>

      {/* Results Grid */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <AnimatePresence>
          {messages.map((message, index) => {
            const PropertyIcon = getPropertyTypeIcon(message.property_type);
            const propertyColor = getPropertyTypeColor(message.property_type);
            
            return (
              <motion.div
                key={`${message.id}-${currentPage}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => handlePropertyClick(message.id)}
                className="group relative glass-light rounded-3xl p-8 border border-border/50 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative" dir="rtl">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 bg-gradient-to-r ${propertyColor} rounded-2xl shadow-lg`}>
                        <PropertyIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <motion.span 
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${propertyColor} shadow-lg`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <StarIcon className="h-4 w-4 ml-2" />
                          {getPropertyTypeLabel(message.property_type)}
                        </motion.span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 glass rounded-xl border border-border/50 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <HeartIcon className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 glass rounded-xl border border-border/50 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ShareIcon className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <p className="text-foreground text-lg leading-relaxed font-medium line-clamp-3">
                      {message.content}
                    </p>
                    
                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-primary" />
                        <span>{message.sender}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-primary" />
                        <span>{new Date(message.timestamp).toLocaleDateString('ar-SA')}</span>
                      </div>
                      {message.location && (
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="h-4 w-4 text-primary" />
                          <span>{message.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Keywords */}
                    {message.keywords && message.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.keywords.slice(0, 3).map((keyword, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
                          >
                            #{keyword}
                          </motion.span>
                        ))}
                        {message.keywords.length > 3 && (
                          <span className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs font-medium rounded-full">
                            +{message.keywords.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <motion.div 
                    className="mt-6 pt-4 border-t border-border/50"
                    whileHover={{ x: -5 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">انقر لمزيد من التفاصيل</span>
                      <div className="flex items-center space-x-2 text-primary">
                        <EyeIcon className="h-4 w-4" />
                        <ChevronLeftIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 shimmer rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-light rounded-2xl p-6 border border-border/50"
        >
          <div className="flex items-center justify-center space-x-4" dir="ltr">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-6 py-3 glass rounded-xl border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ChevronRightIcon className="h-4 w-4 mr-2" />
              السابق
            </motion.button>

            <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-12 h-12 rounded-xl font-bold transition-all duration-300 ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'glass border border-border/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-6 py-3 glass rounded-xl border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              التالي
              <ChevronLeftIcon className="h-4 w-4 ml-2" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Property Details Modal */}
      {isModalOpen && selectedPropertyId && (
        <PropertyDetailsModal
          propertyId={selectedPropertyId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SearchResults;
