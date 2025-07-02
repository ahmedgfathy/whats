import React, { useState, useEffect } from 'react';

const ChatImportSimple = () => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    
    // Simulate import process
    setTimeout(() => {
      setImportResult({
        success: true,
        imported: Math.floor(Math.random() * 100),
        message: 'تم الاستيراد بنجاح!'
      });
      setImporting(false);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          استيراد ملفات WhatsApp
        </h2>
        <p className="text-gray-600 text-center mb-6">
          قم برفع ملف محادثة WhatsApp لتحليل العقارات
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          {!file ? (
            <div>
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                اختر ملف للرفع
              </h3>
              <button
                onClick={() => document.getElementById('file-input').click()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                اختيار ملف
              </button>
              <p className="text-sm text-gray-500 mt-2">
                ملفات .txt فقط
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500">
                حجم الملف: {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}
          
          <input
            id="file-input"
            type="file"
            accept=".txt,text/plain"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      </div>

      {file && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-center gap-4">
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جارٍ الاستيراد...
                </>
              ) : (
                'بدء الاستيراد'
              )}
            </button>
            
            <button
              onClick={() => {
                setFile(null);
                setImportResult(null);
              }}
              className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {importResult && (
        <div className={`rounded-lg shadow-lg p-6 text-center ${
          importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="mb-4">
            {importResult.success ? (
              <svg className="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {importResult.success ? 'تم الاستيراد بنجاح!' : 'فشل في الاستيراد'}
          </h3>
          
          <p className="text-gray-700">
            {importResult.message || `تم استيراد ${importResult.imported} رسالة`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatImportSimple;
