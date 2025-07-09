import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  I18nManager,
  Alert,
  Share,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import { theme, propertyColors } from '../theme/theme';
import { getPropertyDetails, updateProperty, deleteProperty } from '../services/apiService';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const PropertyDetailScreen = ({ route, navigation }) => {
  const { property: initialProperty } = route.params;
  const [property, setProperty] = useState(initialProperty);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('arabic'); // Get from global state/context

  const isArabic = language === 'arabic';

  const texts = {
    arabic: {
      propertyDetails: 'تفاصيل العقار',
      propertyInfo: 'معلومات العقار',
      location: 'الموقع',
      price: 'السعر',
      area: 'المساحة',
      rooms: 'الغرف',
      bathrooms: 'الحمامات',
      furnished: 'مفروش',
      unfurnished: 'غير مفروش',
      forSale: 'للبيع',
      forRent: 'للإيجار',
      description: 'الوصف',
      contactInfo: 'معلومات الاتصال',
      share: 'مشاركة',
      edit: 'تعديل',
      delete: 'حذف',
      call: 'اتصال',
      message: 'رسالة',
      whatsapp: 'واتساب',
      createdAt: 'تاريخ الإنشاء',
      updatedAt: 'تاريخ التحديث',
      propertyType: 'نوع العقار',
      apartment: 'شقة',
      villa: 'فيلا',
      land: 'أرض',
      office: 'مكتب',
      warehouse: 'مخزن',
      shop: 'محل',
      back: 'رجوع',
      noDescription: 'لا يوجد وصف متاح',
      noLocation: 'لا يوجد موقع محدد',
      noPrice: 'السعر غير محدد',
      noArea: 'المساحة غير محددة',
      confirm: 'تأكيد',
      cancel: 'إلغاء',
      deleteConfirm: 'هل تريد حذف هذا العقار؟',
      deleteSuccess: 'تم حذف العقار بنجاح',
      shareText: 'شاهد هذا العقار',
      errorLoadingProperty: 'خطأ في تحميل تفاصيل العقار',
      errorDeletingProperty: 'خطأ في حذف العقار',
      networkError: 'خطأ في الاتصال',
    },
    english: {
      propertyDetails: 'Property Details',
      propertyInfo: 'Property Information',
      location: 'Location',
      price: 'Price',
      area: 'Area',
      rooms: 'Rooms',
      bathrooms: 'Bathrooms',
      furnished: 'Furnished',
      unfurnished: 'Unfurnished',
      forSale: 'For Sale',
      forRent: 'For Rent',
      description: 'Description',
      contactInfo: 'Contact Information',
      share: 'Share',
      edit: 'Edit',
      delete: 'Delete',
      call: 'Call',
      message: 'Message',
      whatsapp: 'WhatsApp',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      propertyType: 'Property Type',
      apartment: 'Apartment',
      villa: 'Villa',
      land: 'Land',
      office: 'Office',
      warehouse: 'Warehouse',
      shop: 'Shop',
      back: 'Back',
      noDescription: 'No description available',
      noLocation: 'No location specified',
      noPrice: 'Price not specified',
      noArea: 'Area not specified',
      confirm: 'Confirm',
      cancel: 'Cancel',
      deleteConfirm: 'Are you sure you want to delete this property?',
      deleteSuccess: 'Property deleted successfully',
      shareText: 'Check out this property',
      errorLoadingProperty: 'Error loading property details',
      errorDeletingProperty: 'Error deleting property',
      networkError: 'Network error',
    }
  };

  const t = texts[language];

  useEffect(() => {
    I18nManager.allowRTL(isArabic);
    I18nManager.forceRTL(isArabic);
    loadPropertyDetails();
  }, [isArabic]);

  const loadPropertyDetails = async () => {
    if (!property.id) return;
    
    try {
      setLoading(true);
      const response = await getPropertyDetails(property.id);
      
      if (response.success) {
        setProperty(response.data);
      } else {
        showError(response.message || t.errorLoadingProperty);
      }
    } catch (error) {
      console.error('Error loading property details:', error);
      showError(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t.deleteConfirm,
      '',
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, onPress: confirmDelete, style: 'destructive' }
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await deleteProperty(property.id);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: t.deleteSuccess,
          rtl: isArabic
        });
        navigation.goBack();
      } else {
        showError(response.message || t.errorDeletingProperty);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      showError(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `${t.shareText}\n\n${property.property_name || ''}\n${property.regions || ''}\n${property.message_text || ''}`,
        url: '', // Add your app URL if available
        title: property.property_name || t.propertyDetails,
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleWhatsApp = (phoneNumber) => {
    if (phoneNumber) {
      const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(t.shareText)}`;
      Linking.openURL(url).catch(() => {
        Toast.show({
          type: 'error',
          text1: 'WhatsApp not installed',
          rtl: isArabic
        });
      });
    }
  };

  const showError = (message) => {
    Toast.show({
      type: 'error',
      text1: t.errorLoadingProperty,
      text2: message,
      rtl: isArabic
    });
  };

  const getVirtualPropertyImage = (propertyType, messageId) => {
    const imageCategories = {
      apartment: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&auto=format',
      ],
      villa: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400&h=300&fit=crop&auto=format',
      ],
      land: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1566467712871-f3d5aba3f6c7?w=400&h=300&fit=crop&auto=format',
      ],
      office: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format',
      ],
    };

    const images = imageCategories[propertyType] || imageCategories.apartment;
    const imageIndex = Math.abs(messageId || 0) % images.length;
    return images[imageIndex];
  };

  const renderInfoItem = (label, value, icon) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Icon name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { textAlign: isArabic ? 'right' : 'left' }]}>
          {label}
        </Text>
        <Text style={[styles.infoValue, { textAlign: isArabic ? 'right' : 'left' }]}>
          {value || (isArabic ? 'غير محدد' : 'Not specified')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradient.background}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={theme.colors.gradient.primary}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon
                  name={isArabic ? 'arrow-forward' : 'arrow-back'}
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              
              <Text style={[styles.headerTitle, { textAlign: isArabic ? 'right' : 'left' }]}>
                {t.propertyDetails}
              </Text>
              
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShare}
                >
                  <Icon name="share" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleDelete}
                >
                  <Icon name="delete" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Property Image */}
          <View style={styles.imageContainer}>
            <FastImage
              source={{ uri: getVirtualPropertyImage(property.property_type, property.id) }}
              style={styles.propertyImage}
              resizeMode={FastImage.resizeMode.cover}
            />
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)']}
              style={styles.imageOverlay}
            />
            
            <View style={styles.imageInfo}>
              <View style={[styles.propertyTypeTag, { backgroundColor: propertyColors[property.property_type] || propertyColors.default }]}>
                <Text style={styles.propertyTypeText}>
                  {t[property.property_type] || property.property_type}
                </Text>
              </View>
            </View>
          </View>

          {/* Property Information */}
          <View style={styles.contentContainer}>
            {/* Title */}
            <Text style={[styles.propertyTitle, { textAlign: isArabic ? 'right' : 'left' }]}>
              {property.property_name || property.message_text?.substring(0, 100) + '...'}
            </Text>

            {/* Basic Info */}
            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, { textAlign: isArabic ? 'right' : 'left' }]}>
                {t.propertyInfo}
              </Text>
              
              {renderInfoItem(t.location, property.regions, 'location-on')}
              {renderInfoItem(t.price, property.price, 'attach-money')}
              {renderInfoItem(t.area, property.area, 'square-foot')}
              {renderInfoItem(t.rooms, property.rooms, 'bed')}
              {renderInfoItem(t.bathrooms, property.bathrooms, 'bathtub')}
              {renderInfoItem(t.createdAt, property.created_time ? new Date(property.created_time).toLocaleDateString() : '', 'schedule')}
            </View>

            {/* Description */}
            {property.message_text && (
              <View style={styles.infoSection}>
                <Text style={[styles.sectionTitle, { textAlign: isArabic ? 'right' : 'left' }]}>
                  {t.description}
                </Text>
                <Text style={[styles.descriptionText, { textAlign: isArabic ? 'right' : 'left' }]}>
                  {property.message_text}
                </Text>
              </View>
            )}

            {/* Contact Actions */}
            <View style={styles.contactSection}>
              <Text style={[styles.sectionTitle, { textAlign: isArabic ? 'right' : 'left' }]}>
                {t.contactInfo}
              </Text>
              
              <View style={styles.contactButtons}>
                <TouchableOpacity
                  style={[styles.contactButton, { backgroundColor: theme.colors.success }]}
                  onPress={() => handleCall(property.phone_number)}
                >
                  <Icon name="call" size={20} color={theme.colors.text} />
                  <Text style={styles.contactButtonText}>{t.call}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => handleWhatsApp(property.phone_number)}
                >
                  <Icon name="chat" size={20} color={theme.colors.text} />
                  <Text style={styles.contactButtonText}>{t.whatsapp}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerGradient: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.glassLight,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.glassLight,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 200,
  },
  imageInfo: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  propertyTypeTag: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  propertyTypeText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    marginTop: -theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  propertyTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  infoSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontWeight: '500',
    marginTop: theme.spacing.xs,
  },
  descriptionText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  contactSection: {
    marginBottom: theme.spacing.xl,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
  },
  contactButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
});

export default PropertyDetailScreen;
