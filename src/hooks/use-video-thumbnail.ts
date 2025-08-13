import { useState, useEffect } from 'react';
import { generateThumbnailWithCanvas } from '@/utils/videoThumbnail';

export const useVideoThumbnail = (videoUrl: string, reelId?: string) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateThumbnail = async () => {
      if (!videoUrl) return;

      // Check for cached thumbnail with error handling
      const cacheKey = `thumbnail_${reelId}`;
    let cachedThumbnail: string | null = null;
      
      try {
        cachedThumbnail = localStorage.getItem(cacheKey);
        // Validate cached URL is still valid
        if (cachedThumbnail && cachedThumbnail.startsWith('blob:')) {
          // Check if blob URL is still valid by creating an image
          const img = new Image();
          img.onload = () => setThumbnailUrl(cachedThumbnail);
          img.onerror = () => {
            // Blob URL expired, remove from cache
            localStorage.removeItem(cacheKey);
            generateNewThumbnail();
          };
          img.src = cachedThumbnail;
          return;
        } else if (cachedThumbnail && cachedThumbnail.startsWith('http')) {
          // Valid permanent URL
          setThumbnailUrl(cachedThumbnail);
          return;
        }
      } catch (storageError) {
        console.warn('localStorage access failed:', storageError);
      }

      generateNewThumbnail();
    };

    const generateNewThumbnail = async () => {
      setIsGenerating(true);
      setError(null);

      try {
        // Generate thumbnail with both blob URL and base64
        const { url: blobUrl, base64 } = await generateThumbnailWithCanvas(videoUrl, 1);
        
        // Set immediate blob URL for instant display
        setThumbnailUrl(blobUrl);
        
        // Cache with error handling
        try {
          const cacheKey = `thumbnail_${reelId}`;
          localStorage.setItem(cacheKey, blobUrl);
        } catch (storageError) {
          console.warn('Failed to cache thumbnail:', storageError);
        }

        // Upload to storage and save to database (only if reelId provided)
        if (reelId) {
          try {
            const response = await fetch(`/api/reels/${reelId}/thumbnail`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                thumbnailBase64: base64,
                reelId: reelId 
              }),
            });

            if (response.ok) {
              const data = await response.json();
              
              if (data.thumbnailUrl) {
                // Update with permanent URL from storage
                setThumbnailUrl(data.thumbnailUrl);
                
                try {
                  const cacheKey = `thumbnail_${reelId}`;
                  localStorage.setItem(cacheKey, data.thumbnailUrl);
                } catch (storageError) {
                  console.warn('Failed to cache permanent URL:', storageError);
                }
                
                // Clean up the temporary blob URL
                URL.revokeObjectURL(blobUrl);
              }
            } else {
              console.warn('Failed to save thumbnail to storage, using local blob URL');
            }
          } catch (uploadError) {
            console.warn('Thumbnail upload failed, using local version:', uploadError);
            // Continue with local blob URL
          }
        }
        
      } catch (err) {
        console.error('Thumbnail generation failed:', err);
        setError('Failed to generate thumbnail');
      } finally {
        setIsGenerating(false);
      }
    };

    generateThumbnail();
  }, [videoUrl, reelId]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [thumbnailUrl]);

  return { thumbnailUrl, isGenerating, error };
};