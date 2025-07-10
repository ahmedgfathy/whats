import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SimpleCSVImport = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.csv') || selectedFile.type === 'text/csv')) {
      setFile(selectedFile);
      setError('');
      setResult(null);
    } else {
      setError('يرجى اختيار ملف CSV فقط');
      setFile(null);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('الملف يجب أن يحتوي على أكثر من سطر واحد');
    }

    // Function to parse CSV line with proper handling of quoted values
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    // Parse headers and clean them up
    const rawHeaders = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
    
    // Clean headers: remove empty ones and handle duplicates
    const headers = [];
    const usedHeaders = new Set();
    
    rawHeaders.forEach((header, index) => {
      let cleanHeader = header || `column_${index + 1}`;
      
      // Handle duplicate headers
      let counter = 1;
      let uniqueHeader = cleanHeader;
      while (usedHeaders.has(uniqueHeader)) {
        uniqueHeader = `${cleanHeader}_${counter}`;
        counter++;
      }
      
      headers.push(uniqueHeader);
      usedHeaders.add(uniqueHeader);
    });
    
    console.log('Original headers:', rawHeaders);
    console.log('Cleaned headers:', headers);
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/"/g, ''));
      
      // Only process rows that have data
      if (values.some(v => v.length > 0)) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return { headers, data };
  };

  const handleImport = async () => {
    if (!file) {
      setError('يرجى اختيار ملف أولاً');
      return;
    }

    setImporting(true);
    setError('');

    try {
      // Read file
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
      });

      // Parse CSV
      const { headers, data } = parseCSV(text);
      
      console.log('Parsed CSV:', { headers, dataCount: data.length });

      // Get API URL from environment or use relative path in production
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      
      // Send to backend
      const response = await fetch(`${apiUrl}/import-csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: 'properties_import',
          headers: headers,
          data: data
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في الاستيراد');
      }

      const result = await response.json();
      
      setResult({
        success: true,
        imported: result.imported || data.length,
        total: data.length,
        tableName: 'properties_import'
      });

      if (onImportComplete) {
        onImportComplete(result);
      }

    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'حدث خطأ أثناء الاستيراد');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <CloudArrowUpIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">استيراد بيانات CSV</h3>
        <p className="text-gray-600">اختر ملف CSV لاستيراد البيانات إلى قاعدة البيانات</p>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-700">
              <strong>الملف:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center"
          >
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            تم استيراد {result.imported} من {result.total} سجل بنجاح إلى جدول {result.tableName}
          </motion.div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || importing}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            !file || importing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {importing ? 'جاري الاستيراد...' : 'استيراد البيانات'}
        </button>
      </div>
    </div>
  );
};

export default SimpleCSVImport;
