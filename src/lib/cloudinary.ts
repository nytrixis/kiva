import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  eager?: Array<{
    secure_url: string;
    public_id: string;
  }>;
}


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload buffer to Cloudinary
export async function uploadToCloudinary(
  buffer: Buffer, 
  resourceType: "image" | "video" = "image", 
  folder = "kiva/products"
) {
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      transformation: resourceType === "video" 
        ? [{ width: 720, crop: "limit" }, { quality: "auto" }]
        : [{ width: 1000, crop: "limit" }, { quality: "auto:good" }],
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve(result as CloudinaryUploadResult);
      }    );

    // Convert buffer to stream and pipe to cloudinary
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(publicId: string, resourceType: "image" | "video" = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

// Create thumbnail from video
export async function createThumbnailFromVideo(videoUrl: string) {
  try {
    const publicId = extractPublicIdFromUrl(videoUrl);
    if (!publicId) throw new Error("Could not extract public ID from video URL");
    
    return await cloudinary.uploader.explicit(
      publicId,
      {
        type: "upload",
        resource_type: "video",
        eager: [
          { 
            format: "jpg", 
            transformation: [
              { width: 720, height: 1280, crop: "fill" },
              { quality: "auto" }
            ]
          }
        ],
        eager_async: false,
      }
    );
  } catch (error) {
    console.error("Error creating thumbnail:", error);
    return null;
  }
}

// Extract public ID from Cloudinary URL
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
