// TODO: replace with blockchain service API (engine stays in DocWeb)
// ============================================================================
// DocWeb — File Compression & Optimization Utility
// ============================================================================
// Client-side file processing: image compression, format detection,
// size estimation, and metadata extraction.
//
// Used by BlockchainPanel hash generator, document upload flows, etc.
// All processing runs in-browser using Canvas API and FileReader.
// ============================================================================

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export interface FileInfo {
  name: string;
  originalSize: number;
  optimizedSize: number;
  type: string;
  isImage: boolean;
  compressionRatio: number; // 0–1, lower = better compression
  dimensions?: { width: number; height: number };
}

export interface OptimizedFile {
  file: File;
  info: FileInfo;
  dataUrl?: string; // For image preview
}

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
const MAX_IMAGE_DIMENSION = 2048; // px — resize if larger
const JPEG_QUALITY = 0.82;
const WEBP_QUALITY = 0.80;

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function isImageFile(file: File): boolean {
  return IMAGE_TYPES.includes(file.type);
}

export function getFileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

// ────────────────────────────────────────────
// Image compression via Canvas
// ────────────────────────────────────────────

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function calculateResizedDimensions(
  width: number,
  height: number,
  maxDim: number
): { width: number; height: number } {
  if (width <= maxDim && height <= maxDim) return { width, height };
  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function compressImage(
  file: File,
  maxDimension = MAX_IMAGE_DIMENSION,
  quality = JPEG_QUALITY
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImage(file);
  const { width, height } = calculateResizedDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxDimension
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Enable image smoothing for quality downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Clean up object URL
  URL.revokeObjectURL(img.src);

  // Try WebP first (better compression), fall back to JPEG
  let outputType = 'image/webp';
  let outputQuality = WEBP_QUALITY;

  // If browser doesn't support WebP encoding, fall back
  const testBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/webp', WEBP_QUALITY);
  });

  if (!testBlob || testBlob.type !== 'image/webp') {
    outputType = 'image/jpeg';
    outputQuality = quality;
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
      outputType,
      outputQuality
    );
  });

  return { blob, width, height };
}

// ────────────────────────────────────────────
// Main: optimize a file
// ────────────────────────────────────────────

export async function optimizeFile(file: File): Promise<OptimizedFile> {
  const isImage = isImageFile(file);

  if (isImage) {
    try {
      const { blob, width, height } = await compressImage(file);
      const optimizedFile = new File([blob], file.name, { type: blob.type });
      const compressionRatio = blob.size / file.size;

      // Generate preview data URL
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      return {
        file: compressionRatio < 0.95 ? optimizedFile : file, // Only use optimized if meaningful savings
        info: {
          name: file.name,
          originalSize: file.size,
          optimizedSize: compressionRatio < 0.95 ? blob.size : file.size,
          type: file.type,
          isImage: true,
          compressionRatio: compressionRatio < 0.95 ? compressionRatio : 1,
          dimensions: { width, height },
        },
        dataUrl,
      };
    } catch {
      // If compression fails, return original
      return {
        file,
        info: {
          name: file.name,
          originalSize: file.size,
          optimizedSize: file.size,
          type: file.type,
          isImage: true,
          compressionRatio: 1,
        },
      };
    }
  }

  // Non-image: return as-is with metadata
  return {
    file,
    info: {
      name: file.name,
      originalSize: file.size,
      optimizedSize: file.size,
      type: file.type || 'application/octet-stream',
      isImage: false,
      compressionRatio: 1,
    },
  };
}

// ────────────────────────────────────────────
// Batch optimize
// ────────────────────────────────────────────

export async function optimizeFiles(files: File[]): Promise<OptimizedFile[]> {
  return Promise.all(files.map(optimizeFile));
}

// ────────────────────────────────────────────
// Get image dimensions without compression
// ────────────────────────────────────────────

export async function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!isImageFile(file)) return null;
  try {
    const img = await loadImage(file);
    const dims = { width: img.naturalWidth, height: img.naturalHeight };
    URL.revokeObjectURL(img.src);
    return dims;
  } catch {
    return null;
  }
}
