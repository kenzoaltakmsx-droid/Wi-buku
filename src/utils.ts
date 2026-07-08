import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<File> {
  return new Promise((resolve) => {
    // If the file is not an image, resolve immediately with the original file
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions keeping aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // Fallback to original file
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress image as WebP (or fallback to JPEG if WebP not supported)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Create a new File object
            const extension = 'webp';
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "." + extension, {
              type: 'image/' + extension,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Sanitizes and fixes typos in URLs (e.g., htttps:// instead of https://)
 * to ensure that uploaded profile pictures and banners display correctly.
 */
export function fixUrlTypo(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  
  // Replace triple-t "htttps://" with "https://"
  if (url.startsWith('htttps://')) {
    return url.replace('htttps://', 'https://');
  }
  
  // Replace double slash typos in protocol if any
  if (url.match(/^https?:\/+[^\/]/)) {
    return url.replace(/^http:\/+/, 'http://').replace(/^https:\/+/, 'https://');
  }
  
  return url;
}


