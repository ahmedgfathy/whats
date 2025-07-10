import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BuildingOffice2Icon, 
  MapPinIcon, 
  PhoneIcon, 
  CurrencyDollarIcon,
  HomeIcon,
  UserIcon,
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  TagIcon,
  ChatBubbleLeftEllipsisIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { getPropertyById } from '../services/apiService';

// Virtual property image generator
const PropertyDetailsModal = ({ property, isOpen, onClose }) => {
  if (!property) return null;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
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
    return labels[type] || type || 'غير محدد';
  };

  const getPropertyTypeColor = (type) => {
    const colors = {
      apartment: 'from-blue-500 to-blue-600',
      villa: 'from-green-500 to-green-600',
      land: 'from-yellow-500 to-yellow-600',
      office: 'from-purple-500 to-purple-600',
      warehouse: 'from-red-500 to-red-600',
      other: 'from-gray-500 to-gray-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getPropertyTypeIcon = (type) => {
    const icons = {
      apartment: BuildingOffice2Icon,
      villa: HomeIcon,
      land: MapPinIcon,
      office: BuildingOffice2Icon,
      warehouse: BuildingOffice2Icon,
      other: BuildingOffice2Icon
    };
    return icons[type] || BuildingOffice2Icon;
  };

  const PropertyTypeIcon = getPropertyTypeIcon(property.property_type);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="relative bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
            dir="rtl"
          >
            {/* Header */}
            <div className={`sticky top-0 bg-gradient-to-r ${getPropertyTypeColor(property.property_type)} text-white p-6 rounded-t-2xl`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <EyeIcon className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">تفاصيل العقار</h2>
                    <p className="text-blue-100 text-sm">عرض جميع المعلومات</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Property Type Badge */}
            <div className="px-6 pt-6">
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${getPropertyTypeColor(property.property_type)} text-white rounded-full shadow-lg`}
                >
                  <PropertyTypeIcon className="w-6 h-6" />
                  <span className="text-lg font-bold">{getPropertyTypeLabel(property.property_type)}</span>
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-400" />
                  المعلومات الأساسية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">المرسل</p>
                        <p className="text-white font-medium">{property.sender || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">رقم الهاتف</p>
                        <p className="text-white font-medium font-mono" dir="ltr">{property.agent_phone || 'غير متاح'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-sm text-gray-400">الموقع</p>
                        <p className="text-white font-medium">{property.location || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CurrencyDollarIcon className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-sm text-gray-400">السعر</p>
                        <p className="text-white font-medium">{property.price || 'غير محدد'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Property Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-green-400" />
                  رسالة العقار
                </h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-200 leading-relaxed">
                    {property.message || 'لا توجد رسالة متاحة'}
                  </p>
                </div>
              </motion.div>

              {/* Keywords */}
              {property.keywords && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TagIcon className="w-5 h-5 text-purple-400" />
                    الكلمات المفتاحية
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {property.keywords.split(',').map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Agent Description */}
              {property.agent_description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-400" />
                    وصف الوكيل
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-200 leading-relaxed">
                      {property.agent_description}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Full Description */}
              {property.full_description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-emerald-400" />
                    الوصف الكامل
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-200 leading-relaxed">
                      {property.full_description}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Timestamp */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-yellow-400" />
                  معلومات التوقيت
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-400">وقت الرسالة</p>
                      <p className="text-white font-medium">{property.timestamp || 'غير محدد'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm text-gray-400">تاريخ الإنشاء</p>
                      <p className="text-white font-medium">
                        {property.created_at ? new Date(property.created_at).toLocaleString('ar-EG') : 'غير محدد'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* System Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                  معلومات النظام
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">ID</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">معرف العقار</p>
                      <p className="text-white font-medium font-mono">#{property.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PropertyTypeIcon className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">نوع العقار</p>
                      <p className="text-white font-medium">{property.property_type || 'غير محدد'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  إغلاق
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PropertyDetailsModal;
