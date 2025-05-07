import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload images to Cloudinary
async function uploadToCloudinary(buffer: Buffer, folder = 'kiva/products') {
  return new Promise<any>((resolve, reject) => {
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
        resolve(result);
      }
    );

    // Convert buffer to stream and pipe to cloudinary
    const { Readable } = require('stream');
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

// Helper function to process and upload multiple images
async function processImages(formData: FormData): Promise<string[]> {
  const imageFiles = formData.getAll('images') as File[];
  const imageUrls: string[] = [];
  
  // Process each image file
  for (const file of imageFiles) {
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary
    try {
      const result = await uploadToCloudinary(buffer);
      imageUrls.push(result.secure_url);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  }
  
  return imageUrls;
}

// Helper function to extract public ID from Cloudinary URL
function getPublicIdFromUrl(url: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1612447684/kiva/products/sample.jpg
    const regex = /\/v\d+\/(.+)$/;
    const match = url.match(regex);
    return match ? match[1].split('.')[0] : null;
  } catch (error) {
    return null;
  }
}

// Helper function to delete image from Cloudinary
async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

// Create a new product
export async function POST(request: NextRequest) {
  try {
    // Check authentication and seller role
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden. Seller access required." }, { status: 403 });
    }
    
    // Parse form data
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const price = parseFloat(formData.get("price") as string);
    const discountPercentage = parseFloat(formData.get("discountPercentage") as string || "0");
    const stock = parseInt(formData.get("stock") as string);
    
    // Validate required fields
    if (!name || !description || !categoryId || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Validate price and stock
    if (price <= 0) {
      return NextResponse.json({ error: "Price must be greater than 0" }, { status: 400 });
    }
    
    if (stock < 1) {
      return NextResponse.json({ error: "Stock must be at least 1" }, { status: 400 });
    }
    
    // Process and upload images to Cloudinary
    const imageFiles = formData.getAll("images") as File[];
    
    if (imageFiles.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    }
    
    const imageUrls = await processImages(formData);
    
    // Create product in database
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        discountPercentage: discountPercentage || 0,
        stock,
        images: imageUrls, // Store Cloudinary URLs as JSON array
        sellerId: session.user.id,
        categoryId,
      },
    });
    
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
    // Check authentication and seller role
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden. Seller access required." }, { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Get seller's products with pagination
    const products = await prisma.product.findMany({
      where: {
        sellerId: session.user.id,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });
    
    // Get total count for pagination
    const total = await prisma.product.count({
      where: {
        sellerId: session.user.id,
      },
    });
    
    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
      // Check authentication and seller role
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      if (session.user.role !== "SELLER") {
        return NextResponse.json({ error: "Forbidden. Seller access required." }, { status: 403 });
      }
      
      // Parse form data
      const formData = await request.formData();
      
      const productId = formData.get("productId") as string;
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const categoryId = formData.get("categoryId") as string;
      const price = parseFloat(formData.get("price") as string);
      const discountPercentage = parseFloat(formData.get("discountPercentage") as string || "0");
      const stock = parseInt(formData.get("stock") as string);
      
      // Validate required fields
      if (!productId || !name || !description || !categoryId || isNaN(price) || isNaN(stock)) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      
      // Check if product exists and belongs to the seller
      const existingProduct = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });
      
      if (!existingProduct) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      
      if (existingProduct.sellerId !== session.user.id) {
        return NextResponse.json({ error: "You don't have permission to update this product" }, { status: 403 });
      }
      
      // Handle image updates
      const existingImages = existingProduct.images as string[];
      const keepImages = formData.getAll("keepImages") as string[];
      const newImageFiles = formData.getAll("newImages") as File[];
      
      let updatedImages = [...existingImages];
      
      // Remove images that are not in keepImages
      if (keepImages.length > 0) {
        const imagesToDelete = existingImages.filter(url => !keepImages.includes(url));
        
        // Delete removed images from Cloudinary
        for (const imageUrl of imagesToDelete) {
          try {
            const publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          } catch (error) {
            console.error("Error deleting image from Cloudinary:", error);
            // Continue with update even if deletion fails
          }
        }
        
        // Update the images array
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
        
        // Add new images to the updated images array
        updatedImages = [...updatedImages, ...newImageUrls];
      }
      
      // Ensure there's at least one image
      if (updatedImages.length === 0) {
        return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
      }
      
      // Update product in database
      const updatedProduct = await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          name,
          description,
          price,
          discountPercentage,
          stock,
          images: updatedImages,
          categoryId,
        },
      });
      
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
      // Check authentication and seller role
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      if (session.user.role !== "SELLER") {
        return NextResponse.json({ error: "Forbidden. Seller access required." }, { status: 403 });
      }
      
      // Get product ID from query parameters
      const { searchParams } = new URL(request.url);
      const productId = searchParams.get("id");
      
      if (!productId) {
        return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
      }
      
      // Check if product exists and belongs to the seller
      const existingProduct = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });
      
      if (!existingProduct) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      
      if (existingProduct.sellerId !== session.user.id) {
        return NextResponse.json({ error: "You don't have permission to delete this product" }, { status: 403 });
      }
      
      // Delete images from Cloudinary
      const images = existingProduct.images as string[];
      
      for (const imageUrl of images) {
        try {
          // Extract public ID from Cloudinary URL
          const publicId = extractPublicIdFromUrl(imageUrl);
          
          if (publicId) {
            // Delete image from Cloudinary
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
          // Continue with deletion even if image removal fails
        }
      }
      
      // Delete product from database
      await prisma.product.delete({
        where: {
          id: productId,
        },
      });
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      return NextResponse.json(
        { error: "An error occurred while deleting the product" },
        { status: 500 }
      );
    }
  }

  // Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
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