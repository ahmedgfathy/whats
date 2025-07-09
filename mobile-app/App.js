import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  Platform,
  Alert,
  BackHandler,
  AppState,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PropertyDetailScreen from './src/screens/PropertyDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import UploadScreen from './src/screens/UploadScreen';

// Import services
import { validateSession, logoutUser } from './src/services/apiService';
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('arabic');
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);

  // Session management constants
  const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

  useEffect(() => {
    initializeApp();
    
    // Set up session monitoring
    const sessionInterval = setInterval(checkSessionExpiry, 60000); // Check every minute
    
    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        if (isAuthenticated) {
          validateSessionStatus();
        }
      }
      setAppState(nextAppState);
    };

    const appStateListener = AppState.addEventListener('change', handleAppStateChange);

    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      clearInterval(sessionInterval);
      appStateListener?.remove();
      backHandler.remove();
    };
  }, [isAuthenticated, sessionExpiry]);

  const initializeApp = async () => {
    try {
      // Hide splash screen
      if (Platform.OS === 'android') {
        SplashScreen.hide();
      }

      // Check saved language preference
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }

      // Check authentication status
      await checkAuthentication();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthentication = async () => {
    try {
      const authStatus = await AsyncStorage.getItem('isAuthenticated');
      const sessionTime = await AsyncStorage.getItem('sessionTime');
      
      if (authStatus === 'true' && sessionTime) {
        const loginTime = parseInt(sessionTime);
        const currentTime = Date.now();
        const timeDiff = currentTime - loginTime;
        
        if (timeDiff < SESSION_DURATION) {
          // Validate session with server
          const isValid = await validateSession();
          if (isValid) {
            setIsAuthenticated(true);
            setSessionExpiry(loginTime + SESSION_DURATION);
          } else {
            await handleLogout();
          }
        } else {
          // Session expired
          await handleLogout();
          showAlert('انتهت جلسة العمل', 'يرجى تسجيل الدخول مرة أخرى.');
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  };

  const validateSessionStatus = async () => {
    try {
      const isValid = await validateSession();
      if (!isValid) {
        await handleLogout();
        showAlert('انتهت جلسة العمل', 'يرجى تسجيل الدخول مرة أخرى.');
      }
    } catch (error) {
      console.error('Error validating session:', error);
    }
  };

  const checkSessionExpiry = () => {
    if (!isAuthenticated || !sessionExpiry) return;
    
    const currentTime = Date.now();
    const timeLeft = sessionExpiry - currentTime;
    
    if (timeLeft <= 0) {
      handleLogout();
      showAlert('انتهت جلسة العمل', 'يرجى تسجيل الدخول مرة أخرى.');
    } else if (timeLeft <= WARNING_TIME && timeLeft > WARNING_TIME - 60000) {
      // Show warning 5 minutes before expiry
      const minutesLeft = Math.ceil(timeLeft / 60000);
      Alert.alert(
        'تنبيه انتهاء الجلسة',
        `ستنتهي جلسة العمل خلال ${minutesLeft} دقائق. هل تريد تمديد الجلسة؟`,
        [
          { text: 'لا', style: 'cancel' },
          { text: 'نعم', onPress: extendSession }
        ]
      );
    }
  };

  const extendSession = async () => {
    try {
      const newSessionTime = Date.now();
      await AsyncStorage.setItem('sessionTime', newSessionTime.toString());
      setSessionExpiry(newSessionTime + SESSION_DURATION);
      
      Toast.show({
        type: 'success',
        text1: 'تم تمديد الجلسة',
        text2: 'تم تمديد جلسة العمل بنجاح',
        rtl: true
      });
    } catch (error) {
      console.error('Error extending session:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const currentTime = Date.now();
      setIsAuthenticated(true);
      setSessionExpiry(currentTime + SESSION_DURATION);
      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem('sessionTime', currentTime.toString());
    } catch (error) {
      console.error('Error handling login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setIsAuthenticated(false);
      setSessionExpiry(null);
      
      // Use the enhanced logout function
      await logoutUser();
      
      // Clear local storage
      await AsyncStorage.multiRemove([
        'isAuthenticated',
        'sessionTime',
        'cachedMessages',
        'lastRefresh'
      ]);
    } catch (error) {
      console.error('Error handling logout:', error);
    }
  };

  const handleLanguageSwitch = async () => {
    try {
      const newLanguage = language === 'arabic' ? 'english' : 'arabic';
      setLanguage(newLanguage);
      await AsyncStorage.setItem('language', newLanguage);
    } catch (error) {
      console.error('Error switching language:', error);
    }
  };

  const handleBackPress = () => {
    if (isAuthenticated) {
      Alert.alert(
        'إغلاق التطبيق',
        'هل تريد إغلاق التطبيق؟',
        [
          { text: 'لا', style: 'cancel' },
          { text: 'نعم', onPress: () => BackHandler.exitApp() }
        ]
      );
      return true;
    }
    return false;
  };

  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'موافق', style: 'default' }]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={theme.colors.gradient.background}
          style={styles.loadingGradient}
        />
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: theme.colors.background }
          }}
        >
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Dashboard">
                {(props) => (
                  <DashboardScreen
                    {...props}
                    onLogout={handleLogout}
                    onLanguageSwitch={handleLanguageSwitch}
                    language={language}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Upload" component={UploadScreen} />
            </>
          ) : (
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLogin={handleLogin}
                  onLanguageSwitch={handleLanguageSwitch}
                  language={language}
                />
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default App;
