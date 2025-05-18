import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { createClient } from "@supabase/supabase-js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

// Helper function to upload images to Cloudinary
async function uploadToCloudinary(buffer: Buffer, folder = 'kiva/products') {
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve(result as CloudinaryUploadResult);
      }
    );
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

async function processImages(formData: FormData): Promise<string[]> {
  const imageFiles = formData.getAll('images') as File[];
  const imageUrls: string[] = [];
  for (const file of imageFiles) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await uploadToCloudinary(buffer);
    imageUrls.push(result.secure_url);
  }
  return imageUrls;
}

async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

function extractPublicIdFromUrl(url: string): string | null {
  try {
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Create a new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden. Seller access required." }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const price = parseFloat(formData.get("price") as string);
    const discountPercentage = parseFloat(formData.get("discountPercentage") as string || "0");
    const stock = parseInt(formData.get("stock") as string);

    if (!name || !description || !categoryId || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (price <= 0) {
      return NextResponse.json({ error: "Price must be greater than 0" }, { status: 400 });
    }
    if (stock < 1) {
      return NextResponse.json({ error: "Stock must be at least 1" }, { status: 400 });
    }

    const imageFiles = formData.getAll("images") as File[];
    if (imageFiles.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    }
    const imageUrls = await processImages(formData);

    // Insert product into Supabase
    const { data: product, error } = await supabase
      .from("Product")
      .insert([{
        name,
        description,
        price,
        discountPercentage: discountPercentage || 0,
        stock,
        images: imageUrls,
        sellerId: session.user.id,
        categoryId: categoryId,
        createdAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the product" },
      { status: 500 }
    );
  }
}

// Get seller's products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden. Seller access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch products from Supabase
    const { data: products, error, count } = await supabase
      .from("Product")
      .select("*, category:categoryId(name)", { count: "exact" })
      .eq("sellerId", session.user.id)
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      products,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching products" },
      { status: 500 }
    );
  }
}

// Update a product
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden. Seller access required." }, { status: 403 });
    }

    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const price = parseFloat(formData.get("price") as string);
    const discountPercentage = parseFloat(formData.get("discountPercentage") as string || "0");
    const stock = parseInt(formData.get("stock") as string);

    if (!productId || !name || !description || !categoryId || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }


    // Fetch product to check ownership and get current images
    const { data: existingProduct, error: fetchError } = await supabase
      .from("Product")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (existingProduct.seller_id !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to update this product" }, { status: 403 });
    }

    const existingImages = existingProduct.images as string[];
    const keepImages = formData.getAll("keepImages") as string[];
    const newImageFiles = formData.getAll("newImages") as File[];

    let updatedImages = [...existingImages];

    // Remove images not in keepImages
    if (keepImages.length > 0) {
      const imagesToDelete = existingImages.filter(url => !keepImages.includes(url));
      for (const imageUrl of imagesToDelete) {
        try {
          const publicId = extractPublicIdFromUrl(imageUrl);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }
      updatedImages = existingImages.filter(url => keepImages.includes(url));
    }

    // Upload new images
    if (newImageFiles.length > 0) {
      const newImageUrls = await Promise.all(
        newImageFiles.map(async (file) => {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const result = await uploadToCloudinary(buffer);
          return result.secure_url;
        })
      );
      updatedImages = [...updatedImages, ...newImageUrls];
    }

    if (updatedImages.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    }

    // Update product in Supabase
    const { data: updatedProduct, error: updateError } = await supabase
      .from("Product")
      .update({
        name,
        description,
        price,
        discountPercentage,
        stock,
        images: updatedImages,
        categoryId: categoryId,
      })
      .eq("id", productId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the product" },
      { status: 500 }
    );
  }
}

// Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden. Seller access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Fetch product to check ownership and get images
    const { data: existingProduct, error: fetchError } = await supabase
      .from("Product")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (existingProduct.seller_id !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to delete this product" }, { status: 403 });
    }

    const images = existingProduct.images as string[];
    for (const imageUrl of images) {
      try {
        const publicId = extractPublicIdFromUrl(imageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    // Delete product from Supabase
    const { error: deleteError } = await supabase
      .from("Product")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the product" },
      { status: 500 }
    );
  }
}