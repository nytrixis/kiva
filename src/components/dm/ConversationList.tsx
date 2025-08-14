// src/components/dm/ConversationList.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Conversation } from "@/types/message";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) {
  const { data: session } = useSession();

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.userId !== session?.user?.id)?.user;
  };

  const getConversationName = (conversation: Conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) return "Unknown User";
    
    // ✅ Fix: Handle arrays properly
    const sellerProfile = otherParticipant.sellerProfile?.[0];
    return sellerProfile?.businessName || 
           otherParticipant.name || 
           otherParticipant.email || 
           "Unknown User";
  };

  const getConversationImage = (conversation: Conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) return "/images/placeholder-avatar.jpg";
    
    // ✅ Fix: Handle arrays properly
    const sellerProfile = otherParticipant.sellerProfile?.[0];
    const influencerProfile = otherParticipant.influencerProfile?.[0];
    
    return sellerProfile?.logoImage || 
           influencerProfile?.image || 
           otherParticipant.image || 
           "/images/placeholder-avatar.jpg";
  };

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start a new conversation to begin messaging</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
            selectedConversation === conversation.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
          }`}
        >
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={getConversationImage(conversation)}
                  alt={getConversationName(conversation)}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              {(conversation.unreadCount || 0) > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {(conversation.unreadCount || 0) > 9 ? '9+' : conversation.unreadCount}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-medium truncate ${
                  (conversation.unreadCount || 0) > 0 ? "text-gray-900" : "text-gray-700"
                }`}>
                  {getConversationName(conversation)}
                </h3>
                {conversation.lastMessage && (
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              {conversation.lastMessage && (
                <p className={`text-sm truncate mt-1 ${
                  (conversation.unreadCount || 0) > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                }`}>
                  {conversation.lastMessage.senderId === session?.user?.id ? "You: " : ""}
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}