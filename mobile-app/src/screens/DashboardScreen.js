import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  I18nManager,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, propertyColors } from '../theme/theme';
import {
  getAllMessages,
  searchMessages,
  getPropertyTypeStats,
  searchProperties,
} from '../services/apiService';
import Toast from 'react-native-toast-message';
import FastImage from 'react-native-fast-image';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation, onLogout, onLanguageSwitch, language }) => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const isArabic = language === 'arabic';

  const texts = {
    arabic: {
      title: 'لوحة التحكم',
      search: 'بحث في الرسائل',
      searchPlaceholder: 'ابحث عن العقارات...',
      allProperties: 'جميع العقارات',
      apartment: 'شقة',
      villa: 'فيلا',
      land: 'أرض',
      office: 'مكتب',
      warehouse: 'مخزن',
      shop: 'محل',
      noResults: 'لا توجد نتائج',
      loadingMore: 'جاري تحميل المزيد...',
      refresh: 'تحديث',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      upload: 'رفع البيانات',
      propertyDetails: 'تفاصيل العقار',
      viewDetails: 'عرض التفاصيل',
      totalProperties: 'إجمالي العقارات',
      searchResults: 'نتائج البحث',
      clearSearch: 'مسح البحث',
      filterBy: 'تصفية حسب',
      sortBy: 'ترتيب حسب',
      latest: 'الأحدث',
      oldest: 'الأقدم',
      priceHigh: 'السعر (عالي)',
      priceLow: 'السعر (منخفض)',
      location: 'الموقع',
      price: 'السعر',
      area: 'المساحة',
      rooms: 'الغرف',
      bathrooms: 'الحمامات',
      furnished: 'مفروش',
      unfurnished: 'غير مفروش',
      forSale: 'للبيع',
      forRent: 'للإيجار',
      errorLoadingData: 'خطأ في تحميل البيانات',
      networkError: 'خطأ في الاتصال',
      noInternetConnection: 'لا يوجد اتصال بالإنترنت',
    },
    english: {
      title: 'Dashboard',
      search: 'Search Messages',
      searchPlaceholder: 'Search for properties...',
      allProperties: 'All Properties',
      apartment: 'Apartment',
      villa: 'Villa',
      land: 'Land',
      office: 'Office',
      warehouse: 'Warehouse',
      shop: 'Shop',
      noResults: 'No results found',
      loadingMore: 'Loading more...',
      refresh: 'Refresh',
      settings: 'Settings',
      logout: 'Logout',
      upload: 'Upload Data',
      propertyDetails: 'Property Details',
      viewDetails: 'View Details',
      totalProperties: 'Total Properties',
      searchResults: 'Search Results',
      clearSearch: 'Clear Search',
      filterBy: 'Filter By',
      sortBy: 'Sort By',
      latest: 'Latest',
      oldest: 'Oldest',
      priceHigh: 'Price (High)',
      priceLow: 'Price (Low)',
      location: 'Location',
      price: 'Price',
      area: 'Area',
      rooms: 'Rooms',
      bathrooms: 'Bathrooms',
      furnished: 'Furnished',
      unfurnished: 'Unfurnished',
      forSale: 'For Sale',
      forRent: 'For Rent',
      errorLoadingData: 'Error loading data',
      networkError: 'Network error',
      noInternetConnection: 'No internet connection',
    }
  };

  const t = texts[language];

  // Set RTL for Arabic
  useEffect(() => {
    I18nManager.allowRTL(isArabic);
    I18nManager.forceRTL(isArabic);
  }, [isArabic]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMessages(),
        loadStats(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showError(t.errorLoadingData);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (page = 1, append = false) => {
    try {
      const response = await getAllMessages(page, 20);
      
      if (response.success) {
        const newMessages = response.data || [];
        
        if (append) {
          setMessages(prev => [...prev, ...newMessages]);
        } else {
          setMessages(newMessages);
        }
        
        setHasMore(newMessages.length === 20);
        setCurrentPage(page);
      } else {
        showError(response.message || t.errorLoadingData);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      showError(t.networkError);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getPropertyTypeStats();
      if (response.success) {
        setStats(response.data || []);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchMode(false);
      setSearchResults([]);
      return;
    }

    try {
      setSearchMode(true);
      
      const response = await searchMessages(query, {
        type: selectedFilter !== 'all' ? selectedFilter : undefined
      });
      
      if (response.success) {
        setSearchResults(response.data || []);
      } else {
        showError(response.message || t.errorLoadingData);
      }
    } catch (error) {
      console.error('Error searching:', error);
      showError(t.networkError);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    
    const nextPage = currentPage + 1;
    await loadMessages(nextPage, true);
  };

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل تريد تسجيل الخروج من التطبيق؟',
      [
        { text: 'لا', style: 'cancel' },
        { text: 'نعم', onPress: onLogout }
      ]
    );
  };

  const showError = (message) => {
    Toast.show({
      type: 'error',
      text1: t.errorLoadingData,
      text2: message,
      rtl: isArabic
    });
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchMode(false);
    setSearchResults([]);
  };

  const getVirtualPropertyImage = (propertyType, messageId) => {
    const imageCategories = {
      apartment: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop&auto=format',
      ],
      villa: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400&h=250&fit=crop&auto=format',
      ],
      land: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1566467712871-f3d5aba3f6c7?w=400&h=250&fit=crop&auto=format',
      ],
      office: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop&auto=format',
      ],
    };

    const images = imageCategories[propertyType] || imageCategories.apartment;
    const imageIndex = Math.abs(messageId || 0) % images.length;
    return images[imageIndex];
  };

  const renderPropertyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => navigation.navigate('PropertyDetail', { property: item })}
    >
      <FastImage
        source={{ uri: getVirtualPropertyImage(item.property_type, item.id) }}
        style={styles.propertyImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.imageOverlay}
      />
      
      <View style={styles.propertyInfo}>
        <View style={styles.propertyHeader}>
          <Text style={[styles.propertyTitle, { textAlign: isArabic ? 'right' : 'left' }]} numberOfLines={2}>
            {item.property_name || item.message_text?.substring(0, 50) + '...'}
          </Text>
          
          <View style={[styles.propertyType, { backgroundColor: propertyColors[item.property_type] || propertyColors.default }]}>
            <Text style={styles.propertyTypeText}>
              {t[item.property_type] || item.property_type}
            </Text>
          </View>
        </View>
        
        {item.regions && (
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.locationText, { textAlign: isArabic ? 'right' : 'left' }]} numberOfLines={1}>
              {item.regions}
            </Text>
          </View>
        )}
        
        <View style={styles.propertyFooter}>
          <Text style={[styles.timestamp, { textAlign: isArabic ? 'right' : 'left' }]}>
            {new Date(item.created_time).toLocaleDateString()}
          </Text>
          
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate('PropertyDetail', { property: item })}
          >
            <Text style={styles.viewButtonText}>{t.viewDetails}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = ({ item }) => (
    <View style={styles.statsCard}>
      <LinearGradient
        colors={[propertyColors[item.type] || propertyColors.default, `${propertyColors[item.type] || propertyColors.default}80`]}
        style={styles.statsGradient}
      >
        <Icon name="home" size={24} color={theme.colors.text} />
        <Text style={styles.statsCount}>{item.count}</Text>
        <Text style={styles.statsLabel}>{t[item.type] || item.type}</Text>
      </LinearGradient>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={theme.colors.gradient.primary}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { textAlign: isArabic ? 'right' : 'left' }]}>
              {t.title}
            </Text>
            
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate('Upload')}
              >
                <Icon name="upload" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Icon name="settings" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.headerButton}
                onPress={onLanguageSwitch}
              >
                <Icon name="language" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleLogout}
              >
                <Icon name="logout" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { textAlign: isArabic ? 'right' : 'left' }]}
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text);
                handleSearch(text);
              }}
              placeholder={t.searchPlaceholder}
              placeholderTextColor={theme.colors.textSecondary}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Icon name="clear" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={theme.colors.gradient.background}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t.loadingMore}</Text>
        </LinearGradient>
      </View>
    );
  }

  const dataToShow = searchMode ? searchResults : messages;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradient.background}
        style={styles.gradient}
      >
        {renderHeader()}
        
        {/* Stats Section */}
        {!searchMode && stats.length > 0 && (
          <View style={styles.statsSection}>
            <FlatList
              data={stats}
              renderItem={renderStatsCard}
              keyExtractor={(item) => item.type}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsContainer}
            />
          </View>
        )}
        
        {/* Properties List */}
        <FlatList
          data={dataToShow}
          renderItem={renderPropertyCard}
          keyExtractor={(item) => item.id?.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={!searchMode ? handleLoadMore : undefined}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore && !searchMode ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingText}>{t.loadingMore}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="search-off" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>{t.noResults}</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    marginTop: theme.spacing.md,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerGradient: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  headerContent: {
    marginTop: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.glassLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glassLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: theme.layout.inputHeight,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.sm,
  },
  statsSection: {
    marginVertical: theme.spacing.md,
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  statsCard: {
    width: 100,
    height: 80,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  statsGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  statsCount: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  statsLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  propertyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  propertyImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 120,
  },
  propertyInfo: {
    padding: theme.spacing.md,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  propertyTitle: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  propertyType: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  propertyTypeText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  viewButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  viewButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: '500',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});

export default DashboardScreen;
