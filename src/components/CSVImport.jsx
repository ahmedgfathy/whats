import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  TableCellsIcon,
  EyeIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { importCSVData } from '../services/apiService';

const CSVImport = ({ isOpen, onClose, onImportComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [tableName, setTableName] = useState('');
  const [importStatus, setImportStatus] = useState('idle'); // idle, parsing, previewing, importing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [importStats, setImportStats] = useState(null);

  // Parse CSV file
  const parseCSV = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          setErrorMessage('ملف CSV فارغ');
          setImportStatus('error');
          return;
        }

        // Parse headers (first line)
        const headerLine = lines[0];
        const parsedHeaders = headerLine.split(',').map(header => 
          header.trim().replace(/['"]/g, '')
        );
        
        // Parse data rows
        const dataRows = lines.slice(1).map(line => {
          const values = line.split(',').map(value => 
            value.trim().replace(/['"]/g, '')
          );
          const row = {};
          parsedHeaders.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        setHeaders(parsedHeaders);
        setCsvData(dataRows);
        setImportStatus('previewing');
        
        // Auto-detect table name from filename or headers
        const fileName = file.name.replace(/\.(csv|xlsx)$/i, '');
        setTableName(fileName.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
        
      } catch (error) {
        console.error('CSV parsing error:', error);
        setErrorMessage('خطأ في تحليل ملف CSV');
        setImportStatus('error');
      }
    };
    
    reader.onerror = () => {
      setErrorMessage('خطأ في قراءة الملف');
      setImportStatus('error');
    };
    
    reader.readAsText(file, 'UTF-8');
  }, []);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => 
      file.name.toLowerCase().endsWith('.csv') || 
      file.name.toLowerCase().endsWith('.xlsx')
    );
    
    if (csvFile) {
      setCsvFile(csvFile);
      setImportStatus('parsing');
      parseCSV(csvFile);
    } else {
      setErrorMessage('يرجى رفع ملف CSV أو Excel فقط');
      setImportStatus('error');
    }
  }, [parseCSV]);

  // Handle file input
  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      setImportStatus('parsing');
      parseCSV(file);
    }
  }, [parseCSV]);

  // Import CSV data to database
  const handleImport = async () => {
    if (!csvData || !tableName) {
      setErrorMessage('بيانات CSV أو اسم الجدول مفقود');
      setImportStatus('error');
      return;
    }
    
    setImportStatus('importing');
    
    try {
      console.log('CSV Import Debug:', {
        tableName,
        headersCount: headers.length,
        dataCount: csvData.length,
        headers: headers,
        sampleData: csvData.slice(0, 2)
      });
      
      // Use the actual API service to import CSV data
      const result = await importCSVData(tableName, headers, csvData);
      
      console.log('CSV Import Success:', result);
      
      setImportStats({
        imported: result.imported || csvData.length,
        total: csvData.length,
        table: tableName
      });
      setImportStatus('success');
      
      // Call completion callback after a short delay
      setTimeout(() => {
        onImportComplete && onImportComplete({
          imported: result.imported || csvData.length,
          total: csvData.length,
          table: tableName
        });
      }, 2000);
      
    } catch (error) {
      console.error('Import error details:', error);
      setErrorMessage('فشل في استيراد البيانات إلى قاعدة البيانات: ' + (error.message || error));
      setImportStatus('error');
    }
  };

  // Reset state
  const resetImport = () => {
    setCsvFile(null);
    setCsvData(null);
    setHeaders([]);
    setTableName('');
    setImportStatus('idle');
    setErrorMessage('');
    setImportStats(null);
    setDragActive(false);
  };

  // Close modal
  const handleClose = () => {
    resetImport();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CloudArrowUpIcon className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold font-cairo">استيراد ملف CSV</h2>
                  <p className="text-blue-100 mt-1 font-cairo">رفع وتحويل بيانات العقارات إلى قاعدة البيانات</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Upload Area */}
            {importStatus === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <DocumentArrowUpIcon className={`w-16 h-16 mx-auto mb-4 ${
                  dragActive ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <h3 className="text-xl font-bold text-gray-800 mb-2 font-cairo">
                  اسحب وأفلت ملف CSV هنا
                </h3>
                <p className="text-gray-600 mb-4 font-cairo">
                  أو انقر لاختيار ملف من جهازك
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileInput}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-cairo"
                >
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  اختيار ملف
                </label>
                <p className="text-sm text-gray-500 mt-3 font-cairo">
                  الملفات المدعومة: CSV, Excel (.xlsx)
                </p>
              </motion.div>
            )}

            {/* Parsing Status */}
            {importStatus === 'parsing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 font-cairo">جاري تحليل الملف...</h3>
                <p className="text-gray-600 font-cairo">يرجى الانتظار بينما نقوم بمعالجة البيانات</p>
              </motion.div>
            )}

            {/* Preview */}
            {importStatus === 'previewing' && csvData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-bold font-cairo">تم تحليل الملف بنجاح!</span>
                  </div>
                  <p className="text-green-700 mt-1 font-cairo">
                    تم العثور على {csvData.length} صف و {headers.length} عمود
                  </p>
                </div>

                {/* Table Name Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 font-cairo">
                    اسم الجدول في قاعدة البيانات:
                  </label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-roboto"
                    placeholder="مثال: properties, agents, areas"
                  />
                </div>

                {/* Data Preview */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <EyeIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-800 font-cairo">معاينة البيانات</h3>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            {headers.map((header, index) => (
                              <th key={index} className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {csvData.slice(0, 5).map((row, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              {headers.map((header, colIndex) => (
                                <td key={colIndex} className="px-4 py-3 text-sm text-gray-900 font-roboto">
                                  {row[header] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {csvData.length > 5 && (
                      <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 font-cairo">
                        عرض 5 صفوف من أصل {csvData.length} صف
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleImport}
                    disabled={!tableName.trim()}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-cairo font-bold"
                  >
                    <CloudArrowUpIcon className="w-5 h-5 inline-block ml-2" />
                    استيراد البيانات
                  </button>
                  <button
                    onClick={resetImport}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-cairo"
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            )}

            {/* Importing Status */}
            {importStatus === 'importing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 font-cairo">جاري استيراد البيانات...</h3>
                <p className="text-gray-600 font-cairo">يرجى عدم إغلاق النافذة أثناء عملية الاستيراد</p>
              </motion.div>
            )}

            {/* Success */}
            {importStatus === 'success' && importStats && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2 font-cairo">تم الاستيراد بنجاح!</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 text-right">
                  <p className="text-green-800 font-cairo">
                    <span className="font-bold">الجدول:</span> {tableName}
                  </p>
                  <p className="text-green-800 font-cairo">
                    <span className="font-bold">عدد الصفوف المستوردة:</span> {importStats.imported || csvData?.length}
                  </p>
                  <p className="text-green-800 font-cairo">
                    <span className="font-bold">عدد الأعمدة:</span> {headers.length}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-cairo"
                >
                  إغلاق
                </button>
              </motion.div>
            )}

            {/* Error */}
            {importStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <ExclamationTriangleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2 font-cairo">حدث خطأ!</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-red-800 font-cairo">{errorMessage}</p>
                </div>
                <button
                  onClick={resetImport}
                  className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-cairo"
                >
                  إعادة المحاولة
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CSVImport;
