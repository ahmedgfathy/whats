import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpTrayIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  TrashIcon,
  SparklesIcon,
  CloudArrowUpIcon,
  FolderOpenIcon,
  CpuChipIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { parseWhatsAppChatFile } from '../utils/arabicTextProcessor';
import { importChatMessages, getAllMessages, resetDatabase, getDatabaseSize } from '../services/mockDatabase';

const ChatImport = () => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [preview, setPreview] = useState([]);
  const [currentMessageCount, setCurrentMessageCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const loadMessageCount = async () => {
      try {
        const messages = await getAllMessages();
        setCurrentMessageCount(messages.length);
      } catch (error) {
        console.error('Error loading message count:', error);
      }
    };
    
    loadMessageCount();
  }, [importResult]);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt') || !selectedFile.type) {
        setFile(selectedFile);
        setImportResult(null);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            console.log('File preview - content length:', content.length);
            
            const messages = parseWhatsAppChatFile(content);
            console.log('File preview - parsed messages:', messages.length);
            
            setPreview(messages.slice(0, 5));
          } catch (error) {
            console.error('Error parsing file for preview:', error);
            setPreview([]);
          }
        };
        reader.readAsText(selectedFile);
      } else {
        setImportResult({
          success: false,
          error: 'يرجى اختيار ملف نصي (.txt) فقط'
        });
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          const messages = parseWhatsAppChatFile(content);
          
          if (messages.length === 0) {
            setImportResult({
              success: false,
              error: 'لم يتم العثور على رسائل صالحة في الملف'
            });
            return;
          }

          const result = await importChatMessages(messages);
          setImportResult({
            success: true,
            imported: result.imported,
            total: messages.length,
            skipped: result.skipped
          });

          const updatedMessages = await getAllMessages();
          setCurrentMessageCount(updatedMessages.length);
        } catch (error) {
          console.error('Error importing messages:', error);
          setImportResult({
            success: false,
            error: 'حدث خطأ أثناء معالجة الملف: ' + error.message
          });
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setImportResult({
        success: false,
        error: 'حدث خطأ أثناء قراءة الملف'
      });
      setImporting(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء غير قابل للتراجع.')) {
      try {
        await resetDatabase();
        setCurrentMessageCount(0);
        setImportResult({
          success: true,
          message: 'تم حذف جميع البيانات بنجاح'
        });
      } catch (error) {
        console.error('Error resetting database:', error);
        setImportResult({
          success: false,
          error: 'حدث خطأ أثناء حذف البيانات'
        });
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div 
        className="glass-light rounded-3xl p-8 border border-border/50 shadow-2xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-center" dir="rtl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-75"></div>
              <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl">
                <CloudArrowUpIcon className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-4">استيراد ملفات WhatsApp</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            قم برفع ملف محادثة WhatsApp المُصدر لتحليل العقارات وإضافتها إلى قاعدة البيانات الذكية
          </p>
        </div>
      </motion.div>

      {/* Current Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="glass-light rounded-2xl p-6 border border-border/50 text-center">
          <div className="flex items-center justify-center mb-4">
            <FireIcon className="h-8 w-8 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">{currentMessageCount}</div>
          <div className="text-sm text-muted-foreground">عقار في قاعدة البيانات</div>
        </div>
        
        <div className="glass-light rounded-2xl p-6 border border-border/50 text-center">
          <div className="flex items-center justify-center mb-4">
            <CpuChipIcon className="h-8 w-8 text-purple-400 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">AI</div>
          <div className="text-sm text-muted-foreground">معالجة ذكية للنصوص</div>
        </div>
        
        <div className="glass-light rounded-2xl p-6 border border-border/50 text-center">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="h-8 w-8 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">24/7</div>
          <div className="text-sm text-muted-foreground">معالجة فورية</div>
        </div>
      </motion.div>

      {/* File Upload Area */}
      <motion.div 
        className="glass-light rounded-3xl p-8 border border-border/50 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div 
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {!file ? (
            <motion.div 
              className="space-y-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FolderOpenIcon className="h-20 w-20 text-primary" />
                </motion.div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">اسحب وأفلت الملف هنا</h3>
                <p className="text-muted-foreground text-lg mb-6">أو انقر لاختيار ملف من جهازك</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('file-input').click()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ArrowUpTrayIcon className="h-5 w-5 inline ml-2" />
                  اختيار ملف
                </motion.button>
              </div>
              <p className="text-sm text-muted-foreground">
                الملفات المدعومة: .txt (ملفات تصدير WhatsApp)
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex justify-center">
                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                  <DocumentTextIcon className="h-12 w-12 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{file.name}</h3>
                <p className="text-muted-foreground">
                  حجم الملف: {(file.size / 1024).toFixed(1)} KB
                </p>
                {preview.length > 0 && (
                  <p className="text-green-400 font-semibold mt-2">
                    تم العثور على {preview.length} رسائل في المعاينة
                  </p>
                )}
              </div>
            </motion.div>
          )}
          
          <input
            id="file-input"
            type="file"
            accept=".txt,text/plain"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      </motion.div>

      {/* Preview Section */}
      {preview.length > 0 && (
        <motion.div 
          className="glass-light rounded-3xl p-8 border border-border/50 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-foreground mb-6 text-right flex items-center justify-end">
            <DocumentTextIcon className="h-6 w-6 ml-3 text-blue-400" />
            معاينة الرسائل
          </h3>
          <div className="space-y-4" dir="rtl">
            {preview.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass rounded-2xl p-4 border border-border/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-semibold text-primary">
                    {message.sender}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleString('ar-SA')}
                  </span>
                </div>
                <p className="text-foreground">{message.content}</p>
                {message.property_type && (
                  <span className="inline-block mt-2 px-3 py-1 bg-primary/20 text-primary text-xs rounded-full">
                    {message.property_type}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {file && (
        <motion.div 
          className="glass-light rounded-2xl p-6 border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-center gap-4">
            <motion.button
              onClick={handleImport}
              disabled={importing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {importing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جارٍ الاستيراد...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  بدء الاستيراد
                </>
              )}
            </motion.button>

            <motion.button
              onClick={() => {
                setFile(null);
                setPreview([]);
                setImportResult(null);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 glass border border-border/50 text-muted-foreground hover:text-foreground font-bold rounded-2xl transition-all duration-300"
            >
              إلغاء
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Result Message */}
      <AnimatePresence>
        {importResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`glass-light rounded-2xl p-6 border border-border/50 text-center ${
              importResult.success ? 'bg-green-500/5' : 'bg-red-500/5'
            }`}
          >
            <div className="flex justify-center mb-4">
              {importResult.success ? (
                <CheckCircleIcon className="h-12 w-12 text-green-400" />
              ) : (
                <ExclamationTriangleIcon className="h-12 w-12 text-red-400" />
              )}
            </div>
            
            {importResult.success ? (
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-2">تم الاستيراد بنجاح!</h3>
                {importResult.imported !== undefined ? (
                  <p className="text-foreground">
                    تم استيراد {importResult.imported} رسالة من أصل {importResult.total}
                    {importResult.skipped > 0 && ` (تم تخطي ${importResult.skipped} رسالة مكررة)`}
                  </p>
                ) : (
                  <p className="text-foreground">{importResult.message}</p>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-2">فشل في الاستيراد</h3>
                <p className="text-foreground">{importResult.error}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Database Management */}
      <motion.div 
        className="glass-light rounded-2xl p-6 border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-xl font-bold text-foreground mb-4 text-right flex items-center justify-end">
          <ChartBarIcon className="h-5 w-5 ml-2 text-red-400" />
          إدارة قاعدة البيانات
        </h3>
        <div className="flex justify-center">
          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <TrashIcon className="h-5 w-5 inline ml-2" />
            حذف جميع البيانات
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatImport;
