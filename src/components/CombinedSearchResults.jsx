import React from 'react';
import { motion } from 'framer-motion';
import { ChatBubbleLeftIcon, BuildingOffice2Icon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

const CombinedSearchResults = ({ combinedResults, onItemClick }) => {
  if (!combinedResults) return null;

  const { chatMessages = [], properties = [], totalChat = 0, totalProperties = 0 } = combinedResults;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">نتائج البحث الموحد</h3>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1 text-blue-600">
              <ChatBubbleLeftIcon className="w-4 h-4" />
              {totalChat} محادثة
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <BuildingOffice2Icon className="w-4 h-4" />
              {totalProperties} عقار
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages Section */}
      {chatMessages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />
            رسائل WhatsApp ({totalChat})
          </h4>
          <div className="grid gap-4">
            {chatMessages.map((message, index) => (
              <motion.div
                key={`chat-${message.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onItemClick && onItemClick(message, 'chat')}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-blue-600">{message.sender}</span>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>
                <p className="text-gray-800 mb-2 line-clamp-2">{message.message}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {message.property_type && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                      {message.property_type}
                    </span>
                  )}
                  {message.location && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {message.location}
                    </span>
                  )}
                  {message.price && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md">
                      {message.price}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Properties Section */}
      {properties.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <BuildingOffice2Icon className="w-5 h-5 text-green-500" />
            عقارات CSV ({totalProperties})
          </h4>
          <div className="grid gap-4">
            {properties.map((property, index) => (
              <motion.div
                key={`property-${property.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: (chatMessages.length + index) * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onItemClick && onItemClick(property, 'property')}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800 line-clamp-1">
                    {property.Property_Name || 'عقار بدون اسم'}
                  </h5>
                  <span className="text-xs text-gray-500">{property.Property_Number}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  {property.Property_Type && (
                    <span className="flex items-center gap-1">
                      <BuildingOffice2Icon className="w-4 h-4" />
                      {property.Property_Type}
                    </span>
                  )}
                  {property.Regions && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {property.Regions}
                    </span>
                  )}
                  {property.Mobile_No && (
                    <span className="flex items-center gap-1">
                      <PhoneIcon className="w-4 h-4" />
                      {property.Mobile_No}
                    </span>
                  )}
                  {property.Unit_Price && (
                    <span className="font-medium text-green-600">
                      {property.Unit_Price} جنيه
                    </span>
                  )}
                </div>

                {property.Description && (
                  <p className="text-gray-700 text-sm line-clamp-2 mb-2">
                    {property.Description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 text-xs">
                  {property.Property_Category && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
                      {property.Property_Category}
                    </span>
                  )}
                  {property.Bedroom && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                      {property.Bedroom} غرف
                    </span>
                  )}
                  {property.Bathroom && (
                    <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded-md">
                      {property.Bathroom} حمام
                    </span>
                  )}
                  {property.Building && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md">
                      {property.Building} م²
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {chatMessages.length === 0 && properties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">لا توجد نتائج</div>
          <p className="text-gray-500">جرب كلمات بحث مختلفة أو فلاتر أخرى</p>
        </div>
      )}
    </div>
  );
};

export default CombinedSearchResults;
