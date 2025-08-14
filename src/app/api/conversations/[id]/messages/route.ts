import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { SendMessageRequest } from "@/types/message";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is participant
    const { data: participant } = await supabase
      .from("ConversationParticipant")
      .select("id")
      .eq("conversationId", conversationId)
      .eq("userId", session.user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // ✅ Get messages with seller/influencer profiles
    const { data: messages, error } = await supabase
      .from("Message")
      .select(`
        id,
        conversationId,
        senderId,
        content,
        messageType,
        isRead,
        createdAt,
        sender:User(
          id, 
          name, 
          image,
          sellerProfile:SellerProfile(businessName, logoImage),
          influencerProfile:InfluencerProfile(id, platform, image)
        )
      `)
      .eq("conversationId", conversationId)
      .order("createdAt", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mark messages as read
    await supabase
      .from("Message")
      .update({ isRead: true })
      .eq("conversationId", conversationId)
      .neq("senderId", session.user.id);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ Update the POST function:
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SendMessageRequest = await req.json();
    const { content, messageType = 'text' } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    // Verify user is participant
    const { data: participant } = await supabase
      .from("ConversationParticipant")
      .select("id")
      .eq("conversationId", conversationId)
      .eq("userId", session.user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // ✅ Send message with full user profile info
    const { data: message, error } = await supabase
      .from("Message")
      .insert([{
        conversationId,
        senderId: session.user.id,
        content: content.trim(),
        messageType
      }])
      .select(`
        id,
        conversationId,
        senderId,
        content,
        messageType,
        isRead,
        createdAt,
        sender:User(
          id, 
          name, 
          image,
          sellerProfile:SellerProfile(businessName, logoImage),
          influencerProfile:InfluencerProfile(id, platform, image)
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

