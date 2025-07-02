import React, { useState, useEffect } from 'react';
import { ArrowRightOnRectangleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { getAllMessages } from '../services/mockDatabase';

const SimpleDashboard = ({ onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Load data from mock database
    const loadData = async () => {
      try {
        const data = await getAllMessages();
        setMessages(data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const showUnitDetails = (unit) => {
    setSelectedUnit(unit);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUnit(null);
  };

  const getPropertyTypeInArabic = (type) => {
    const types = {
      apartment: 'شقة',
      villa: 'فيلا', 
      land: 'أرض',
      office: 'مكتب',
      warehouse: 'مخزن'
    };
    return types[type] || type;
  };

  const getStats = () => {
    const stats = {
      apartment: messages.filter(m => m.property_type === 'apartment').length,
      villa: messages.filter(m => m.property_type === 'villa').length,
      land: messages.filter(m => m.property_type === 'land').length,
      office: messages.filter(m => m.property_type === 'office').length,
      warehouse: messages.filter(m => m.property_type === 'warehouse').length
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white">
                البحث في العقارات
              </h1>
              <span className="text-lg text-gray-300 mr-4">Real Estate Chat Search</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 ml-2" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">مرحباً بك</h2>
            <p className="text-blue-100">في نظام البحث في محادثات العقارات</p>
            <div className="mt-4 text-3xl">🏠</div>
          </div>

          {/* Search Card */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">البحث السريع</h3>
            <input
              type="text"
              placeholder="ابحث عن شقة، فيلا، أرض..."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              dir="rtl"
            />
            <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              بحث
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">الإحصائيات المباشرة</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>شقق</span>
                <span className="text-blue-400">{stats.apartment}</span>
              </div>
              <div className="flex justify-between">
                <span>فيلل</span>
                <span className="text-green-400">{stats.villa}</span>
              </div>
              <div className="flex justify-between">
                <span>أراضي</span>
                <span className="text-yellow-400">{stats.land}</span>
              </div>
              <div className="flex justify-between">
                <span>مكاتب</span>
                <span className="text-purple-400">{stats.office}</span>
              </div>
              <div className="flex justify-between">
                <span>مخازن</span>
                <span className="text-red-400">{stats.warehouse}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">استيراد المحادثات</h3>
            <p className="text-gray-300 mb-4">قم بتحميل محادثات الواتساب الخاصة بالعقارات</p>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              تحميل الملف
            </button>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">النتائج الحديثة</h3>
            <p className="text-gray-300 mb-4">آخر العقارات المضافة والمحدثة</p>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              عرض النتائج
            </button>
          </div>
        </div>

        {/* Units Table */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">جميع الوحدات العقارية</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-right p-3">#</th>
                  <th className="text-right p-3">المرسل</th>
                  <th className="text-right p-3">نوع العقار</th>
                  <th className="text-right p-3">الموقع</th>
                  <th className="text-right p-3">السعر</th>
                  <th className="text-right p-3">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {messages.slice(0, 10).map((unit, index) => (
                  <tr key={unit.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{unit.sender}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-600 rounded text-xs">
                        {getPropertyTypeInArabic(unit.property_type)}
                      </span>
                    </td>
                    <td className="p-3">{unit.location}</td>
                    <td className="p-3">{unit.price || 'غير محدد'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => showUnitDetails(unit)}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                      >
                        <EyeIcon className="h-4 w-4 ml-1" />
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-800/20 border border-green-600 rounded-xl p-6">
          <h4 className="text-green-400 font-semibold mb-2">🎉 تم تسجيل الدخول بنجاح!</h4>
          <p className="text-green-300">
            النظام يعمل بشكل مثالي. يمكنك الآن البحث في محادثات العقارات وإدارة البيانات.
          </p>
        </div>
      </main>

      {/* Details Modal */}
      {showModal && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">تفاصيل العقار</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 text-right" dir="rtl">
              <div>
                <strong>المرسل:</strong> {selectedUnit.sender}
              </div>
              <div>
                <strong>نوع العقار:</strong> {getPropertyTypeInArabic(selectedUnit.property_type)}
              </div>
              <div>
                <strong>الموقع:</strong> {selectedUnit.location}
              </div>
              <div>
                <strong>السعر:</strong> {selectedUnit.price || 'غير محدد'}
              </div>
              <div>
                <strong>الرسالة:</strong> {selectedUnit.message}
              </div>
              <div>
                <strong>الكلمات المفتاحية:</strong> {selectedUnit.keywords}
              </div>
              <div>
                <strong>التوقيت:</strong> {selectedUnit.timestamp}
              </div>
              {selectedUnit.agent_phone && (
                <div>
                  <strong>الهاتف:</strong> {selectedUnit.agent_phone}
                </div>
              )}
              {selectedUnit.full_description && (
                <div>
                  <strong>الوصف الكامل:</strong> {selectedUnit.full_description}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDashboard;
