import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const folder = formData.get("folder") as string | undefined;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const result = await uploadToCloudinary(buffer, "image", folder || "kiva/influencer/kyc");
    return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}