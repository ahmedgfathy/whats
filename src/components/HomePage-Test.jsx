import React, { useState, useEffect } from 'react';

const HomePage = () => {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    console.log('HomePage mounted');
    try {
      // Test basic functionality
      setData('HomePage is working');
    } catch (err) {
      console.error('Error in HomePage:', err);
      setError(err.message);
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error in HomePage:</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: 'lightgray', minHeight: '100vh' }}>
      <h1>HomePage Test</h1>
      <p>Status: {data || 'Loading...'}</p>
      <p>If you see this, HomePage is rendering correctly.</p>
    </div>
  );
};

export default HomePage;
