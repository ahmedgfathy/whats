import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ClipboardIcon,
  ShareIcon,
  HeartIcon,
  StarIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  BuildingStorefrontIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  FireIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { getMessageById } from '../services/apiService';

// Virtual property image generator
const getVirtualPropertyImage = (propertyType, messageId) => {
  const imageCategories = {
    apartment: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop&auto=format'
    ],
    villa: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop&auto=format'
    ],
    land: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1566467712871-f3d5aba3f6c7?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1494280686715-9fd497f4c1a5?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop&auto=format'
    ],
    office: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400&h=250&fit=crop&auto=format'
    ],
    warehouse: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1580687774429-74ee6e4a3fb4?w=400&h=250&fit=crop&auto=format'
    ]
  };

  const images = imageCategories[propertyType] || imageCategories.apartment;
  const imageIndex = Math.abs(messageId || 0) % images.length;
  return images[imageIndex];
};

const PropertyDetailsModal = ({ propertyId, isOpen, onClose }) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [language] = useState('arabic'); // Default to Arabic for now

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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'غير متوفر';
    
    // Handle Egyptian phone numbers (11 digits starting with 01)
    if (/^01\d{9}$/.test(phone)) {
      return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
    }
    
    // Fallback for other formats
    return phone;
  };

  // Function to clean agent names from phone numbers
  const cleanAgentName = (agentName) => {
    if (!agentName) return agentName;
    
    // Remove Egyptian phone numbers in various formats
    // Patterns: +20 XX XXXXXXXX, 01XXXXXXXXX, +201XXXXXXXXX, etc.
    const phonePatterns = [
      /\+?20\s*\d{2}\s*\d{8}/g,  // +20 XX XXXXXXXX
      /\+?20\s*\d{10}/g,         // +20XXXXXXXXXX
      /01\d{9}/g,                // 01XXXXXXXXX
      /\+201\d{8}/g,             // +201XXXXXXXX
      /\d{11}/g,                 // Any 11-digit number
      /\+\d{12,}/g,              // Any international format
      /\d{3}\s*\d{3}\s*\d{4}/g,  // XXX XXX XXXX format
      /\d{4}\s*\d{3}\s*\d{4}/g   // XXXX XXX XXXX format
    ];
    
    let cleanedName = agentName;
    
    // Remove all phone number patterns
    phonePatterns.forEach(pattern => {
      cleanedName = cleanedName.replace(pattern, '');
    });
    
    // Clean up extra spaces and special characters
    cleanedName = cleanedName
      .replace(/[-\(\)\s]+/g, ' ')  // Replace dashes, parentheses, and multiple spaces
      .trim()                       // Remove leading/trailing spaces
      .replace(/\s+/g, ' ');        // Replace multiple spaces with single space
    
    return cleanedName || agentName; // Return original if cleaning results in empty string
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden ${language === 'arabic' ? 'font-cairo lang-arabic' : 'font-roboto lang-english'}`}
          onClick={(e) => e.stopPropagation()}
          dir={language === 'arabic' ? 'rtl' : 'ltr'}
          lang={language === 'arabic' ? 'ar' : 'en'}
        >
          {/* Background with Glass Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Content */}
          <div className="relative h-full overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-purple-500 mx-auto"></div>
                    <SparklesIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-400 animate-pulse" />
                  </div>
                  <p className="text-gray-300 text-lg">جارٍ تحميل تفاصيل العقار...</p>
                </div>
              </div>
            ) : property ? (
              <div className="p-8" dir="rtl">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center space-x-6">
                    <div className={`p-4 bg-gradient-to-r ${getPropertyTypeColor(property.property_type)} rounded-2xl shadow-2xl`}>
                      {React.createElement(getPropertyTypeIcon(property.property_type), {
                        className: "h-8 w-8 text-white"
                      })}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <motion.span 
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getPropertyTypeColor(property.property_type)} shadow-lg`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <StarIcon className="h-4 w-4 ml-2" />
                          {getPropertyTypeLabel(property.property_type)}
                        </motion.span>
                        <motion.div 
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <FireIcon className="h-5 w-5 text-orange-400" />
                          <span className="text-orange-400 text-sm font-semibold">عقار مميز</span>
                        </motion.div>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">تفاصيل العقار</h2>
                      <p className="text-gray-300">معرف العقار: #{property.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 glass rounded-xl border border-white/20 text-gray-300 hover:text-white transition-colors"
                    >
                      <HeartIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 glass rounded-xl border border-white/20 text-gray-300 hover:text-white transition-colors"
                    >
                      <ShareIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={onClose}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 glass rounded-xl border border-white/20 text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Property Details */}
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Description */}
                    <div className="glass rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center space-x-3 mb-4">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">وصف العقار</h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed text-lg">
                        {property.full_description || property.content}
                      </p>
                    </div>

                    {/* Property Information */}
                    <div className="glass rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center space-x-3 mb-6">
                        <TagIcon className="h-5 w-5 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">معلومات العقار</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/10">
                          <div className="flex items-center space-x-3">
                            <CalendarIcon className="h-5 w-5 text-green-400" />
                            <span className="text-gray-300">تاريخ الإضافة</span>
                          </div>
                          <span className="text-white font-semibold">
                            {new Date(property.timestamp).toLocaleDateString('ar-SA')}
                          </span>
                        </div>

                        {property.location && (
                          <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/10">
                            <div className="flex items-center space-x-3">
                              <MapPinIcon className="h-5 w-5 text-red-400" />
                              <span className="text-gray-300">الموقع</span>
                            </div>
                            <span className="text-white font-semibold">{property.location}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/10">
                          <div className="flex items-center space-x-3">
                            <EyeIcon className="h-5 w-5 text-yellow-400" />
                            <span className="text-gray-300">المشاهدات</span>
                          </div>
                          <span className="text-white font-semibold">{Math.floor(Math.random() * 100) + 10}</span>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    {property.keywords && property.keywords.length > 0 && (
                      <div className="glass rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center space-x-3 mb-4">
                          <SparklesIcon className="h-5 w-5 text-purple-400" />
                          <h3 className="text-xl font-bold text-white">الكلمات المفتاحية</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {property.keywords.map((keyword, index) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30 backdrop-blur-xl"
                            >
                              #{keyword}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Right Column - Contact Information */}
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {/* Agent Information */}
                    <div className="glass rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center space-x-3 mb-6">
                        <UserIcon className="h-5 w-5 text-green-400" />
                        <h3 className="text-xl font-bold text-white">معلومات الوسيط</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-center p-6 glass rounded-xl border border-white/10">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserIcon className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="text-xl font-bold text-white mb-2">{cleanAgentName(property.sender)}</h4>
                          <p className="text-gray-300 text-sm">
                            {property.agent_description || 'وسيط عقاري معتمد'}
                          </p>
                        </div>

                        {/* Contact Actions */}
                        <div className="space-y-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => property.agent_phone && window.open(`tel:${property.agent_phone}`)}
                            className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <PhoneIcon className="h-5 w-5" />
                            <span>اتصال مباشر</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => property.agent_phone && window.open(`https://wa.me/${property.agent_phone.replace(/[^0-9]/g, '')}`)}
                            className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                            <span>واتساب</span>
                          </motion.button>

                          {property.agent_phone && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => copyToClipboard(property.agent_phone)}
                              className="w-full flex items-center justify-center space-x-3 p-4 glass border border-white/20 text-gray-300 hover:text-white font-bold rounded-2xl transition-all duration-300"
                            >
                              <ClipboardIcon className="h-5 w-5" />
                              <span>{copied ? 'تم النسخ!' : 'نسخ الرقم'}</span>
                            </motion.button>
                          )}
                        </div>

                        {/* Phone Number Display */}
                        {property.agent_phone && (
                          <div className="text-center p-4 glass rounded-xl border border-white/10">
                            <p className="text-gray-300 text-sm mb-2">رقم الهاتف</p>
                            <p className="text-xl font-bold text-white font-mono" dir="ltr">
                              {formatPhoneNumber(property.agent_phone)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Safety Notice */}
                    <motion.div 
                      className="glass rounded-2xl p-6 border border-yellow-500/20 bg-yellow-500/5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <SparklesIcon className="h-5 w-5 text-yellow-400" />
                        <h3 className="text-lg font-bold text-yellow-400">تنبيه أمني</h3>
                      </div>
                      <p className="text-yellow-200 text-sm leading-relaxed">
                        تأكد من صحة المعلومات قبل إتمام أي صفقة. لا تقم بتحويل أي مبالغ مالية دون التأكد من صحة العقار والوسيط.
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <XMarkIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">خطأ في تحميل البيانات</h3>
                  <p className="text-gray-300">لم يتم العثور على تفاصيل العقار</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PropertyDetailsModal;
