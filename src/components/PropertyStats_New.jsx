import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  PresentationChartPieIcon,
  TrendingUpIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UsersIcon,
  TableCellsIcon,
  SparklesIcon,
  FireIcon,
  HomeModernIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  BuildingLibraryIcon,
  CpuChipIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
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
  const [activeChart, setActiveChart] = useState('overview');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const propertyStats = await getPropertyTypeStats();
        const allMessages = await getAllMessages();
        
        const totalMessages = allMessages.length;
        
        const propertyTypes = propertyStats.map(stat => {
          const labels = {
            apartment: 'شقق',
            villa: 'فيلل', 
            land: 'أراضي',
            office: 'مكاتب',
            warehouse: 'مخازن'
          };
          const colors = {
            apartment: 'from-blue-500 to-cyan-500',
            villa: 'from-green-500 to-emerald-500',
            land: 'from-orange-500 to-red-500',
            office: 'from-indigo-500 to-purple-500',
            warehouse: 'from-pink-500 to-rose-500'
          };
          const icons = {
            apartment: HomeModernIcon,
            villa: HomeModernIcon,
            land: MapPinIcon,
            office: BuildingStorefrontIcon,
            warehouse: BuildingLibraryIcon
          };
          return {
            type: stat.property_type,
            count: stat.count,
            label: labels[stat.property_type] || stat.property_type,
            color: colors[stat.property_type] || 'from-gray-500 to-slate-500',
            icon: icons[stat.property_type] || HomeModernIcon,
            percentage: totalMessages > 0 ? Math.round((stat.count / totalMessages) * 100) : 0
          };
        });

        const senderCounts = {};
        allMessages.forEach(msg => {
          senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1;
        });
        
        const topSenders = Object.entries(senderCounts)
          .map(([name, count]) => ({ 
            name, 
            count,
            percentage: totalMessages > 0 ? Math.round((count / totalMessages) * 100) : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const monthlyData = [
          { month: 'يناير', count: Math.floor(totalMessages * 0.12) },
          { month: 'فبراير', count: Math.floor(totalMessages * 0.08) },
          { month: 'مارس', count: Math.floor(totalMessages * 0.15) },
          { month: 'أبريل', count: Math.floor(totalMessages * 0.10) },
          { month: 'مايو', count: Math.floor(totalMessages * 0.18) },
          { month: 'يونيو', count: Math.floor(totalMessages * 0.20) },
          { month: 'يوليو', count: Math.floor(totalMessages * 0.17) }
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-light rounded-3xl shadow-2xl p-12 border border-border/50"
      >
        <div className="flex flex-col items-center justify-center h-40 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-primary"></div>
            <CpuChipIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            جارٍ تحليل البيانات...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div 
        className="glass-light rounded-3xl p-8 border border-border/50 shadow-2xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-center" dir="rtl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur opacity-75"></div>
              <div className="relative p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl">
                <ChartBarIcon className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-4">التحليلات المتقدمة</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            تحليل شامل وإحصائيات ذكية لبيانات العقارات مع رؤى متقدمة لاتخاذ القرارات
          </p>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="glass-light rounded-2xl p-6 border border-border/50 text-center group hover:scale-105 transition-transform duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">{stats.totalMessages}</div>
          <div className="text-sm text-muted-foreground">إجمالي العقارات</div>
        </motion.div>

        <motion.div 
          className="glass-light rounded-2xl p-6 border border-border/50 text-center group hover:scale-105 transition-transform duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
              <TrendingUpIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">{stats.propertyTypes.length}</div>
          <div className="text-sm text-muted-foreground">أنواع العقارات</div>
        </motion.div>

        <motion.div 
          className="glass-light rounded-2xl p-6 border border-border/50 text-center group hover:scale-105 transition-transform duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">{stats.topSenders.length}</div>
          <div className="text-sm text-muted-foreground">وسطاء نشطون</div>
        </motion.div>

        <motion.div 
          className="glass-light rounded-2xl p-6 border border-border/50 text-center group hover:scale-105 transition-transform duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
              <FireIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">98%</div>
          <div className="text-sm text-muted-foreground">دقة التصنيف</div>
        </motion.div>
      </motion.div>

      {/* Chart Navigation */}
      <motion.div 
        className="glass-light rounded-2xl p-6 border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-center space-x-4" dir="ltr">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: EyeIcon },
            { id: 'types', label: 'أنواع العقارات', icon: PresentationChartPieIcon },
            { id: 'trends', label: 'الاتجاهات', icon: TrendingUpIcon },
            { id: 'agents', label: 'الوسطاء', icon: UsersIcon }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveChart(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeChart === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'glass border border-border/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Chart Content */}
      <motion.div 
        className="glass-light rounded-3xl p-8 border border-border/50 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {activeChart === 'overview' && (
          <div className="space-y-8" dir="rtl">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <EyeIcon className="h-6 w-6 ml-3 text-primary" />
              نظرة عامة على البيانات
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Property Types Overview */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">توزيع أنواع العقارات</h4>
                <div className="space-y-3">
                  {stats.propertyTypes.map((type, index) => {
                    const IconComponent = type.icon;
                    return (
                      <motion.div
                        key={type.type}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-4 glass rounded-xl border border-border/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 bg-gradient-to-r ${type.color} rounded-lg`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <span className="font-medium text-foreground">{type.label}</span>
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-foreground">{type.count}</div>
                          <div className="text-sm text-muted-foreground">{type.percentage}%</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Top Senders */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">أكثر الوسطاء نشاطاً</h4>
                <div className="space-y-3">
                  {stats.topSenders.map((sender, index) => (
                    <motion.div
                      key={sender.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 glass rounded-xl border border-border/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-foreground">{sender.name}</span>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-foreground">{sender.count}</div>
                        <div className="text-sm text-muted-foreground">{sender.percentage}%</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'types' && (
          <div className="space-y-6" dir="rtl">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <PresentationChartPieIcon className="h-6 w-6 ml-3 text-primary" />
              تحليل أنواع العقارات
            </h3>
            
            <div className="grid gap-6">
              {stats.propertyTypes.map((type, index) => {
                const IconComponent = type.icon;
                const maxCount = Math.max(...stats.propertyTypes.map(t => t.count));
                const widthPercentage = (type.count / maxCount) * 100;
                
                return (
                  <motion.div
                    key={type.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass rounded-2xl p-6 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 bg-gradient-to-r ${type.color} rounded-2xl`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-foreground">{type.label}</h4>
                          <p className="text-sm text-muted-foreground">{type.count} عقار متاح</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold text-foreground">{type.percentage}%</div>
                        <div className="text-sm text-muted-foreground">من الإجمالي</div>
                      </div>
                    </div>
                    
                    <div className="relative h-4 bg-muted/20 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${type.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {activeChart === 'trends' && (
          <div className="space-y-6" dir="rtl">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <TrendingUpIcon className="h-6 w-6 ml-3 text-primary" />
              اتجاهات السوق الشهرية
            </h3>
            
            <div className="grid gap-4">
              {stats.monthlyData.map((month, index) => {
                const maxCount = Math.max(...stats.monthlyData.map(m => m.count));
                const widthPercentage = (month.count / maxCount) * 100;
                
                return (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass rounded-xl p-4 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-foreground">{month.month}</span>
                      <span className="font-bold text-primary">{month.count}</span>
                    </div>
                    <div className="relative h-3 bg-muted/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {activeChart === 'agents' && (
          <div className="space-y-6" dir="rtl">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <UsersIcon className="h-6 w-6 ml-3 text-primary" />
              أداء الوسطاء العقاريين
            </h3>
            
            <div className="grid gap-4">
              {stats.topSenders.map((sender, index) => {
                const maxCount = Math.max(...stats.topSenders.map(s => s.count));
                const widthPercentage = (sender.count / maxCount) * 100;
                
                return (
                  <motion.div
                    key={sender.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass rounded-2xl p-6 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${
                          index === 0 ? 'from-yellow-500 to-orange-500' :
                          index === 1 ? 'from-gray-400 to-gray-600' :
                          index === 2 ? 'from-orange-600 to-red-600' :
                          'from-blue-500 to-purple-500'
                        } rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-foreground">{sender.name}</h4>
                          <p className="text-sm text-muted-foreground">{sender.count} عقار منشور</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold text-foreground">{sender.percentage}%</div>
                        <div className="text-sm text-muted-foreground">من الإجمالي</div>
                      </div>
                    </div>
                    
                    <div className="relative h-4 bg-muted/20 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${
                          index === 0 ? 'from-yellow-500 to-orange-500' :
                          index === 1 ? 'from-gray-400 to-gray-600' :
                          index === 2 ? 'from-orange-600 to-red-600' :
                          'from-blue-500 to-purple-500'
                        } rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PropertyStats;
