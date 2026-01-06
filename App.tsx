import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, X, FileImage, Check, Loader2, Archive, Plus, ArrowRight, Settings2 } from 'lucide-react';
import { Button, Checkbox } from './components/ui';
import { convertImage, formatBytes, generateZip } from './utils/imageProcessing';
import { ConversionResult, ImageFormat, ProcessedFile } from './types';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_FORMATS: ImageFormat[] = ['jpeg', 'png', 'webp', 'avif', 'jfif'];

export default function App() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dragActive, setDragActive] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Auto-select new files
  useEffect(() => {
    const newUrls = new Set(selectedUrls);
    let changed = false;
    files.forEach(file => {
      file.results.forEach(res => {
        if (!selectedUrls.has(res.url)) {
          newUrls.add(res.url);
          changed = true;
        }
      });
    });
    if (changed) setSelectedUrls(newUrls);
  }, [files.length]);

  const handleFiles = async (inputFiles: FileList | null) => {
    if (!inputFiles || inputFiles.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: inputFiles.length });
    
    const newProcessedFiles: ProcessedFile[] = [];

    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];
      setProgress({ current: i + 1, total: inputFiles.length });

      try {
        const previewUrl = URL.createObjectURL(file);
        const fileResults: ConversionResult[] = [];
        
        for (const fmt of ALL_FORMATS) {
           try {
             const result = await convertImage(file, fmt);
             fileResults.push(result);
           } catch (e) { console.error(e); }
        }

        newProcessedFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          sourceName: file.name,
          sourceSize: file.size,
          previewUrl,
          results: fileResults
        });
      } catch (err) {
        console.error("Error processing file", file.name, err);
      }
    }

    setFiles(prev => [...prev, ...newProcessedFiles]);
    setTimeout(() => setIsProcessing(false), 600);
  };

  const toggleSelection = (url: string) => {
    const newSet = new Set(selectedUrls);
    if (newSet.has(url)) newSet.delete(url);
    else newSet.add(url);
    setSelectedUrls(newSet);
  };

  const toggleFormat = (format: ImageFormat) => {
    const urlsOfFormat = files.flatMap(f => f.results.filter(r => r.format === format).map(r => r.url));
    if (urlsOfFormat.length === 0) return;

    const allSelected = urlsOfFormat.every(url => selectedUrls.has(url));
    const newSet = new Set(selectedUrls);

    urlsOfFormat.forEach(url => {
      if (allSelected) newSet.delete(url);
      else newSet.add(url);
    });
    setSelectedUrls(newSet);
  };
  
  const isFormatSelected = (format: ImageFormat) => {
      const urlsOfFormat = files.flatMap(f => f.results.filter(r => r.format === format).map(r => r.url));
      if (urlsOfFormat.length === 0) return false;
      return urlsOfFormat.every(url => selectedUrls.has(url));
  };

  const toggleAll = () => {
    const allUrls = new Set<string>();
    files.forEach(f => f.results.forEach(r => allUrls.add(r.url)));
    
    if (selectedUrls.size === allUrls.size) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(allUrls);
    }
  };

  const downloadZip = async () => {
    const selectedResults: ConversionResult[] = [];
    files.forEach(f => {
      f.results.forEach(r => {
        if (selectedUrls.has(r.url)) selectedResults.push(r);
      });
    });

    if (selectedResults.length === 0) return;
    
    const blob = await generateZip(selectedResults);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_images_${new Date().getTime()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    if (files.length === 1) setSelectedUrls(new Set());
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-black selection:text-white relative overflow-x-hidden">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Loading Curtain */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center p-8"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-full max-w-xs text-center space-y-8"
             >
                <div className="relative w-32 h-32 mx-auto">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="60" stroke="#f4f4f5" strokeWidth="8" fill="none" />
                      <motion.circle 
                        cx="64" cy="64" r="60" stroke="black" strokeWidth="8" fill="none" 
                        strokeDasharray="377"
                        strokeDashoffset={377 - (377 * (progress.current / progress.total))}
                        strokeLinecap="round"
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold tracking-tighter">{Math.round((progress.current / progress.total) * 100)}%</span>
                   </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-zinc-900">Optimizing Images</h3>
                  <p className="text-zinc-400 mt-2 text-sm">Converting {progress.current}/{progress.total} files...</p>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-20 z-40 flex items-center justify-center pointer-events-none">
        <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-sm px-6 py-3 rounded-full flex items-center gap-3 pointer-events-auto mt-6">
          <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center">
            <FileImage size={16} />
          </div>
          <span className="font-bold text-sm tracking-tight">Converter</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-40">
        
        {/* Main Content Area */}
        <div className="space-y-6">
          
          {/* Controls: Only visible when files exist */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 mb-8"
              >
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                   <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-full">
                      <button 
                         onClick={toggleAll}
                         className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${files.every(f => f.results.every(r => selectedUrls.has(r.url))) ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-zinc-900'}`}
                      >
                        All
                      </button>
                      {ALL_FORMATS.map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => toggleFormat(fmt)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase transition-all ${isFormatSelected(fmt) ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-zinc-900'}`}
                        >
                          {fmt}
                        </button>
                      ))}
                   </div>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                   <Button variant="ghost" onClick={() => setFiles([])} className="h-9 px-3 text-xs">Clear</Button>
                   <Button variant="outline" onClick={() => uploadInputRef.current?.click()} className="h-9 px-3 text-xs rounded-full">
                      <Plus size={14} /> Add
                   </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State / Dropzone */}
          {files.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mt-12"
            >
              <div 
                className={`
                  group relative overflow-hidden bg-white rounded-[2rem] border transition-all duration-500 cursor-pointer
                  ${dragActive ? 'border-black ring-4 ring-black/5 scale-[1.02]' : 'border-zinc-200 hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/50'}
                `}
                style={{ height: '400px' }}
                onClick={() => uploadInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                 <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                 
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                    <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                       <Upload className="text-zinc-900 w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-3">Drop files here</h2>
                    <p className="text-zinc-500 max-w-xs mx-auto">
                       Convert JPG, PNG, WEBP, AVIF, and JFIF instantly.
                    </p>
                    <div className="mt-8 px-6 py-2 bg-black text-white rounded-full text-sm font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                       Browse Files
                    </div>
                 </div>
              </div>
              <input 
                ref={uploadInputRef} 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFiles(e.target.files)}
              />
            </motion.div>
          )}

          {/* File List */}
          <div className="grid gap-4">
             <AnimatePresence>
               {files.map((file, idx) => (
                 <motion.div
                   key={file.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ delay: idx * 0.05 }}
                   className="bg-white rounded-3xl p-4 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow group"
                 >
                   <div className="flex flex-col sm:flex-row gap-6">
                      
                      {/* Left: Source Info */}
                      <div className="flex items-center sm:w-1/3 gap-4 border-b sm:border-b-0 sm:border-r border-zinc-100 pb-4 sm:pb-0 sm:pr-4">
                         <div className="relative w-16 h-16 shrink-0">
                           <img src={file.previewUrl} className="w-full h-full object-cover rounded-2xl bg-zinc-50" />
                           <button 
                             onClick={() => removeFile(file.id)}
                             className="absolute -top-2 -left-2 bg-white rounded-full p-1 shadow-md border border-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                           >
                             <X size={12} />
                           </button>
                         </div>
                         <div className="min-w-0">
                            <h4 className="font-semibold text-sm truncate text-zinc-900">{file.sourceName}</h4>
                            <span className="text-xs text-zinc-400 font-mono">{formatBytes(file.sourceSize)}</span>
                         </div>
                      </div>

                      {/* Right: Output Grid */}
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                         {file.results.map(res => {
                           const isSelected = selectedUrls.has(res.url);
                           return (
                             <div 
                               key={res.format}
                               onClick={() => toggleSelection(res.url)}
                               className={`
                                 relative cursor-pointer rounded-xl p-2.5 flex flex-col justify-between h-20 transition-all duration-200 border
                                 ${isSelected 
                                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-900/20' 
                                    : 'bg-zinc-50 text-zinc-500 border-transparent hover:bg-zinc-100'}
                               `}
                             >
                                <div className="flex justify-between items-start">
                                   <span className="text-[10px] font-bold uppercase tracking-wider">{res.format}</span>
                                   {isSelected && <Check size={10} strokeWidth={3} />}
                                </div>
                                <div className="flex justify-between items-end">
                                  <span className="text-[9px] opacity-70 font-mono">{formatBytes(res.size)}</span>
                                  {/* Download Icon (Clickable separately) */}
                                  <div 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const a = document.createElement('a');
                                      a.href = res.url;
                                      a.download = res.filename;
                                      a.click();
                                    }}
                                    className={`p-1 rounded-full ${isSelected ? 'bg-white/20 hover:bg-white/30' : 'hover:bg-zinc-200'}`}
                                  >
                                    <Download size={10} />
                                  </div>
                                </div>
                             </div>
                           )
                         })}
                      </div>
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedUrls.size > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-white/90 backdrop-blur-xl border border-zinc-200/50 shadow-2xl shadow-zinc-300/50 p-2 pl-5 rounded-full flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Ready to download</span>
                 <span className="text-[10px] text-zinc-500">{selectedUrls.size} files selected</span>
              </div>
              <Button 
                onClick={downloadZip}
                className="rounded-full px-6 h-10 text-sm shadow-none"
              >
                Download <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}