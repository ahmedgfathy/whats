import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  LockClosedIcon, 
  ChevronRightIcon,
  HomeModernIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { authenticateUser } from '../services/apiService';

const LoginEnglish = ({ onLogin, onLanguageSwitch }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isAuthenticated = await authenticateUser(credentials.username, credentials.password);
      if (isAuthenticated) {
        onLogin();
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Server connection error. Please try again.');
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
    { Icon: MapPinIcon, delay: 0.5, position: "top-32 right-32" },
    { Icon: BuildingOffice2Icon, delay: 1, position: "bottom-32 left-16" },
    { Icon: SparklesIcon, delay: 1.5, position: "bottom-20 right-20" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden font-roboto lang-english" dir="ltr" lang="en">
      {/* Animated Background Icons */}
      {floatingIcons.map(({ Icon, delay, position }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} opacity-10`}
          initial={{ scale: 0, rotate: 0 }}
          animate={{ 
            scale: [0, 1, 0.8, 1], 
            rotate: [0, 180, 360],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 4,
            delay: delay,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          <Icon className="h-16 w-16 text-purple-500" />
        </motion.div>
      ))}

      {/* Language Switcher - Top Right */}
      <motion.button
        onClick={onLanguageSwitch}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 right-6 flex items-center px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white glass-light rounded-xl border border-white/20 transition-all duration-300 shadow-lg z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <LanguageIcon className="h-4 w-4 mr-2" />
        <span>العربية</span>
      </motion.button>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo and Title */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl mb-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <BuildingOffice2Icon className="h-10 w-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold gradient-text mb-3">
            Contaboo
          </h1>
          <p className="text-gray-300 text-lg font-medium">
            Smart Real Estate Platform
          </p>
          <div className="flex items-center justify-center space-x-2 mt-3">
            <SparklesIcon className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-400">AI-Powered Property Search</span>
            <SparklesIcon className="h-4 w-4 text-purple-400" />
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          variants={itemVariants}
          className="glass-light rounded-3xl p-8 border border-white/20 shadow-2xl backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-purple-400" />
                Username
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
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <LockClosedIcon className="h-4 w-4 text-purple-400" />
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 text-lg font-medium backdrop-blur-xl"
                  placeholder="zerocall"
                  value={credentials.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-xl"
              >
                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
              </motion.div>
            )}

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading || !credentials.username || !credentials.password}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {loading ? (
                <div className="relative flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="relative flex items-center justify-center gap-3">
                  <span>Login to System</span>
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
            <p className="text-xs text-gray-300 text-center mb-2 font-semibold">Demo Credentials:</p>
            <div className="text-xs text-gray-400 text-center space-y-1">
              <p>Username: <span className="text-purple-300 font-mono">xinreal</span></p>
              <p>Password: <span className="text-purple-300 font-mono">zerocall</span></p>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          variants={itemVariants}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          <div className="glass-light rounded-2xl p-4 border border-white/10 text-center backdrop-blur-xl">
            <HomeModernIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-gray-300 font-medium">Smart Property Detection</p>
          </div>
          <div className="glass-light rounded-2xl p-4 border border-white/10 text-center backdrop-blur-xl">
            <SparklesIcon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-gray-300 font-medium">AI Chat Analysis</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500">
            Secure • Modern • Arabic Language Support
          </p>
        </motion.div>
      </motion.div>

      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
  );
};

export default LoginEnglish;
