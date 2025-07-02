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
import { importChatMessages, getAllMessages, resetDatabase, getDatabaseSize } from '../services/apiService';

const ChatImportEnglish = ({ onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [preview, setPreview] = useState([]);
  const [currentMessageCount, setCurrentMessageCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importProgress, setImportProgress] = useState('');

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
          error: 'Please select a text file (.txt) only'
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
    setImportResult(null);
    setImportProgress('Reading file...');
    
    try {
      const reader = new FileReader();
      
      reader.onerror = () => {
        console.error('Error reading file');
        setImportResult({
          success: false,
          error: 'Error reading file'
        });
        setImporting(false);
        setImportProgress('');
      };
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          console.log('File content loaded, size:', content.length);
          setImportProgress('Parsing messages...');
          
          // Add timeout to prevent UI freeze with large files
          const messages = await new Promise((resolve, reject) => {
            setTimeout(() => {
              try {
                const parsed = parseWhatsAppChatFile(content);
                resolve(parsed);
              } catch (error) {
                reject(error);
              }
            }, 100);
          });
          
          if (messages.length === 0) {
            setImportResult({
              success: false,
              error: 'No valid messages found in the file'
            });
            setImporting(false);
            setImportProgress('');
            return;
          }

          console.log(`Parsed ${messages.length} messages, starting import...`);
          setImportProgress(`Importing ${messages.length} messages...`);
          
          const result = await importChatMessages(messages);
          
          setImportResult({
            success: true,
            imported: result.imported,
            total: messages.length,
            skipped: result.skipped
          });

          const updatedMessages = await getAllMessages();
          setCurrentMessageCount(updatedMessages.length);
          
          // Notify parent component to refresh data
          if (onImportSuccess) {
            onImportSuccess();
          }
          
        } catch (error) {
          console.error('Error importing messages:', error);
          setImportResult({
            success: false,
            error: 'Error processing file: ' + error.message
          });
        } finally {
          setImporting(false);
          setImportProgress('');
        }
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      console.error('Error reading file:', error);
      setImportResult({
        success: false,
        error: 'Error reading file'
      });
      setImporting(false);
      setImportProgress('');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      try {
        await resetDatabase();
        setCurrentMessageCount(0);
        setImportResult({
          success: true,
          message: 'All data deleted successfully'
        });
      } catch (error) {
        console.error('Error resetting database:', error);
        setImportResult({
          success: false,
          error: 'Error deleting data'
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
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-75"></div>
              <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl">
                <CloudArrowUpIcon className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-4">Import WhatsApp Files</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Upload exported WhatsApp chat files to analyze properties and add them to the smart database
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
          <div className="text-sm text-muted-foreground">Properties in Database</div>
        </div>
        
        <div className="glass-light rounded-2xl p-6 border border-border/50 text-center">
          <div className="flex items-center justify-center mb-4">
            <CpuChipIcon className="h-8 w-8 text-purple-400 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">AI</div>
          <div className="text-sm text-muted-foreground">Smart Text Processing</div>
        </div>
        
        <div className="glass-light rounded-2xl p-6 border border-border/50 text-center">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="h-8 w-8 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">24/7</div>
          <div className="text-sm text-muted-foreground">Instant Processing</div>
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
                <h3 className="text-2xl font-bold text-foreground mb-3">Drag and drop file here</h3>
                <p className="text-muted-foreground text-lg mb-6">Or click to choose file from your device</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('file-input-english').click()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ArrowUpTrayIcon className="h-5 w-5 inline mr-2" />
                  Choose File
                </motion.button>
              </div>
              <p className="text-sm text-muted-foreground">
                Supported files: .txt (WhatsApp export files)
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
                  File size: {(file.size / 1024).toFixed(1)} KB
                </p>
                {preview.length > 0 && (
                  <p className="text-green-400 font-semibold mt-2">
                    Found {preview.length} messages in preview
                  </p>
                )}
              </div>
            </motion.div>
          )}
          
          <input
            id="file-input-english"
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
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <DocumentTextIcon className="h-6 w-6 mr-3 text-blue-400" />
            Message Preview
          </h3>
          <div className="space-y-4">
            {preview.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass rounded-2xl p-4 border border-border/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-semibold text-primary">
                    {message.sender}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleString('en-US')}
                  </span>
                </div>
                <p className="text-foreground">{message.message}</p>
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
                  {importProgress || 'Importing...'}
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  Start Import
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
              Cancel
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
                <h3 className="text-xl font-bold text-green-400 mb-2">Import Successful!</h3>
                {importResult.imported !== undefined ? (
                  <p className="text-foreground">
                    Imported {importResult.imported} messages out of {importResult.total}
                    {importResult.skipped > 0 && ` (skipped ${importResult.skipped} duplicate messages)`}
                  </p>
                ) : (
                  <p className="text-foreground">{importResult.message}</p>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-2">Import Failed</h3>
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
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-red-400" />
          Database Management
        </h3>
        <div className="flex justify-center">
          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <TrashIcon className="h-5 w-5 inline mr-2" />
            Delete All Data
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatImportEnglish;
