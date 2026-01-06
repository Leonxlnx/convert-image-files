export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'jfif' | 'avif';

export interface ConversionResult {
  format: ImageFormat;
  url: string;
  blob: Blob; // Needed for zipping
  size: number;
  filename: string;
}

export interface ProcessedFile {
  id: string;
  sourceName: string;
  sourceSize: number;
  previewUrl: string;
  results: ConversionResult[];
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  total: number;
}