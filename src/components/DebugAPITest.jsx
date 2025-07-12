// Debug page to test frontend API connection
import React, { useState, useEffect } from 'react';

const DebugAPITest = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [healthCheck, setHealthCheck] = useState(null);
  const [statsCheck, setStatsCheck] = useState(null);
  const [envCheck, setEnvCheck] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
    setApiUrl(API_BASE_URL);
  }, []);

  const testAPI = async () => {
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
    
    try {
      // Test health endpoint
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      const healthData = await healthResponse.json();
      setHealthCheck({ status: healthResponse.status, data: healthData });
      
      // Test stats endpoint
      const statsResponse = await fetch(`${API_BASE_URL}/stats`);
      const statsData = await statsResponse.json();
      setStatsCheck({ status: statsResponse.status, data: statsData });
      
      // Test environment debug endpoint
      const envResponse = await fetch(`${API_BASE_URL}/debug-env`);
      const envData = await envResponse.json();
      setEnvCheck({ status: envResponse.status, data: envData });
      
    } catch (error) {
      console.error('API Test Error:', error);
      setHealthCheck({ error: error.message });
      setStatsCheck({ error: error.message });
      setEnvCheck({ error: error.message });
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Debug Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Environment Info</h2>
          <p><strong>VITE_API_URL:</strong> {apiUrl}</p>
          <p><strong>Environment Mode:</strong> {import.meta.env.MODE}</p>
          <p><strong>Production:</strong> {import.meta.env.PROD ? 'Yes' : 'No'}</p>
        </div>

        <button 
          onClick={testAPI} 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Endpoints'}
        </button>

        {healthCheck && (
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold">Health Check</h3>
            <pre className="text-sm overflow-auto">{JSON.stringify(healthCheck, null, 2)}</pre>
          </div>
        )}

        {statsCheck && (
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold">Stats Check</h3>
            <pre className="text-sm overflow-auto">{JSON.stringify(statsCheck, null, 2)}</pre>
          </div>
        )}

        {envCheck && (
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold">Environment Check</h3>
            <pre className="text-sm overflow-auto">{JSON.stringify(envCheck, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugAPITest;
