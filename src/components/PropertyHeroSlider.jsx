import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const PropertyHeroSlider = ({ language = 'arabic', isBackground = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Featured properties with beautiful images
  const featuredProperties = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=600&fit=crop&auto=format',
      title: language === 'arabic' ? 'فيلا فاخرة في الشيخ زايد' : 'Luxury Villa in Sheikh Zayed',
      location: language === 'arabic' ? 'الشيخ زايد، الجيزة' : 'Sheikh Zayed, Giza',
      price: language === 'arabic' ? '4.5 مليون جنيه' : '4.5M EGP',
      type: 'villa',
      area: '300م²'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=600&fit=crop&auto=format',
      title: language === 'arabic' ? 'شقة مودرن في التجمع الخامس' : 'Modern Apartment in New Cairo',
      location: language === 'arabic' ? 'التجمع الخامس، القاهرة الجديدة' : 'Fifth Settlement, New Cairo',
      price: language === 'arabic' ? '2.8 مليون جنيه' : '2.8M EGP',
      type: 'apartment',
      area: '180م²'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=600&fit=crop&auto=format',
      title: language === 'arabic' ? 'قصر فخم في الزمالك' : 'Luxury Palace in Zamalek',
      location: language === 'arabic' ? 'الزمالك، القاهرة' : 'Zamalek, Cairo',
      price: language === 'arabic' ? '12 مليون جنيه' : '12M EGP',
      type: 'villa',
      area: '600م²'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=600&fit=crop&auto=format',
      title: language === 'arabic' ? 'بنتهاوس في مدينة نصر' : 'Penthouse in Nasr City',
      location: language === 'arabic' ? 'مدينة نصر، القاهرة' : 'Nasr City, Cairo',
      price: language === 'arabic' ? '6.2 مليون جنيه' : '6.2M EGP',
      type: 'apartment',
      area: '250م²'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=600&fit=crop&auto=format',
      title: language === 'arabic' ? 'فيلا على البحر في الساحل' : 'Beachfront Villa in North Coast',
      location: language === 'arabic' ? 'الساحل الشمالي' : 'North Coast',
      price: language === 'arabic' ? '8.5 مليون جنيه' : '8.5M EGP',
      type: 'villa',
      area: '400م²'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1200&h=600&fit=crop&auto=format',
      title: language === 'arabic' ? 'دوبلكس في المعادي' : 'Duplex in Maadi',
      location: language === 'arabic' ? 'المعادي، القاهرة' : 'Maadi, Cairo',
      price: language === 'arabic' ? '5.1 مليون جنيه' : '5.1M EGP',
      type: 'apartment',
      area: '280م²'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProperties.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredProperties.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + featuredProperties.length) % featuredProperties.length);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % featuredProperties.length);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const getPropertyTypeColor = (type) => {
    const colors = {
      apartment: 'from-blue-500 to-cyan-500',
      villa: 'from-green-500 to-emerald-500',
      land: 'from-orange-500 to-red-500',
      office: 'from-indigo-500 to-purple-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  const getPropertyTypeLabel = (type) => {
    const labels = {
      apartment: language === 'arabic' ? 'شقة' : 'Apartment',
      villa: language === 'arabic' ? 'فيلا' : 'Villa',
      land: language === 'arabic' ? 'أرض' : 'Land',
      office: language === 'arabic' ? 'مكتب' : 'Office'
    };
    return labels[type] || (language === 'arabic' ? 'عقار' : 'Property');
  };

  return (
    <div 
      className={`relative w-full overflow-hidden ${
        isBackground 
          ? 'h-full' 
          : 'h-96 md:h-[500px] rounded-2xl shadow-2xl'
      } bg-gray-800`} 
      dir={language === 'arabic' ? 'rtl' : 'ltr'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${featuredProperties[currentSlide].image})`
            }}
          >
            {/* Gradient Overlay - Different for background mode */}
            {isBackground ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
              </>
            )}
          </div>

          {/* Content - Only show in regular mode, not background mode */}
          {!isBackground && (
            <div className="absolute inset-0 flex items-end">
              <div className="w-full p-6 md:p-8 lg:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-2xl"
                >
                  {/* Property Type Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-4"
                  >
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${getPropertyTypeColor(featuredProperties[currentSlide].type)} text-white shadow-lg`}>
                      {getPropertyTypeLabel(featuredProperties[currentSlide].type)}
                      <span className="mx-2">•</span>
                      {featuredProperties[currentSlide].area}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                  >
                    {featuredProperties[currentSlide].title}
                  </motion.h2>

                  {/* Location */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex items-center gap-2 text-gray-200 mb-4 text-lg"
                  >
                    <MapPinIcon className="w-5 h-5 text-red-400" />
                    <span>{featuredProperties[currentSlide].location}</span>
                  </motion.div>

                  {/* Price */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex items-center gap-2 mb-6"
                  >
                    <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                    <span className="text-2xl md:text-3xl font-bold text-green-400">
                      {featuredProperties[currentSlide].price}
                    </span>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {language === 'arabic' ? 'عرض التفاصيل' : 'View Details'}
                  </motion.button>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Hide in background mode */}
      {!isBackground && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute top-1/2 -translate-y-1/2 ${language === 'arabic' ? 'right-4' : 'left-4'} p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110`}
          >
            {language === 'arabic' ? (
              <ChevronRightIcon className="w-6 h-6" />
            ) : (
              <ChevronLeftIcon className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={goToNext}
            className={`absolute top-1/2 -translate-y-1/2 ${language === 'arabic' ? 'left-4' : 'right-4'} p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110`}
          >
            {language === 'arabic' ? (
              <ChevronLeftIcon className="w-6 h-6" />
            ) : (
              <ChevronRightIcon className="w-6 h-6" />
            )}
          </button>
        </>
      )}

      {/* Dot Indicators - Position differently for background mode */}
      <div className={`absolute ${isBackground ? 'bottom-8 right-8' : 'bottom-4 left-1/2 -translate-x-1/2'} flex items-center gap-2`}>
        {featuredProperties.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125 shadow-lg' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Auto-play indicator - Position differently for background mode */}
      <div className={`absolute ${isBackground ? 'top-8 right-8' : 'top-4 right-4'} flex items-center gap-2 text-white/70 text-sm`}>
        <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="hidden md:inline">
          {isAutoPlaying 
            ? (language === 'arabic' ? 'تشغيل تلقائي' : 'Auto-play') 
            : (language === 'arabic' ? 'متوقف' : 'Paused')
          }
        </span>
      </div>
    </div>
  );
};

export default PropertyHeroSlider;
