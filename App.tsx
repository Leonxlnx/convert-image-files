import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, X, FileImage, Check, Loader2, Archive, Plus, ArrowRight, Settings2, Sparkles } from 'lucide-react';
import { Button, Checkbox } from './components/ui';
import { convertImage, formatBytes, generateZip } from './utils/imageProcessing';
import { ConversionResult, ImageFormat, ProcessedFile } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { ClickerGame } from './components/ClickerGame';

const ALL_FORMATS: ImageFormat[] = ['jpeg', 'png', 'webp', 'avif', 'jfif'];

// X Logo Component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function App() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dragActive, setDragActive] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const hasFiles = files.length > 0;

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
    setTimeout(() => setIsProcessing(false), 800); 
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
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove) {
        const newSet = new Set(selectedUrls);
        fileToRemove.results.forEach(r => newSet.delete(r.url));
        setSelectedUrls(newSet);
    }
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

  // Ensure 100dvh for mobile browsers to avoid scrolling issues on empty state
  return (
    <div className={`min-h-[100dvh] bg-[#fafafa] text-zinc-800 font-sans selection:bg-zinc-900 selection:text-white relative flex flex-col transition-colors duration-700`}>
      
      {/* GLOBAL INPUT */}
      <input 
        ref={uploadInputRef} 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Background Pattern - Softer & Subtle */}
      <div className="fixed inset-0 z-0 opacity-[0.015] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Loading Curtain */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-full flex flex-col items-center max-w-md relative"
             >
                <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" stroke="#f4f4f5" strokeWidth="6" fill="none" />
                      <motion.circle 
                        cx="60" cy="60" r="54" stroke="#18181b" strokeWidth="6" fill="none" 
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress.current / progress.total }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold tracking-tighter text-zinc-900">{Math.round((progress.current / progress.total) * 100)}%</span>
                   </div>
                </div>
                
                <h3 className="text-xl font-semibold text-zinc-900 mb-2 tracking-tight">Optimizing with cxnvert</h3>
                <p className="text-zinc-400 text-sm mb-12 font-medium">{progress.current} of {progress.total} complete</p>
                
                <div className="animate-in fade-in zoom-in duration-700 delay-100">
                    <ClickerGame />
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar - Position changes based on state to ensure layout balance */}
      <nav className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-center pointer-events-none transition-all duration-700 ease-in-out ${!hasFiles ? 'h-32' : 'h-24'}`}>
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6 py-3 rounded-full flex items-center gap-2.5 pointer-events-auto mt-6">
          <div className="bg-zinc-900 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md shadow-zinc-900/10">
            <Sparkles size={12} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-800">cxnvert</span>
        </div>
      </nav>

      {/* Main Content Area - FLEX GROW to push footer down, flex center for vertical centering */}
      <main className={`relative z-10 w-full max-w-3xl mx-auto px-6 flex-grow flex flex-col transition-all duration-500 ${!hasFiles ? 'justify-center items-center' : 'pt-36 pb-32'}`}>
        
        <div className="space-y-8 w-full">
          
          {/* Controls */}
          <AnimatePresence>
            {hasFiles && (
              <motion.div 
                initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-white p-5 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8"
              >
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                   <div className="flex items-center gap-1.5 p-1.5 bg-zinc-50 rounded-full border border-zinc-100">
                      <button 
                         onClick={toggleAll}
                         className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${files.every(f => f.results.every(r => selectedUrls.has(r.url))) && selectedUrls.size > 0 ? 'bg-white shadow-[0_2px_8px_rgb(0,0,0,0.08)] text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                      >
                        All
                      </button>
                      {ALL_FORMATS.map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => toggleFormat(fmt)}
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all duration-300 ${isFormatSelected(fmt) ? 'bg-white shadow-[0_2px_8px_rgb(0,0,0,0.08)] text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                          {fmt}
                        </button>
                      ))}
                   </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                   <Button variant="ghost" onClick={() => { setFiles([]); setSelectedUrls(new Set()); }} className="h-10 px-4 text-xs font-semibold rounded-full hover:bg-zinc-50">Clear</Button>
                   <Button variant="outline" onClick={() => uploadInputRef.current?.click()} className="h-10 px-5 text-xs rounded-full border-zinc-200 shadow-sm font-bold text-zinc-700">
                      <Plus size={14} strokeWidth={2.5} /> Add
                   </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State / Dropzone - Centered */}
          {!hasFiles && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center w-full flex flex-col items-center justify-center"
            >
              <div 
                className={`
                  group relative overflow-hidden bg-white rounded-[3rem] transition-all duration-500 cursor-pointer w-full max-w-xl mx-auto
                  ${dragActive ? 'ring-8 ring-zinc-100 scale-[1.01]' : 'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] hover:scale-[1.005]'}
                `}
                style={{ height: 'min(420px, 60vh)' }}
                onClick={() => uploadInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                 <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
                 
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                    <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out">
                       <Upload className="text-zinc-800 w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-4">Drop files here</h2>
                    <p className="text-zinc-400 font-medium max-w-xs mx-auto leading-relaxed">
                       Convert JPG, PNG, WEBP, AVIF, and JFIF instantly.
                    </p>
                    <div className="mt-10 px-8 py-3 bg-zinc-900 text-white rounded-full text-sm font-semibold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-lg shadow-zinc-900/20">
                       Browse Files
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* File List */}
          <div className="grid gap-5">
             <AnimatePresence>
               {files.map((file, idx) => (
                 <motion.div
                   key={file.id}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                   className="bg-white rounded-[2.5rem] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-shadow duration-300 group"
                 >
                   <div className="flex flex-col sm:flex-row gap-8">
                      
                      {/* Left: Source Info */}
                      <div className="flex items-center sm:w-1/3 gap-5 border-b sm:border-b-0 sm:border-r border-zinc-50 pb-5 sm:pb-0 sm:pr-5">
                         <div className="relative w-20 h-20 shrink-0">
                           <img src={file.previewUrl} className="w-full h-full object-cover rounded-[1.2rem] bg-zinc-50" />
                           <button 
                             onClick={() => removeFile(file.id)}
                             className="absolute -top-3 -left-3 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:text-red-500 hover:scale-110"
                           >
                             <X size={14} strokeWidth={2.5} />
                           </button>
                         </div>
                         <div className="min-w-0 flex flex-col justify-center">
                            <h4 className="font-bold text-sm truncate text-zinc-800 mb-1">{file.sourceName}</h4>
                            <span className="text-xs text-zinc-400 font-semibold tracking-wide bg-zinc-50 px-2 py-1 rounded-md self-start">{formatBytes(file.sourceSize)}</span>
                         </div>
                      </div>

                      {/* Right: Output Grid */}
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                         {file.results.map(res => {
                           const isSelected = selectedUrls.has(res.url);
                           return (
                             <div 
                               key={res.format}
                               onClick={() => toggleSelection(res.url)}
                               className={`
                                 relative cursor-pointer rounded-2xl p-3 flex flex-col justify-between h-24 transition-all duration-300
                                 ${isSelected 
                                    ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-[1.02]' 
                                    : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:scale-[1.02]'}
                               `}
                             >
                                <div className="flex justify-between items-start">
                                   <span className="text-[10px] font-bold uppercase tracking-wider">{res.format}</span>
                                   {isSelected && <Check size={12} strokeWidth={3} />}
                                </div>
                                <div className="flex justify-between items-end">
                                  <span className="text-[10px] opacity-60 font-medium">{formatBytes(res.size)}</span>
                                  {/* Download Icon (Clickable separately) */}
                                  <div 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const a = document.createElement('a');
                                      a.href = res.url;
                                      a.download = res.filename;
                                      a.click();
                                    }}
                                    className={`p-1.5 rounded-full transition-colors ${isSelected ? 'bg-white/20 hover:bg-white/30' : 'hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600'}`}
                                  >
                                    <Download size={12} strokeWidth={2.5} />
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

      {/* Footer - Positioned absolutely only if screen is large enough, otherwise relative to flow */}
      <footer className={`z-10 py-6 text-center w-full transition-all duration-500 ${!hasFiles ? 'absolute bottom-0' : 'relative mt-auto'}`}>
        <div className="flex items-center justify-center gap-2 md:gap-3 text-[10px] md:text-xs text-zinc-400 font-semibold tracking-widest uppercase">
          <span className="opacity-60">Built by</span>
          <a 
            href="https://x.com/LexnL89916" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-zinc-800 hover:text-black font-bold transition-colors group"
          >
            <XIcon className="w-3 h-3 opacity-80 group-hover:opacity-100" />
            <span className="border-b-2 border-zinc-100 group-hover:border-zinc-900 pb-0.5 transition-colors">Leon</span>
          </a>
          <span className="opacity-20">•</span>
          <span className="opacity-60">Local</span>
          <span className="opacity-20">•</span>
          <span className="opacity-60">Free</span>
        </div>
      </footer>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedUrls.size > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-6"
          >
            <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] p-2.5 pl-6 rounded-full flex items-center justify-between ring-1 ring-black/5">
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Ready</span>
                 <span className="text-[10px] text-zinc-400 font-medium">{selectedUrls.size} files selected</span>
              </div>
              <Button 
                onClick={downloadZip}
                className="rounded-full px-8 h-11 text-sm shadow-lg shadow-zinc-900/20 hover:shadow-zinc-900/30 hover:scale-105"
              >
                {selectedUrls.size > 1 ? 'Download ZIP' : 'Download'} <ArrowRight size={14} className="ml-1" strokeWidth={3} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}