import React, { useState } from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const SimpleDashboard = ({ onLogout }) => {
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
            <h3 className="text-xl font-semibold mb-4">الإحصائيات</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>شقق</span>
                <span className="text-blue-400">25</span>
              </div>
              <div className="flex justify-between">
                <span>فيلل</span>
                <span className="text-green-400">12</span>
              </div>
              <div className="flex justify-between">
                <span>أراضي</span>
                <span className="text-yellow-400">8</span>
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

        {/* Success Message */}
        <div className="mt-8 bg-green-800/20 border border-green-600 rounded-xl p-6">
          <h4 className="text-green-400 font-semibold mb-2">🎉 تم تسجيل الدخول بنجاح!</h4>
          <p className="text-green-300">
            النظام يعمل بشكل مثالي. يمكنك الآن البحث في محادثات العقارات وإدارة البيانات.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SimpleDashboard;
