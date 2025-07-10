import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  CalendarIcon,
  TagIcon,
  EyeIcon,
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { getPropertyById } from '../services/apiService';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('arabic');

  useEffect(() => {
    loadPropertyDetails();
    // Check saved language preference
    const savedLanguage = localStorage.getItem('publicLanguage') || 'arabic';
    
    setLanguage(savedLanguage);
  }, [id]);

  const loadPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await getPropertyById(id);
      console.log('API Response:', response); // Debug log
      setProperty(response);
    } catch (err) {
      setError('Failed to load property details');
      console.error('Error loading property:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyTypeLabel = (type) => {
    const labels = {
      apartment: language === 'arabic' ? 'شقة' : 'Apartment',
      villa: language === 'arabic' ? 'فيلا' : 'Villa', 
      land: language === 'arabic' ? 'أرض' : 'Land',
      office: language === 'arabic' ? 'مكتب' : 'Office',
      warehouse: language === 'arabic' ? 'مخزن' : 'Warehouse'
    };
    return labels[type] || (language === 'arabic' ? 'عقار' : 'Property');
  };

  const getPropertyTypeColor = (type) => {
    const colors = {
      apartment: 'from-blue-500 to-cyan-500',
      villa: 'from-green-500 to-emerald-500',
      land: 'from-orange-500 to-red-500',
      office: 'from-indigo-500 to-purple-500',
      warehouse: 'from-pink-500 to-rose-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {language === 'arabic' ? 'جارٍ تحميل تفاصيل العقار...' : 'Loading property details...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BuildingOffice2Icon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {language === 'arabic' ? 'عذراً، لم يتم العثور على العقار' : 'Sorry, property not found'}
          </h2>
          <p className="text-gray-400 mb-6">
            {language === 'arabic' ? 'العقار المطلوب غير متوفر أو تم حذفه' : 'The requested property is not available or has been deleted'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === 'arabic' ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" dir={language === 'arabic' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              {language === 'arabic' ? (
                <>
                  <ArrowRightIcon className="w-5 h-5" />
                  <span>العودة للرئيسية</span>
                </>
              ) : (
                <>
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Back to Home</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <HeartIcon className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <ShareIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {getPropertyTypeLabel(property.property_type)}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getPropertyTypeColor(property.property_type)} text-white`}>
                      {getPropertyTypeLabel(property.property_type)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {language === 'arabic' ? 'معرف العقار:' : 'Property ID:'} #{property.id}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-gray-400 text-sm mb-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{Math.floor(Math.random() * 100) + 50}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{property.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Location and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {property.location && (
                  <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
                    <MapPinIcon className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="text-gray-400 text-sm">
                        {language === 'arabic' ? 'الموقع' : 'Location'}
                      </p>
                      <p className="text-white font-medium">{property.location}</p>
                    </div>
                  </div>
                )}

                {property.price && (
                  <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="text-gray-400 text-sm">
                        {language === 'arabic' ? 'السعر' : 'Price'}
                      </p>
                      <p className="text-green-400 font-bold text-lg">{property.price}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <TagIcon className="w-5 h-5" />
                  {language === 'arabic' ? 'وصف العقار' : 'Property Description'}
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed text-lg bg-gray-700 p-4 rounded-lg">
                    {property.message}
                  </p>
                  
                  {/* Full Description if available */}
                  {property.full_description && property.full_description !== property.message && (
                    <div className="bg-blue-600/10 border border-blue-600/30 p-4 rounded-lg">
                      <h4 className="text-blue-300 font-medium mb-2">
                        {language === 'arabic' ? 'وصف مفصل' : 'Detailed Description'}
                      </h4>
                      <p className="text-gray-300 leading-relaxed">
                        {property.full_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Keywords */}
              {property.keywords && (
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">
                    {language === 'arabic' ? 'الكلمات المفتاحية' : 'Keywords'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {property.keywords.split(',').map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-600/30"
                      >
                        #{keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                {language === 'arabic' ? 'تفاصيل إضافية' : 'Additional Details'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">
                    {language === 'arabic' ? 'نوع العقار' : 'Property Type'}
                  </p>
                  <p className="text-white font-medium">{getPropertyTypeLabel(property.property_type)}</p>
                </div>

                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">
                    {language === 'arabic' ? 'تاريخ الإضافة' : 'Date Added'}
                  </p>
                  <p className="text-white font-medium">{property.timestamp}</p>
                </div>

                {property.full_description && (
                  <div className="md:col-span-2 p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">
                      {language === 'arabic' ? 'الوصف التفصيلي' : 'Detailed Description'}
                    </p>
                    <p className="text-white leading-relaxed">{property.full_description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Information (without contact details) */}
            {property.sender && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">
                  {language === 'arabic' ? 'معلومات الوسيط' : 'Agent Information'}
                </h3>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {property.sender.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{property.sender}</h4>
                    <p className="text-gray-400">
                      {language === 'arabic' ? 'وسيط عقاري' : 'Real Estate Agent'}
                    </p>
                  </div>
                </div>

                {property.agent_description && (
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <p className="text-gray-300 leading-relaxed">
                      {property.agent_description}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg text-center">
                  <BuildingOffice2Icon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h4 className="text-white font-medium mb-2">
                    {language === 'arabic' ? 'وسيط عقاري معتمد' : 'Certified Real Estate Agent'}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4">
                    {language === 'arabic' 
                      ? 'للحصول على بيانات الاتصال الكاملة ومعلومات الوسيط' 
                      : 'To get complete contact details and agent information'
                    }
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {language === 'arabic' ? 'تسجيل الدخول' : 'Login'}
                  </button>
                </div>
              </div>
            )}

            {/* Contact Information Login Prompt */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                {language === 'arabic' ? 'معلومات التواصل' : 'Contact Information'}
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg text-center">
                  <BuildingOffice2Icon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h4 className="text-white font-medium mb-2">
                    {language === 'arabic' ? 'وسيط عقاري معتمد' : 'Certified Real Estate Agent'}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4">
                    {language === 'arabic' 
                      ? 'للحصول على بيانات الاتصال الكاملة ومعلومات الوسيط' 
                      : 'To get complete contact details and agent information'
                    }
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {language === 'arabic' ? 'تسجيل الدخول' : 'Login'}
                  </button>
                </div>

                <div className="p-4 bg-gray-700 rounded-lg">
                  <h5 className="text-white font-medium mb-2">
                    {language === 'arabic' ? 'نصائح مهمة' : 'Important Tips'}
                  </h5>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• {language === 'arabic' ? 'تأكد من صحة المعلومات' : 'Verify all information'}</li>
                    <li>• {language === 'arabic' ? 'قم بزيارة العقار شخصياً' : 'Visit the property in person'}</li>
                    <li>• {language === 'arabic' ? 'اطلب المستندات القانونية' : 'Request legal documents'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Property Stats */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                {language === 'arabic' ? 'إحصائيات العقار' : 'Property Stats'}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">
                    {language === 'arabic' ? 'المشاهدات' : 'Views'}
                  </span>
                  <span className="text-white font-medium">{Math.floor(Math.random() * 100) + 50}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">
                    {language === 'arabic' ? 'الاستفسارات' : 'Inquiries'}
                  </span>
                  <span className="text-white font-medium">{Math.floor(Math.random() * 20) + 5}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">
                    {language === 'arabic' ? 'آخر تحديث' : 'Last Updated'}
                  </span>
                  <span className="text-white font-medium">
                    {language === 'arabic' ? 'اليوم' : 'Today'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
