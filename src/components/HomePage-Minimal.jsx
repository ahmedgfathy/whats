import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  EyeIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const navigate = useNavigate();
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for testing
  const mockProperties = [
    {
      id: 1,
      property_type: 'Villa',
      location: 'Sheikh Zayed',
      message: 'Beautiful villa for sale',
      price: '4.5M EGP',
      timestamp: '2025-01-11'
    },
    {
      id: 2,
      property_type: 'Apartment',
      location: 'New Cairo',
      message: 'Modern apartment with great view',
      price: '2.8M EGP',
      timestamp: '2025-01-11'
    }
  ];

  useEffect(() => {
    console.log('HomePage loading...');
    try {
      // Simulate loading
      setTimeout(() => {
        setDisplayedMessages(mockProperties);
        setLoading(false);
        console.log('HomePage loaded successfully');
      }, 1000);
    } catch (err) {
      console.error('Error in HomePage:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Simple property type label function
  const getPropertyTypeLabel = (type) => {
    return type || 'Property';
  };

  // Simple property type color function
  const getPropertyTypeColorClass = (type) => {
    return 'bg-blue-500 text-white border-blue-600';
  };

  // Simple virtual image function
  const getVirtualPropertyImage = (type, id) => {
    return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop&auto=format';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Contaboo Real Estate</h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Find Your Perfect Property
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Browse thousands of properties from our database
          </p>
        </div>
      </div>

      {/* Properties Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-gray-800 mb-8">Available Properties</h3>
        
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedMessages.map((property) => (
              <motion.div 
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Property Image */}
                <div className="relative h-48">
                  <img 
                    src={getVirtualPropertyImage(property.property_type, property.id)}
                    alt={property.property_type}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPropertyTypeColorClass(property.property_type)}`}>
                      {getPropertyTypeLabel(property.property_type)}
                    </span>
                  </div>
                </div>

                {/* Property Content */}
                <div className="p-6">
                  <h4 className="font-bold text-gray-800 text-lg mb-2">
                    {property.property_type} - {property.location}
                  </h4>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {property.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {property.timestamp}
                    </div>
                    {property.price && (
                      <div className="text-green-600 font-bold">
                        {property.price}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
