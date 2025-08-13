import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for storage operations
);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const reelId = pathParts[pathParts.length - 2];

    const { thumbnailBase64 } = await req.json();

    if (!thumbnailBase64 || !reelId) {
      return NextResponse.json({ 
        error: "Thumbnail data and reel ID required" 
      }, { status: 400 });
    }

    // Check if reel exists and belongs to user
    const { data: reel, error: reelError } = await supabase
      .from("Reel")
      .select("id, influencerId")
      .eq("id", reelId)
      .single();

    if (reelError || !reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    // Verify ownership (optional - remove if anyone can generate thumbnails)
    const { data: profile } = await supabase
      .from("InfluencerProfile")
      .select("userId")
      .eq("id", reel.influencerId)
      .single();

    if (profile?.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Convert base64 to buffer
    const base64Data = thumbnailBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const fileName = `thumbnails/${reelId}_${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('reel-thumbnails')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false // Don't overwrite existing files
      });

    if (uploadError) {
      console.error("Error uploading thumbnail:", uploadError);
      return NextResponse.json({ 
        error: "Failed to upload thumbnail: " + uploadError.message 
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('reel-thumbnails')
      .getPublicUrl(fileName);

    // Update the reel with the thumbnail URL
    const { error: updateError } = await supabase
      .from("Reel")
      .update({ 
        thumbnailUrl: publicUrl,
        updatedAt: new Date().toISOString()
      })
      .eq("id", reelId);

    if (updateError) {
      console.error("Error updating reel with thumbnail:", updateError);
      
      // Clean up uploaded file if database update fails
      await supabase.storage
        .from('reel-thumbnails')
        .remove([fileName]);
        
      return NextResponse.json({ 
        error: "Failed to update reel: " + updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      thumbnailUrl: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error("Error in thumbnail upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing thumbnail
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const reelId = pathParts[pathParts.length - 2];

    const { data: reel, error } = await supabase
      .from("Reel")
      .select("thumbnailUrl")
      .eq("id", reelId)
      .single();

    if (error || !reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      thumbnailUrl: reel.thumbnailUrl 
    });

  } catch (error) {
    console.error("Error retrieving thumbnail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}