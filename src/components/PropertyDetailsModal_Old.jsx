import React, { useState, useEffect } from 'react';
import { X, Phone, MapPin, Calendar, Tag, DollarSign, User, MessageSquare, Copy, Share } from 'lucide-react';
import { getMessageById } from '../services/mockDatabase';

const PropertyDetailsModal = ({ propertyId, isOpen, onClose }) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && propertyId) {
      loadPropertyDetails();
    }
  }, [isOpen, propertyId]);

  const loadPropertyDetails = async () => {
    setLoading(true);
    try {
      const propertyData = await getMessageById(propertyId);
      setProperty(propertyData);
    } catch (error) {
      console.error('Error loading property details:', error);
    } finally {
      setLoading(false);
    }
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
      apartment: 'bg-blue-100 text-blue-800 border-blue-200',
      villa: 'bg-green-100 text-green-800 border-green-200',
      land: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      office: 'bg-purple-100 text-purple-800 border-purple-200',
      warehouse: 'bg-gray-100 text-gray-800 border-gray-200',
      other: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: `عقار ${getPropertyTypeLabel(property.property_type)} في ${property.location}`,
        text: property.message,
        url: window.location.href
      });
    } else {
      copyToClipboard(property.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 text-right">
            تفاصيل العقار
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="mr-3 text-gray-600">جاري التحميل...</span>
          </div>
        ) : property ? (
          <div className="p-6 space-y-6">
            {/* Property Type Badge */}
            <div className="flex justify-end">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getPropertyTypeColor(property.property_type)}`}>
                <Tag className="h-4 w-4 ml-2" />
                {getPropertyTypeLabel(property.property_type)}
              </span>
            </div>

            {/* Main Message */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-right">الرسالة الأصلية</h3>
              <p className="text-gray-700 leading-relaxed text-right" dir="rtl">
                {property.message}
              </p>
            </div>

            {/* Full Description */}
            {property.full_description && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2 text-right">الوصف التفصيلي</h3>
                <p className="text-gray-700 leading-relaxed text-right" dir="rtl">
                  {property.full_description}
                </p>
              </div>
            )}

            {/* Property Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              {property.location && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-end mb-2">
                    <MapPin className="h-5 w-5 text-green-600 ml-2" />
                    <span className="font-medium text-gray-900">الموقع</span>
                  </div>
                  <p className="text-gray-700 text-right">{property.location}</p>
                </div>
              )}

              {/* Price */}
              {property.price && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-end mb-2">
                    <DollarSign className="h-5 w-5 text-yellow-600 ml-2" />
                    <span className="font-medium text-gray-900">السعر</span>
                  </div>
                  <p className="text-gray-700 text-right">{property.price}</p>
                </div>
              )}

              {/* Timestamp */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-end mb-2">
                  <Calendar className="h-5 w-5 text-blue-600 ml-2" />
                  <span className="font-medium text-gray-900">تاريخ النشر</span>
                </div>
                <p className="text-gray-700 text-right">{property.timestamp}</p>
              </div>

              {/* Keywords */}
              {property.keywords && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-end mb-2">
                    <Tag className="h-5 w-5 text-purple-600 ml-2" />
                    <span className="font-medium text-gray-900">الكلمات المفتاحية</span>
                  </div>
                  <p className="text-gray-700 text-right">{property.keywords}</p>
                </div>
              )}
            </div>

            {/* Agent Information */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-right">معلومات المعلن</h3>
              
              <div className="space-y-3">
                {/* Agent Name */}
                <div className="flex items-center justify-end">
                  <User className="h-5 w-5 text-indigo-600 ml-2" />
                  <span className="font-medium text-gray-900">{property.sender}</span>
                </div>

                {/* Agent Phone */}
                {property.agent_phone && (
                  <div className="flex items-center justify-end">
                    <Phone className="h-5 w-5 text-green-600 ml-2" />
                    <span className="text-gray-700" dir="ltr">{property.agent_phone}</span>
                    <button
                      onClick={() => copyToClipboard(property.agent_phone)}
                      className="mr-2 p-1 text-gray-400 hover:text-gray-600"
                      title="نسخ رقم الهاتف"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Agent Description */}
                {property.agent_description && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-gray-700 text-sm text-right" dir="rtl">
                      {property.agent_description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end" dir="rtl">
              <button
                onClick={() => window.open(`tel:${property.agent_phone}`)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Phone className="h-4 w-4 ml-2" />
                اتصال
              </button>
              
              <button
                onClick={() => window.open(`https://wa.me/${property.agent_phone?.replace(/[^0-9]/g, '')}`)}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <MessageSquare className="h-4 w-4 ml-2" />
                واتساب
              </button>

              <button
                onClick={shareProperty}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share className="h-4 w-4 ml-2" />
                مشاركة
              </button>

              <button
                onClick={() => copyToClipboard(property.message)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Copy className="h-4 w-4 ml-2" />
                نسخ النص
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">لم يتم العثور على تفاصيل العقار</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetailsModal;
