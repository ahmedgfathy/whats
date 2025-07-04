import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  BuildingOffice2Icon,
  HomeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { deleteMessage } from '../services/apiService';

const DeleteConfirmationModal = ({ property, isOpen, onClose, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await deleteMessage(property.id);
      onDelete();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-gray-900 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl border border-red-500/30 flex flex-col"
            dir="rtl"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    className="p-2 bg-white/20 rounded-full"
                  >
                    <ExclamationTriangleIcon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl font-bold"
                    >
                      تأكيد حذف العقار
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-red-100 text-sm"
                    >
                      هذا الإجراء لا يمكن التراجع عنه
                    </motion.p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="relative p-6 space-y-6 overflow-y-auto flex-1 max-h-[calc(85vh-8rem)]">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-center"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    {error}
                  </div>
                </motion.div>
              )}

              {/* Enhanced Warning Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="p-3 bg-red-500/20 rounded-full"
                  >
                    <ShieldExclamationIcon className="w-6 h-6 text-red-400" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-red-200 font-bold text-lg mb-2">
                      تحذير هام
                    </h3>
                    <p className="text-red-300 mb-3">
                      هل أنت متأكد من حذف هذا العقار نهائياً؟
                    </p>
                    <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        ⚠️ سيتم حذف جميع البيانات المرتبطة بهذا العقار نهائياً
                        <br />
                        📝 لن تتمكن من استرداد هذه المعلومات مرة أخرى
                        <br />
                        🔒 هذا الإجراء غير قابل للتراجع
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Property Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <PropertyTypeIcon className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-bold text-lg">العقار المحذوف</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400 text-sm">المرسل</span>
                    <span className="text-white font-medium">{property.sender || 'غير محدد'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400 text-sm">نوع العقار</span>
                    <span className="text-blue-300 font-medium">{getPropertyTypeLabel(property.property_type)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400 text-sm">الموقع</span>
                    <span className="text-white font-medium">{property.location || 'غير محدد'}</span>
                  </div>
                  
                  {property.price && (
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-400 text-sm">السعر</span>
                      <span className="text-emerald-300 font-bold">{property.price}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400 text-sm">معرف العقار</span>
                    <span className="text-purple-300 font-mono">#{property.id}</span>
                  </div>
                </div>

                {/* Property Message Preview */}
                {property.message && (
                  <div className="mt-4 p-3 bg-gray-700 rounded-lg border-l-4 border-red-500">
                    <h4 className="text-gray-400 text-xs mb-2">رسالة العقار:</h4>
                    <p className="text-gray-200 text-sm line-clamp-2">{property.message}</p>
                  </div>
                )}
              </motion.div>

              {/* Enhanced Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-4 pt-2"
              >
                <motion.button
                  onClick={handleDelete}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جارٍ الحذف...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-5 h-5" />
                      تأكيد الحذف نهائياً
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-4 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  إلغاء
                </motion.button>
              </motion.div>

              {/* Security Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <InformationCircleIcon className="w-4 h-4 text-yellow-400" />
                  <p className="text-yellow-200 text-xs">
                    تذكير: تأكد من صحة قرارك قبل المتابعة. هذا الحذف سيكون نهائياً ولا يمكن التراجع عنه.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
