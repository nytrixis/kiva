import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream'; // Add this import at the top of the file

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  asset_id?: string;
  version?: number;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  url?: string;
  bytes?: number;
  etag?: string;
  placeholder?: boolean;
  original_filename?: string;
}


// Helper function to upload buffer to Cloudinary
export async function uploadToCloudinary(buffer: Buffer, folder = 'kiva/products') {
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, crop: 'limit' }, // Resize to max width 1000px
          { quality: 'auto:good' }, // Optimize quality
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve(result as CloudinaryUploadResult);
      }    );

    // Convert buffer to stream and pipe to cloudinary
    // Use the imported Readable instead of require()
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

// Helper function to delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

// Helper function to extract public ID from Cloudinary URL
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/cloud-name/image/upload/v1612345678/folder/image-id.jpg
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}
