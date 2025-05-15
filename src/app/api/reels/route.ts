import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Get reels with pagination using cursor
    const reels = await prisma.reel.findMany({
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            sellerProfile: {
              select: {
                businessName: true,
                logoImage: true,
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            discountPercentage: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });
    
    // Get the next cursor
    const nextCursor = reels.length === limit ? reels[reels.length - 1].id : null;
    
    // Transform reels to include isLiked
    const transformedReels = reels.map(reel => ({
      ...reel,
      isLiked: reel.likes.length > 0,
      likes: undefined, // Remove the likes array
    }));
    
    return NextResponse.json({
      reels: transformedReels,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching reels:", error);
    return NextResponse.json(
      { error: "Failed to fetch reels" },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is a seller
    if (session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Only sellers can upload reels" },
        { status: 403 }
      );
    }
    
    const formData = await req.formData();
    const videoFile = formData.get("video") as File;
    const caption = formData.get("caption") as string;
    const productId = formData.get("productId") as string;
    
    if (!videoFile) {
      return NextResponse.json(
        { error: "Video file is required" },
        { status: 400 }
      );
    }
    
    // Upload video to Cloudinary
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const videoUploadResult = await uploadToCloudinary(
      videoBuffer,
      "video",
      "kiva/reels"
    );
    
    // Create thumbnail from video
    const thumbnailUploadResult = await createThumbnailFromVideo(
      videoUploadResult.secure_url
    );
    
    // Create reel in database
    const reel = await prisma.reel.create({
      data: {
        videoUrl: videoUploadResult.secure_url,
        videoPublicId: videoUploadResult.public_id,
        thumbnailUrl: thumbnailUploadResult?.eager?.[0]?.secure_url,
        thumbnailPublicId: thumbnailUploadResult?.eager?.[0]?.public_id,
        caption,
        userId: session.user.id,
        productId: productId || undefined,
      },
    });
    
    return NextResponse.json({ success: true, reel }, { status: 201 });
  } catch (error) {
    console.error("Error uploading reel:", error);
    return NextResponse.json(
      { error: "Failed to upload reel" },
      { status: 500 }
    );
  }
}

// Helper function to upload to Cloudinary
async function uploadToCloudinary(
  buffer: Buffer,
  resourceType: "image" | "video" = "image",
  folder = "kiva/reels") {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: resourceType === "video"
          ? [{ width: 720, crop: "limit" }, { quality: "auto" }]
          : [{ width: 720, height: 1280, crop: "fill" }, { quality: "auto" }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

// Helper function to create thumbnail from video
async function createThumbnailFromVideo(videoUrl: string) {
  try {
    return await cloudinary.uploader.explicit(
      videoUrl,
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
