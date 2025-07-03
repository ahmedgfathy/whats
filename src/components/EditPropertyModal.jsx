import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BuildingOffice2Icon, 
  MapPinIcon, 
  PhoneIcon, 
  CurrencyDollarIcon,
  HomeIcon,
  UserIcon,
  PencilIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { updateMessage } from '../services/apiService';

const EditPropertyModal = ({ property, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    sender: '',
    message: '',
    property_type: '',
    location: '',
    price: '',
    agent_phone: '',
    agent_description: '',
    full_description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (property) {
      setFormData({
        sender: property.sender || '',
        message: property.message || '',
        property_type: property.property_type || '',
        location: property.location || '',
        price: property.price || '',
        agent_phone: property.agent_phone || '',
        agent_description: property.agent_description || '',
        full_description: property.full_description || ''
      });
    }
  }, [property]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateMessage(property.id, formData);
      onSave();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const propertyTypes = [
    { value: 'apartment', label: 'شقة' },
    { value: 'villa', label: 'فيلا' },
    { value: 'land', label: 'أرض' },
    { value: 'office', label: 'مكتب' },
    { value: 'warehouse', label: 'مخزن' },
    { value: 'other', label: 'أخرى' }
  ];

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
            className="relative bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
            dir="rtl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <PencilIcon className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">تعديل العقار</h2>
                    <p className="text-blue-100 text-sm">تحديث بيانات العقار</p>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <UserIcon className="w-4 h-4 inline mr-2" />
                    اسم المرسل
                  </label>
                  <input
                    type="text"
                    name="sender"
                    value={formData.sender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل اسم المرسل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <BuildingOffice2Icon className="w-4 h-4 inline mr-2" />
                    نوع العقار
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر نوع العقار</option>
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MapPinIcon className="w-4 h-4 inline mr-2" />
                    الموقع
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل موقع العقار"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                    السعر
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل سعر العقار"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <PhoneIcon className="w-4 h-4 inline mr-2" />
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    name="agent_phone"
                    value={formData.agent_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل رقم الهاتف"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  محتوى الرسالة
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل محتوى الرسالة"
                />
              </div>

              {/* Agent Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  وصف الوكيل
                </label>
                <textarea
                  name="agent_description"
                  value={formData.agent_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل وصف الوكيل"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الوصف الكامل
                </label>
                <textarea
                  name="full_description"
                  value={formData.full_description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل الوصف الكامل للعقار"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-700">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جارٍ الحفظ...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      حفظ التغييرات
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  إلغاء
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditPropertyModal;
