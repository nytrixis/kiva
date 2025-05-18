import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  eager?: Array<{
    secure_url: string;
    public_id: string;
  }>;
}

interface User {
  id: string;
  name: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | string;
  discountPercentage?: number;
}

interface Reel {
  id: string;
  user?: User;
  product?: Product;
  createdAt: string;
}

interface Like {
  id: string;
  userId: string;
  reelId: string;
}

interface Comment {
  id: string;
  reelId: string;
}

interface SellerProfile {
  userId: string;
  businessName: string;
  logoImage?: string;
}


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10");

    // 1. Fetch reels with user and product info only
    let query = supabase
      .from("Reel")
      .select(`
        *,
        user:userId (
          id, name, image
        ),
        product:productId (
          id, name, price, images, discountPercentage
        )
      `)
      .order("createdAt", { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt("id", cursor);
    }

    const { data: reels, error } = await query;
    if (error) throw error;

    const reelIds = (reels || []).map((reel: Reel) => reel.id);

    // 2. Fetch all likes for these reels
    const likesMap: Record<string, Like[]> = {};
    if (reelIds.length > 0) {
      const { data: likes } = await supabase
        .from("reel_like")
        .select("id, userId, reelId")
        .in("reelId", reelIds);
      if (likes) {
        for (const like of likes) {
          if (!likesMap[like.reelId]) likesMap[like.reelId] = [];
          likesMap[like.reelId].push(like);
        }
      }
    }

    // 3. Fetch all comments for these reels
    const commentsMap: Record<string, Comment[]> = {};
    if (reelIds.length > 0) {
      const { data: comments } = await supabase
        .from("reel_comment")
        .select("id, reelId")
        .in("reelId", reelIds);
      if (comments) {
        for (const comment of comments) {
          if (!commentsMap[comment.reelId]) commentsMap[comment.reelId] = [];
          commentsMap[comment.reelId].push(comment);
        }
      }
    }

    // 4. Fetch seller profiles for all unique userIds
    const userIds = [...new Set((reels || []).map((reel: Reel) => reel.user?.id).filter(Boolean))];
    const sellerProfiles: Record<string, SellerProfile> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("SellerProfile")
        .select("userId, businessName, logoImage, id")
        .in("userId", userIds);
      if (profiles) {
        for (const profile of profiles) {
          sellerProfiles[profile.userId] = profile;
        }
      }
    }

    // 5. Merge everything
    const transformedReels = (reels || []).map((reel: Reel) => {
      const likes = likesMap[reel.id] || [];
      const comments = commentsMap[reel.id] || [];
      return {
        ...reel,
        user: reel.user
          ? {
              ...reel.user,
              sellerProfile: sellerProfiles[reel.user.id] || null,
            }
          : null,
          likes,
          comments,
        isLiked: likes.some((like: Like) => like.userId === session.user.id),
        likeCount: likes.length,
        commentCount: comments.length,
      };
    });

    const nextCursor = reels && reels.length === limit ? reels[reels.length - 1].id : null;

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

    // Create reel in Supabase
    const { data: reel, error: reelError } = await supabase
      .from("Reel")
      .insert([{
        videoUrl: videoUploadResult.secure_url,
        videoPublicId: videoUploadResult.public_id,
        thumbnailUrl: thumbnailUploadResult?.eager?.[0]?.secure_url,
        thumbnailPublicId: thumbnailUploadResult?.eager?.[0]?.public_id,
        caption,
        userId: session.user.id,
        productId: productId || null,
      }])
      .select()
      .single();

    if (reelError) {
      throw reelError;
    }

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
  folder = "kiva/reels"
) {
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
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
        if (!result) return reject(new Error("No result from Cloudinary"));
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
    return await cloudinary.uploader.explicit(videoUrl, {
      type: "upload",
      resource_type: "video",
      eager: [
        {
          format: "jpg",
          transformation: [
            { width: 720, height: 1280, crop: "fill" },
            { quality: "auto" },
          ],
        },
      ],
      eager_async: false,
    });
  } catch (error: unknown) {
    console.error("Error creating thumbnail:", error);
    return null;
  }
}