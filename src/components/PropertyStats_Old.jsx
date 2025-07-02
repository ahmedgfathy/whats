import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, MessageCircle, Calendar, Users, Table } from 'lucide-react';
import { getPropertyTypeStats, getAllMessages } from '../services/mockDatabase';

const PropertyStats = () => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    propertyTypes: [],
    monthlyData: [],
    topSenders: [],
    allMessages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const propertyStats = await getPropertyTypeStats();
        const allMessages = await getAllMessages();
        
        // Calculate actual statistics from the real data
        const totalMessages = allMessages.length;
        
        // Get property type counts from the actual data
        const propertyTypes = propertyStats.map(stat => {
          const labels = {
            apartment: 'شقق',
            villa: 'فيلل', 
            land: 'أراضي',
            office: 'مكاتب',
            warehouse: 'مخازن'
          };
          return {
            type: stat.property_type,
            count: stat.count,
            label: labels[stat.property_type] || stat.property_type
          };
        });

        // Calculate top senders from actual data
        const senderCounts = {};
        allMessages.forEach(msg => {
          senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1;
        });
        
        const topSenders = Object.entries(senderCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Calculate monthly data (mock for now since we don't have real dates)
        const monthlyData = [
          { month: 'يناير', messages: Math.floor(totalMessages * 0.15) },
          { month: 'فبراير', messages: Math.floor(totalMessages * 0.18) },
          { month: 'مارس', messages: Math.floor(totalMessages * 0.16) },
          { month: 'أبريل', messages: Math.floor(totalMessages * 0.17) },
          { month: 'مايو', messages: Math.floor(totalMessages * 0.19) },
          { month: 'يونيو', messages: Math.floor(totalMessages * 0.15) }
        ];
        
        setStats({
          totalMessages,
          propertyTypes,
          monthlyData,
          topSenders,
          allMessages
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="mr-3 text-gray-600">جاري تحميل الإحصائيات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center" dir="rtl">
            <MessageCircle className="h-8 w-8 text-blue-500 ml-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الرسائل</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMessages.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center" dir="rtl">
            <TrendingUp className="h-8 w-8 text-green-500 ml-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">رسائل عقارية</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.propertyTypes.reduce((sum, type) => sum + type.count, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center" dir="rtl">
            <Users className="h-8 w-8 text-purple-500 ml-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">المرسلون النشطون</p>
              <p className="text-2xl font-bold text-gray-900">{stats.topSenders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center" dir="rtl">
            <Calendar className="h-8 w-8 text-orange-500 ml-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط يومي</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(stats.totalMessages / 30)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4" dir="rtl">
            <PieChart className="h-5 w-5 text-gray-500 ml-2" />
            <h3 className="text-lg font-medium text-gray-900">توزيع أنواع العقارات</h3>
          </div>
          
          <div className="space-y-4">
            {stats.propertyTypes.map((type, index) => {
              const total = stats.propertyTypes.reduce((sum, t) => sum + t.count, 0);
              const percentage = Math.round((type.count / total) * 100);
              const colors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-yellow-500',
                'bg-purple-500',
                'bg-gray-500'
              ];
              
              return (
                <div key={type.type} className="space-y-2">
                  <div className="flex justify-between text-sm" dir="rtl">
                    <span className="font-medium text-gray-900">{type.label}</span>
                    <span className="text-gray-600">{type.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[index % colors.length]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4" dir="rtl">
            <BarChart3 className="h-5 w-5 text-gray-500 ml-2" />
            <h3 className="text-lg font-medium text-gray-900">الاتجاه الشهري</h3>
          </div>
          
          <div className="space-y-3">
            {stats.monthlyData.map((data, index) => {
              const maxMessages = Math.max(...stats.monthlyData.map(d => d.messages));
              const widthPercentage = (data.messages / maxMessages) * 100;
              
              return (
                <div key={data.month} className="space-y-1">
                  <div className="flex justify-between text-sm" dir="rtl">
                    <span className="font-medium text-gray-900">{data.month}</span>
                    <span className="text-gray-600">{data.messages} رسالة</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${widthPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Senders */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4" dir="rtl">
          <Users className="h-5 w-5 text-gray-500 ml-2" />
          <h3 className="text-lg font-medium text-gray-900">أكثر المرسلين نشاطاً</h3>
        </div>
        
        <div className="space-y-3">
          {stats.topSenders.map((sender, index) => (
            <div key={sender.name} className="flex items-center justify-between" dir="rtl">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-yellow-600' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <span className="mr-3 font-medium text-gray-900">{sender.name}</span>
              </div>
              <span className="text-sm text-gray-600">{sender.count} رسالة</span>
            </div>
          ))}
        </div>
      </div>

      {/* All Messages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center" dir="rtl">
            <Table className="h-5 w-5 text-gray-500 ml-2" />
            <h3 className="text-lg font-medium text-gray-900">جدول جميع الرسائل العقارية</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr dir="rtl">
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المرسل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نوع العقار
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموقع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السعر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الكلمات المفتاحية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التوقيت
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.allMessages.map((message, index) => {
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
                    apartment: 'bg-blue-100 text-blue-800',
                    villa: 'bg-green-100 text-green-800',
                    land: 'bg-yellow-100 text-yellow-800',
                    office: 'bg-purple-100 text-purple-800',
                    warehouse: 'bg-gray-100 text-gray-800',
                    other: 'bg-gray-100 text-gray-600'
                  };
                  return colors[type] || 'bg-gray-100 text-gray-600';
                };

                return (
                  <tr key={message.id} className="hover:bg-gray-50" dir="rtl">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.sender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPropertyTypeColor(message.property_type)}`}>
                        {getPropertyTypeLabel(message.property_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.price || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {message.keywords || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {message.timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PropertyStats;
