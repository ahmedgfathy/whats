import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BuildingOffice2Icon, 
  MapPinIcon, 
  PhoneIcon, 
  CurrencyDollarIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const CSVPropertyDetailsModal = ({ property, isOpen, onClose }) => {
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
            className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            dir="rtl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    {property.Property_Name || 'عقار بدون اسم'}
                  </h2>
                  {property.Property_Number && (
                    <p className="text-green-100 text-sm">رقم العقار: {property.Property_Number}</p>
                  )}
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
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.Property_Type && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <BuildingOffice2Icon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">نوع العقار</p>
                      <p className="font-medium">{property.Property_Type}</p>
                    </div>
                  </div>
                )}

                {property.Property_Category && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <HomeIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">فئة العقار</p>
                      <p className="font-medium">{property.Property_Category}</p>
                    </div>
                  </div>
                )}

                {property.Regions && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPinIcon className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">المنطقة</p>
                      <p className="font-medium">{property.Regions}</p>
                    </div>
                  </div>
                )}

                {property.Unit_Price && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CurrencyDollarIcon className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">السعر</p>
                      <p className="font-medium text-green-600">{property.Unit_Price} جنيه</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.Bedroom && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{property.Bedroom}</p>
                    <p className="text-sm text-gray-600">غرف نوم</p>
                  </div>
                )}

                {property.Bathroom && (
                  <div className="text-center p-3 bg-cyan-50 rounded-lg">
                    <p className="text-2xl font-bold text-cyan-600">{property.Bathroom}</p>
                    <p className="text-sm text-gray-600">حمامات</p>
                  </div>
                )}

                {property.Building && (
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{property.Building}</p>
                    <p className="text-sm text-gray-600">متر مربع</p>
                  </div>
                )}

                {property.Floor_No_ && (
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{property.Floor_No_}</p>
                    <p className="text-sm text-gray-600">الطابق</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.Description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">الوصف</h3>
                  <p className="text-gray-700 leading-relaxed">{property.Description}</p>
                </div>
              )}

              {/* Contact Information */}
              {(property.Name || property.Mobile_No || property.Tel) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    معلومات الاتصال
                  </h3>
                  <div className="space-y-2">
                    {property.Name && (
                      <p className="flex items-center gap-2">
                        <span className="text-gray-600">الاسم:</span>
                        <span className="font-medium">{property.Name}</span>
                      </p>
                    )}
                    {property.Mobile_No && (
                      <p className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">الجوال:</span>
                        <span className="font-medium direction-ltr">{property.Mobile_No}</span>
                      </p>
                    )}
                    {property.Tel && (
                      <p className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">الهاتف:</span>
                        <span className="font-medium direction-ltr">{property.Tel}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Property Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.Finished && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <WrenchScrewdriverIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">حالة التشطيب</p>
                      <p className="font-medium">{property.Finished}</p>
                    </div>
                  </div>
                )}

                {property.Property_Offered_By && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <UserIcon className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">معروض من قبل</p>
                      <p className="font-medium">{property.Property_Offered_By}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              {(property.Payment_Type || property.Deposit || property.Payment) && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">معلومات الدفع</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {property.Payment_Type && (
                      <div>
                        <p className="text-sm text-gray-600">نوع الدفع</p>
                        <p className="font-medium">{property.Payment_Type}</p>
                      </div>
                    )}
                    {property.Deposit && (
                      <div>
                        <p className="text-sm text-gray-600">العربون</p>
                        <p className="font-medium">{property.Deposit}</p>
                      </div>
                    )}
                    {property.Payment && (
                      <div>
                        <p className="text-sm text-gray-600">الدفع</p>
                        <p className="font-medium">{property.Payment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              {(property.Created_Time || property.Modified_Time) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-600" />
                    التواريخ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {property.Created_Time && (
                      <div>
                        <p className="text-gray-600">تاريخ الإنشاء</p>
                        <p className="font-medium">{property.Created_Time}</p>
                      </div>
                    )}
                    {property.Modified_Time && (
                      <div>
                        <p className="text-gray-600">تاريخ التعديل</p>
                        <p className="font-medium">{property.Modified_Time}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sales Information */}
              {(property.Sales || property.Handler || property.Last_Modified_By) && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">معلومات المبيعات</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {property.Sales && (
                      <div>
                        <p className="text-gray-600">مندوب المبيعات</p>
                        <p className="font-medium">{property.Sales}</p>
                      </div>
                    )}
                    {property.Handler && (
                      <div>
                        <p className="text-gray-600">المسؤول</p>
                        <p className="font-medium">{property.Handler}</p>
                      </div>
                    )}
                    {property.Last_Modified_By && (
                      <div>
                        <p className="text-gray-600">آخر تعديل بواسطة</p>
                        <p className="font-medium">{property.Last_Modified_By}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {property.Zain_House_Sales_Notes && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">ملاحظات المبيعات</h3>
                  <p className="text-gray-700">{property.Zain_House_Sales_Notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CSVPropertyDetailsModal;
