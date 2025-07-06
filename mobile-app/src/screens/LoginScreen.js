import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  I18nManager,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';
import { loginUser } from '../services/apiService';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ onLogin, onLanguageSwitch, language }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Set RTL for Arabic
  useEffect(() => {
    I18nManager.allowRTL(language === 'arabic');
    I18nManager.forceRTL(language === 'arabic');
  }, [language]);

  const isArabic = language === 'arabic';

  const texts = {
    arabic: {
      title: 'بحث الدردشة العقارية',
      subtitle: 'تسجيل الدخول إلى حسابك',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      login: 'تسجيل الدخول',
      forgotPassword: 'نسيت كلمة المرور؟',
      switchLanguage: 'English',
      loginError: 'خطأ في تسجيل الدخول',
      invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      networkError: 'خطأ في الاتصال بالخادم',
      requiredField: 'هذا الحقل مطلوب',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      welcome: 'مرحباً بك'
    },
    english: {
      title: 'Real Estate Chat Search',
      subtitle: 'Sign in to your account',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      forgotPassword: 'Forgot Password?',
      switchLanguage: 'العربية',
      loginError: 'Login Error',
      invalidCredentials: 'Invalid username or password',
      networkError: 'Network connection error',
      requiredField: 'This field is required',
      loginSuccess: 'Login successful',
      welcome: 'Welcome'
    }
  };

  const t = texts[language];

  const validateForm = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = t.requiredField;
    }
    
    if (!password.trim()) {
      newErrors.password = t.requiredField;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const result = await loginUser(username.trim(), password);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: t.loginSuccess,
          text2: `${t.welcome} ${result.user?.name || username}`,
          rtl: isArabic
        });
        
        // Call the onLogin callback passed from App.js
        onLogin();
      } else {
        setErrors({
          general: result.message || t.invalidCredentials
        });
        
        Toast.show({
          type: 'error',
          text1: t.loginError,
          text2: result.message || t.invalidCredentials,
          rtl: isArabic
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || t.networkError;
      
      setErrors({
        general: errorMessage
      });
      
      Toast.show({
        type: 'error',
        text1: t.loginError,
        text2: errorMessage,
        rtl: isArabic
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'نسيت كلمة المرور',
      'للحصول على كلمة مرور جديدة، يرجى التواصل مع المسؤول',
      [{ text: 'موافق', style: 'default' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={theme.colors.gradient.background}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={onLanguageSwitch}
            >
              <Icon name="language" size={20} color={theme.colors.text} />
              <Text style={[styles.languageText, { textAlign: isArabic ? 'right' : 'left' }]}>
                {t.switchLanguage}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logo and Title */}
          <View style={styles.titleContainer}>
            <LinearGradient
              colors={theme.colors.gradient.primary}
              style={styles.logoContainer}
            >
              <Icon name="home" size={40} color={theme.colors.text} />
            </LinearGradient>
            
            <Text style={[styles.title, { textAlign: isArabic ? 'right' : 'left' }]}>
              {t.title}
            </Text>
            <Text style={[styles.subtitle, { textAlign: isArabic ? 'right' : 'left' }]}>
              {t.subtitle}
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>
                {t.username}
              </Text>
              <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
                <Icon name="person" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.input, { textAlign: isArabic ? 'right' : 'left' }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder={t.username}
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.username && (
                <Text style={[styles.errorText, { textAlign: isArabic ? 'right' : 'left' }]}>
                  {errors.username}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>
                {t.password}
              </Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <Icon name="lock" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.input, { textAlign: isArabic ? 'right' : 'left' }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t.password}
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Icon
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { textAlign: isArabic ? 'right' : 'left' }]}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* General Error */}
            {errors.general && (
              <Text style={[styles.errorText, styles.generalError, { textAlign: isArabic ? 'right' : 'left' }]}>
                {errors.general}
              </Text>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={theme.colors.gradient.primary}
                style={styles.loginGradient}
              >
                {loading ? (
                  <Icon name="refresh" size={20} color={theme.colors.text} />
                ) : (
                  <Text style={styles.loginButtonText}>{t.login}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { textAlign: isArabic ? 'right' : 'left' }]}>
                {t.forgotPassword}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Default Credentials Note */}
          <View style={styles.credentialsNote}>
            <Text style={[styles.credentialsText, { textAlign: isArabic ? 'right' : 'left' }]}>
              {isArabic ? 'بيانات الدخول الافتراضية:' : 'Default credentials:'}
            </Text>
            <Text style={[styles.credentialsText, { textAlign: isArabic ? 'right' : 'left' }]}>
              xinreal / zerocall
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.glass,
  },
  languageText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  formContainer: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: theme.layout.inputHeight,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  eyeButton: {
    padding: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  generalError: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  loginButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginGradient: {
    height: theme.layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
  },
  credentialsNote: {
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.glassLight,
    borderRadius: theme.borderRadius.md,
  },
  credentialsText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.xs,
    marginBottom: theme.spacing.xs,
  },
});

export default LoginScreen;
