import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDropdownData } from '../services/apiService';
import {
  BuildingOffice2Icon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const PropertyForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    property_name: '',
    property_number: '',
    property_category_id: '',
    region_id: '',
    floor_type_id: '',
    listing_type_id: '',
    finish_type_id: '',
    offered_by_id: '',
    payment_type_id: '',
    payment_frequency_id: '',
    area_sqm: '',
    bedrooms: '',
    bathrooms: '',
    unit_price: '',
    deposit: '',
    owner_name: '',
    mobile_no: '',
    description: ''
  });

  const [dropdownData, setDropdownData] = useState({
    propertyCategories: [],
    regions: [],
    floorTypes: [],
    listingTypes: [],
    finishTypes: [],
    offeredByTypes: [],
    paymentTypes: [],
    paymentFrequencies: []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
      if (initialData) {
        setFormData(initialData);
      }
    }
  }, [isOpen, initialData]);

  const loadDropdownData = async () => {
    try {
      const data = await getDropdownData();
      setDropdownData(data);
      console.log('✅ Dropdown data loaded:', data);
    } catch (error) {
      console.error('❌ Error loading dropdown data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.property_name.trim()) {
      newErrors.property_name = 'اسم العقار مطلوب';
    }
    
    if (!formData.property_category_id) {
      newErrors.property_category_id = 'نوع العقار مطلوب';
    }
    
    if (!formData.listing_type_id) {
      newErrors.listing_type_id = 'نوع الإعلان مطلوب';
    }
    
    if (formData.unit_price && isNaN(Number(formData.unit_price))) {
      newErrors.unit_price = 'السعر يجب أن يكون رقم';
    }
    
    if (formData.mobile_no && !/^[\d\s\-\+\(\)]+$/.test(formData.mobile_no)) {
      newErrors.mobile_no = 'رقم الهاتف غير صحيح';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BuildingOffice2Icon className="h-8 w-8" />
              <h2 className="text-2xl font-bold">
                {initialData ? 'تعديل العقار' : 'إضافة عقار جديد'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم العقار *
              </label>
              <input
                type="text"
                value={formData.property_name}
                onChange={(e) => handleInputChange('property_name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.property_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ادخل اسم العقار"
                dir="rtl"
              />
              {errors.property_name && (
                <p className="text-red-500 text-sm mt-1">{errors.property_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم العقار
              </label>
              <input
                type="text"
                value={formData.property_number}
                onChange={(e) => handleInputChange('property_number', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="رقم العقار"
                dir="rtl"
              />
            </div>
          </div>

          {/* Category and Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع العقار *
              </label>
              <select
                value={formData.property_category_id}
                onChange={(e) => handleInputChange('property_category_id', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.property_category_id ? 'border-red-500' : 'border-gray-300'
                }`}
                dir="rtl"
              >
                <option value="">اختر نوع العقار</option>
                {dropdownData.propertyCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name_ar} ({category.name_en})
                  </option>
                ))}
              </select>
              {errors.property_category_id && (
                <p className="text-red-500 text-sm mt-1">{errors.property_category_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المنطقة
              </label>
              <select
                value={formData.region_id}
                onChange={(e) => handleInputChange('region_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dir="rtl"
              >
                <option value="">اختر المنطقة</option>
                {dropdownData.regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Floor and Listing Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الطابق
              </label>
              <select
                value={formData.floor_type_id}
                onChange={(e) => handleInputChange('floor_type_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dir="rtl"
              >
                <option value="">اختر الطابق</option>
                {dropdownData.floorTypes.map(floor => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الإعلان *
              </label>
              <select
                value={formData.listing_type_id}
                onChange={(e) => handleInputChange('listing_type_id', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.listing_type_id ? 'border-red-500' : 'border-gray-300'
                }`}
                dir="rtl"
              >
                <option value="">اختر نوع الإعلان</option>
                {dropdownData.listingTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name === 'For Sale' ? 'للبيع' : 'للإيجار'}
                  </option>
                ))}
              </select>
              {errors.listing_type_id && (
                <p className="text-red-500 text-sm mt-1">{errors.listing_type_id}</p>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المساحة (متر مربع)
              </label>
              <input
                type="number"
                value={formData.area_sqm}
                onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="المساحة"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الغرف
              </label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="عدد الغرف"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الحمامات
              </label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="عدد الحمامات"
                min="0"
              />
            </div>
          </div>

          {/* Price and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر (جنيه مصري)
              </label>
              <input
                type="number"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.unit_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="السعر"
                min="0"
                step="0.01"
              />
              {errors.unit_price && (
                <p className="text-red-500 text-sm mt-1">{errors.unit_price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={formData.mobile_no}
                onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.mobile_no ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
              {errors.mobile_no && (
                <p className="text-red-500 text-sm mt-1">{errors.mobile_no}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف العقار
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="اكتب وصفاً مفصلاً للعقار..."
              dir="rtl"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  {initialData ? 'تحديث العقار' : 'إضافة العقار'}
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PropertyForm;
