import { ImageFormat, ConversionResult } from '../types';
import JSZip from 'jszip';

export const convertImage = async (
  sourceFile: File,
  format: ImageFormat
): Promise<ConversionResult> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(sourceFile);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = objectUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas context failed"));
        return;
      }

      // Fill white background for non-transparent formats to avoid black background
      if (format === 'jpeg' || format === 'jfif') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      // Determine MIME type and quality
      let mimeType = 'image/jpeg';
      let extension = 'jpg';
      let quality = 0.92;

      switch (format) {
        case 'png':
          mimeType = 'image/png';
          extension = 'png';
          quality = 1;
          break;
        case 'webp':
          mimeType = 'image/webp';
          extension = 'webp';
          quality = 0.85;
          break;
        case 'jfif':
          mimeType = 'image/jpeg'; // JFIF is JPEG
          extension = 'jfif';
          quality = 0.92;
          break;
        case 'avif':
          mimeType = 'image/avif';
          extension = 'avif';
          quality = 0.85;
          break;
        default:
          mimeType = 'image/jpeg';
          extension = 'jpg';
      }

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl); // Clean up memory
        
        if (!blob) {
          // Fallback if browser doesn't support the format (e.g. AVIF in old browser)
          if (format === 'avif') {
             console.warn("AVIF not supported, conversion skipped for this format");
             // Resolve with null or handle error gracefully? 
             // For now, let's reject so we can filter it out
             reject(new Error("Format not supported"));
             return;
          }
          reject(new Error("Conversion failed"));
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const originalName = sourceFile.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        
        resolve({
          format,
          url,
          blob,
          size: blob.size,
          filename: `${nameWithoutExt}.${extension}`
        });
      }, mimeType, quality);
    };
    
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
  });
};

export const generateZip = async (allResults: ConversionResult[]): Promise<Blob> => {
  const zip = new JSZip();
  
  // Group by filename to avoid collisions if multiple source files have same name
  // Actually, we can just use the unique filenames generated.
  allResults.forEach(res => {
    zip.file(res.filename, res.blob);
  });

  return await zip.generateAsync({ type: "blob" });
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};