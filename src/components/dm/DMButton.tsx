"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import DMModal from "./DMModal";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DMButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    // Fetch initial unread count
    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `senderId=neq.${session.user.id}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user]);

  const fetchUnreadCount = async () => {
    if (!session?.user) return;

    try {
      // Get user's conversations
      const { data: conversations } = await supabase
        .from("ConversationParticipant")
        .select("conversationId")
        .eq("userId", session.user.id);

      if (!conversations?.length) return;

      const conversationIds = conversations.map(c => c.conversationId);

      // Get unread messages count
      const { data: unreadMessages } = await supabase
        .from("Message")
        .select("id")
        .in("conversationId", conversationIds)
        .eq("isRead", false)
        .neq("senderId", session.user.id);

      setUnreadCount(unreadMessages?.length || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  if (!session?.user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <DMModal 
          onClose={() => setIsOpen(false)} 
          onUnreadCountUpdate={setUnreadCount}
        />
      )}
    </>
  );
}