import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { CreateConversationRequest } from "@/types/message";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ First get conversations where user is a participant
    const { data: userConversations, error: participantError } = await supabase
      .from("ConversationParticipant")
      .select("conversationId")
      .eq("userId", session.user.id);

    if (participantError) {
      return NextResponse.json({ error: participantError.message }, { status: 500 });
    }

    if (!userConversations || userConversations.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const conversationIds = userConversations.map(uc => uc.conversationId);

    // ✅ Get conversations with participants including seller/influencer profiles
    const { data: conversations, error } = await supabase
      .from("Conversation")
      .select(`
        id,
        createdAt,
        updatedAt,
        participants:ConversationParticipant(
          id,
          userId,
          joinedAt,
          user:User(
            id, 
            name, 
            email, 
            image,
            sellerProfile:SellerProfile(businessName, logoImage),
            influencerProfile:InfluencerProfile(id, platform, image)
          )
        )
      `)
      .in("id", conversationIds)
      .order("updatedAt", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get last message for each conversation
    const { data: lastMessages } = await supabase
      .from("Message")
      .select(`
        id,
        conversationId,
        content,
        createdAt,
        senderId,
        sender:User(
          id, 
          name, 
          image,
          sellerProfile:SellerProfile(businessName, logoImage),
          influencerProfile:InfluencerProfile(id, platform, image)
        )
      `)
      .in("conversationId", conversationIds)
      .order("createdAt", { ascending: false });

    // Get unread counts
    const { data: unreadCounts } = await supabase
      .from("Message")
      .select("conversationId")
      .in("conversationId", conversationIds)
      .eq("isRead", false)
      .neq("senderId", session.user.id);

    // Combine data
    const conversationsWithDetails = conversations?.map(conversation => {
      const lastMessage = lastMessages?.find(msg => msg.conversationId === conversation.id);
      const unreadCount = unreadCounts?.filter(msg => msg.conversationId === conversation.id).length || 0;
      
      return {
        ...conversation,
        lastMessage,
        unreadCount
      };
    });

    return NextResponse.json({ conversations: conversationsWithDetails });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateConversationRequest = await req.json();
    const { participantIds } = body;

    if (!participantIds || participantIds.length === 0) {
      return NextResponse.json({ error: "Participant IDs required" }, { status: 400 });
    }

    // Add current user to participants if not included
    const allParticipants = [...new Set([session.user.id, ...participantIds])];

    // Check if conversation already exists with these exact participants
    const { data: existingConversations } = await supabase
      .from("Conversation")
      .select(`
        id,
        participants:ConversationParticipant(userId)
      `);

    const existingConversation = existingConversations?.find(conv => {
      const participantUserIds = conv.participants.map(p => p.userId);
      return participantUserIds.length === allParticipants.length &&
             allParticipants.every(id => participantUserIds.includes(id));
    });

    if (existingConversation) {
      return NextResponse.json({ 
        conversation: { id: existingConversation.id },
        existing: true 
      });
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from("Conversation")
      .insert([{}])
      .select()
      .single();

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 });
    }

    // Add participants
    const participantInserts = allParticipants.map(userId => ({
      conversationId: conversation.id,
      userId
    }));

    const { error: participantError } = await supabase
      .from("ConversationParticipant")
      .insert(participantInserts);

    if (participantError) {
      return NextResponse.json({ error: participantError.message }, { status: 500 });
    }

    return NextResponse.json({ conversation, existing: false });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}