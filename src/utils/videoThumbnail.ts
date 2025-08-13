// Convert blob to base64 for storage
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Main thumbnail generation function using Canvas API
export const generateThumbnailWithCanvas = (
  videoUrl: string,
  timeInSeconds: number = 1
): Promise<{ url: string; base64: string }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Better CORS handling
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    
    // Add more attributes for better compatibility
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('playsinline', 'true');
    
    const cleanup = () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.src = '';
      video.load(); // Reset video element
    };

    const handleLoadedMetadata = () => {
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 640;
      
      // Ensure we don't seek beyond video duration
      const seekTime = Math.min(timeInSeconds, video.duration - 0.1);
      video.currentTime = Math.max(0, seekTime);
    };

    const handleCanPlay = () => {
      // Fallback if seeked event doesn't fire
      setTimeout(() => {
        if (video.readyState >= 2) {
          handleSeeked();
        }
      }, 100);
    };

    const handleSeeked = async () => {
      try {
        // Wait a bit for the frame to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const base64 = await blobToBase64(blob);
            cleanup();
            resolve({ url, base64 });
          } else {
            cleanup();
            reject(new Error('Failed to create thumbnail blob'));
          }
        }, 'image/jpeg', 0.8);
      } catch (err) {
        cleanup();
        reject(new Error('Failed to draw video frame: ' + err));
      }
    };

    const handleError = (e: Event) => {
      cleanup();
      reject(new Error('Video loading failed: ' + (e as ErrorEvent).message));
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    // Handle case where video fails to load
    const timeout = setTimeout(() => {
      if (video.readyState === 0) {
        cleanup();
        reject(new Error('Video loading timeout'));
      }
    }, 15000); // Increased timeout to 15 seconds

    // Clear timeout when video loads
    video.addEventListener('loadeddata', () => {
      clearTimeout(timeout);
    });

    video.src = videoUrl;
    video.load(); // Explicitly load the video
  });
};

// Simpler version for basic use cases
export const generateThumbnailSimple = (
  videoUrl: string,
  timeInSeconds: number = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('webkit-playsinline', 'true');

    const cleanup = () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
      video.src = '';
      video.load();
    };

    const handleLoadedData = () => {
      const seekTime = Math.min(timeInSeconds, video.duration - 0.1);
      video.currentTime = Math.max(0, seekTime);
    };

    const handleSeeked = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        cleanup();
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 640;

      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to create thumbnail'));
            }
          },
          'image/jpeg',
          0.8
        );
      } catch (err) {
        cleanup();
        reject(new Error('Failed to process video frame: ' + err));
      }
    };

    const handleError = () => {
      cleanup();
      reject(new Error('Video failed to load'));
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (video.readyState === 0) {
        cleanup();
        reject(new Error('Video loading timeout'));
      }
    }, 15000);

    video.addEventListener('loadeddata', () => {
      clearTimeout(timeout);
    });

    video.src = videoUrl;
    video.load();
  });
};