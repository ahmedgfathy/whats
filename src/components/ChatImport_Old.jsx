import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { parseWhatsAppChatFile } from '../utils/arabicTextProcessor';
import { importChatMessages, getAllMessages, resetDatabase, getDatabaseSize } from '../services/mockDatabase';

const ChatImport = () => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [preview, setPreview] = useState([]);
  const [currentMessageCount, setCurrentMessageCount] = useState(0);

  useEffect(() => {
    // Load current message count
    const loadMessageCount = async () => {
      try {
        const messages = await getAllMessages();
        setCurrentMessageCount(messages.length);
      } catch (error) {
        console.error('Error loading message count:', error);
      }
    };
    
    loadMessageCount();
  }, [importResult]); // Reload when import result changes

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Accept both .txt files and files without extension (WhatsApp export)
      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt') || !selectedFile.type) {
        setFile(selectedFile);
        setImportResult(null);
        
        // Read file for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            console.log('File preview - content length:', content.length);
            
            const messages = parseWhatsAppChatFile(content);
            console.log('File preview - parsed messages:', messages.length);
            
            setPreview(messages.slice(0, 5)); // Show first 5 messages as preview
          } catch (error) {
            console.error('Error parsing file for preview:', error);
            setPreview([]);
          }
        };
        reader.readAsText(selectedFile);
      } else {
        alert('يرجى اختيار ملف نصي (.txt) أو ملف تصدير واتساب');
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    console.log('Starting import process...');
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          console.log('File content loaded, length:', content.length);
          
          const messages = parseWhatsAppChatFile(content);
          console.log('Parsed messages:', messages.length);
          
          if (messages.length === 0) {
            setImportResult({
              success: false,
              error: 'لم يتم العثور على رسائل صالحة في الملف. تأكد من أن الملف هو تصدير واتساب صحيح.'
            });
            setImporting(false);
            return;
          }
          
          console.log('Calling importChatMessages...');
          const result = await importChatMessages(messages);
          console.log('Import result:', result);
          
          if (result && result.success) {
            setImportResult(result);
            // Force refresh of message count
            const updatedMessages = await getAllMessages();
            setCurrentMessageCount(updatedMessages.length);
          } else {
            setImportResult({
              success: false,
              error: 'فشل في استيراد الرسائل'
            });
          }
        } catch (error) {
          console.error('Error during import:', error);
          setImportResult({
            success: false,
            error: 'حدث خطأ أثناء معالجة الملف: ' + error.message
          });
        }
        
        setFile(null);
        setPreview([]);
        setImporting(false);
      };
      
      reader.onerror = (error) => {
        console.error('File reading error:', error);
        setImportResult({
          success: false,
          error: 'حدث خطأ أثناء قراءة الملف'
        });
        setImporting(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('General error:', error);
      setImportResult({
        success: false,
        error: 'حدث خطأ عام أثناء استيراد الملف: ' + error.message
      });
      setImporting(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleResetDatabase = async () => {
    if (window.confirm('هل أنت متأكد من إعادة تعيين قاعدة البيانات؟ سيتم حذف جميع البيانات المستوردة.')) {
      try {
        const count = resetDatabase();
        setCurrentMessageCount(count);
        setImportResult({
          success: true,
          messageCount: count,
          propertyMessages: count,
          isReset: true
        });
        console.log('Database reset successfully, new count:', count);
      } catch (error) {
        console.error('Error resetting database:', error);
        setImportResult({
          success: false,
          error: 'حدث خطأ أثناء إعادة التعيين: ' + error.message
        });
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Accept both .txt files and files without extension (WhatsApp export)
      if (droppedFile.type === 'text/plain' || droppedFile.name.endsWith('.txt') || !droppedFile.type) {
        setFile(droppedFile);
        setImportResult(null);
        
        // Read file for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            const messages = parseWhatsAppChatFile(content);
            setPreview(messages.slice(0, 5));
          } catch (error) {
            console.error('Error parsing dropped file:', error);
            setPreview([]);
          }
        };
        reader.readAsText(droppedFile);
      } else {
        alert('يرجى إسقاط ملف نصي (.txt) أو ملف تصدير واتساب');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Database Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between" dir="rtl">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-gray-600 ml-2" />
              <span className="text-sm font-medium text-gray-900">
                إجمالي الرسائل في قاعدة البيانات:
              </span>
            </div>
            <button
              onClick={handleResetDatabase}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
            >
              إعادة تعيين قاعدة البيانات
            </button>
          </div>
          <span className="text-lg font-bold text-indigo-600">
            {currentMessageCount.toLocaleString('ar-EG')}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2 text-right">
          كيفية تصدير محادثات واتساب:
        </h3>
        <ol className="text-sm text-blue-800 space-y-1 text-right list-decimal list-inside">
          <li>افتح المحادثة في واتساب</li>
          <li>اضغط على النقاط الثلاث في الأعلى</li>
          <li>اختر "المزيد" ثم "تصدير المحادثة"</li>
          <li>اختر "بدون وسائط"</li>
          <li>احفظ الملف وارفعه هنا</li>
        </ol>
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/sample_chat.txt';
              link.download = 'sample_chat.txt';
              link.click();
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            تحميل ملف تجريبي للاختبار
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-right">
          استيراد محادثات واتساب
        </h2>
        
        {/* File Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                اسحب ملف المحادثة هنا أو انقر للاختيار
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                الملفات المدعومة: .txt (تصدير واتساب)
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".txt"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        </div>

        {/* Selected File Info */}
        {file && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center" dir="rtl">
                <FileText className="h-5 w-5 text-blue-500 ml-2" />
                <span className="text-sm font-medium text-blue-900">
                  {file.name}
                </span>
                <span className="text-xs text-blue-700 mr-2">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'جاري الاستيراد...' : 'استيراد'}
              </button>
            </div>
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            importResult.success ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center" dir="rtl">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
              )}
              <div>
                {importResult.success ? (
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      {importResult.isReset ? 'تم إعادة تعيين قاعدة البيانات بنجاح!' : 'تم استيراد الملف بنجاح!'}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {importResult.isReset 
                        ? `تم إعادة تحميل قاعدة البيانات بـ ${importResult.messageCount} رسالة`
                        : `تم استيراد ${importResult.messageCount} رسالة، منها ${importResult.propertyMessages} رسالة عقارية`
                      }
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-red-900">
                    {importResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-3 text-right">
              معاينة الرسائل
            </h3>
            <div className="space-y-3">
              {preview.map((message, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg" dir="rtl">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                    <span className="text-sm font-medium text-gray-900">{message.sender}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{message.message}</p>
                  {message.property_type !== 'other' && (
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {message.property_type}
                      </span>
                      {message.location && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          {message.location}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-900 mb-2 text-right">
            تعليمات الاستيراد:
          </h4>
          <ul className="text-xs text-yellow-800 space-y-1 text-right">
            <li>• افتح واتساب واذهب إلى المجموعة المطلوبة</li>
            <li>• اضغط على "المزيد" ثم "تصدير المحادثة"</li>
            <li>• اختر "بدون وسائط" واحفظ الملف</li>
            <li>• ارفع الملف النصي هنا لاستيراد المحادثات</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChatImport;
