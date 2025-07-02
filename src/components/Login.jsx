import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingOffice2Icon, 
  EyeIcon, 
  EyeSlashIcon, 
  SparklesIcon,
  HomeModernIcon,
  MapPinIcon,
  UserIcon,
  LockClosedIcon,
  ChevronRightIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { authenticateUser } from '../services/apiService';

const Login = ({ onLogin, onLanguageSwitch }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isAuthenticated = await authenticateUser(credentials.username, credentials.password);
      if (isAuthenticated) {
        onLogin();
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const floatingIcons = [
    { Icon: HomeModernIcon, delay: 0, position: "top-20 left-20" },
    { Icon: BuildingOffice2Icon, delay: 0.5, position: "top-32 right-32" },
    { Icon: MapPinIcon, delay: 1, position: "bottom-32 left-32" },
    { Icon: SparklesIcon, delay: 1.5, position: "bottom-20 right-20" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-slate-900"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <motion.button
          onClick={onLanguageSwitch}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative overflow-hidden flex items-center px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white glass-light rounded-xl border border-white/20 transition-all duration-300 shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <LanguageIcon className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
          <span className="relative">English</span>
        </motion.button>
      </div>

      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, delay, position }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} text-white/10`}
          initial={{ opacity: 0, y: 100 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            rotate: [0, 10, -10, 0],
          }}
          transition={{ 
            delay,
            duration: 2,
            rotate: {
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut"
            }
          }}
        >
          <Icon className="h-16 w-16" />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Logo and Title */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <motion.div 
              className="inline-flex items-center justify-center mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur-xl opacity-75"></div>
                <div className="relative p-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl">
                  <BuildingOffice2Icon className="h-12 w-12 text-white" />
                </div>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold mb-3 gradient-text"
              variants={itemVariants}
            >
              منصة العقارات الذكية
            </motion.h1>
            
            <motion.p 
              className="text-gray-300 text-lg flex items-center justify-center gap-2"
              variants={itemVariants}
            >
              <SparklesIcon className="h-5 w-5 text-purple-400" />
              أدخل بياناتك للوصول إلى النظام
            </motion.p>
          </motion.div>

          {/* Login Form */}
          <motion.div 
            variants={itemVariants}
            className="glass-light rounded-3xl p-8 shadow-2xl border border-white/20"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-purple-400" />
                  اسم المستخدم
                </label>
                <div className="relative group">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 text-lg font-medium backdrop-blur-xl"
                    placeholder="xinreal"
                    value={credentials.username}
                    onChange={handleChange}
                    dir="ltr"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <LockClosedIcon className="h-4 w-4 text-purple-400" />
                  كلمة المرور
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 text-lg font-medium backdrop-blur-xl pr-12"
                    placeholder="zerocall"
                    value={credentials.password}
                    onChange={handleChange}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-center backdrop-blur-xl"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                variants={itemVariants}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {loading ? (
                  <div className="relative flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جارٍ تسجيل الدخول...
                  </div>
                ) : (
                  <div className="relative flex items-center gap-3">
                    <span>دخول إلى النظام</span>
                    <ChevronRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                )}
              </motion.button>
            </form>

            {/* Demo Credentials */}
            <motion.div 
              variants={itemVariants}
              className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl"
            >
              <p className="text-xs text-gray-300 text-center mb-2 font-semibold">بيانات تجريبية:</p>
              <div className="text-xs text-gray-400 text-center space-y-1">
                <p>المستخدم: <span className="text-purple-300 font-mono">xinreal</span></p>
                <p>كلمة المرور: <span className="text-purple-300 font-mono">zerocall</span></p>
              </div>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            variants={itemVariants}
            className="text-center mt-8"
          >
            <p className="text-gray-400 text-sm">
              © 2025 منصة العقارات الذكية - جميع الحقوق محفوظة
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
