import { useState, useEffect } from 'react';
import { removeBackground, loadImageFromUrl } from '@/utils/backgroundRemoval';

interface TransparentLogoProps {
  src: string;
  alt: string;
  className?: string;
}

export function TransparentLogo({ src, alt, className }: TransparentLogoProps) {
  const [transparentSrc, setTransparentSrc] = useState<string>(src);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        console.log('Loading image for background removal...');
        
        const img = await loadImageFromUrl(src);
        console.log('Image loaded, removing background...');
        
        const blob = await removeBackground(img);
        const url = URL.createObjectURL(blob);
        
        setTransparentSrc(url);
        console.log('Background removed successfully');
      } catch (error) {
        console.error('Failed to remove background:', error);
        // Keep original image if background removal fails
        setTransparentSrc(src);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [src]);

  return (
    <img 
      src={transparentSrc}
      alt={alt}
      className={`${className} ${isProcessing ? 'opacity-75' : ''}`}
    />
  );
}
