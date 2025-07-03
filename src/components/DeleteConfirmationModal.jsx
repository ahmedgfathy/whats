import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  TrashIcon,
  ExclamationTriangleIcon
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
            className="relative bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-red-500/30"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">تأكيد الحذف</h2>
                    <p className="text-red-100 text-sm">هذا الإجراء لا يمكن التراجع عنه</p>
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

            {/* Content */}
            <div className="p-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-center mb-4"
                >
                  {error}
                </motion.div>
              )}

              {/* Warning */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-red-200 font-medium mb-2">
                      هل أنت متأكد من حذف هذا العقار؟
                    </p>
                    <p className="text-gray-400 text-sm">
                      سيتم حذف جميع البيانات المرتبطة بهذا العقار نهائياً
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Info */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-white font-medium mb-2">تفاصيل العقار المحذوف:</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-500">المرسل:</span> {property.sender || 'غير محدد'}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">النوع:</span> {property.property_type || 'غير محدد'}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">الموقع:</span> {property.location || 'غير محدد'}
                  </p>
                  {property.price && (
                    <p className="text-gray-300">
                      <span className="text-gray-500">السعر:</span> {property.price}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleDelete}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جارٍ الحذف...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-5 h-5" />
                      تأكيد الحذف
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  إلغاء
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
