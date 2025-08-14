// src/components/dm/ChatWindow.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Message } from "@/types/message";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ChatWindowProps {
  conversationId: string;
  onClose: () => void;
}

export default function ChatWindow({ conversationId, onClose }: ChatWindowProps) {
  const [allMessages, setAllMessages] = useState<(Message & { isOptimistic?: boolean })[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<{
    name: string | null;
    image: string | null;
  } | null>(null);
  
  const { data: session } = useSession();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchConversationDetails();

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `conversationId=eq.${conversationId}`
        },
        async (payload) => {
          const newMsg = payload.new;

          // Only process if it's not a message from the current user
          if (newMsg.senderId !== session?.user?.id) {
            const { data: senderData } = await supabase
              .from("User")
              .select(`
                id, 
                name, 
                email,
                image,
                sellerProfile:SellerProfile(businessName, logoImage),
                influencerProfile:InfluencerProfile(id, platform, image)
              `)
              .eq("id", newMsg.senderId)
              .single();

            if (senderData) {
              const newMessage: Message = {
                id: newMsg.id,
                conversationId: newMsg.conversationId,
                senderId: newMsg.senderId,
                content: newMsg.content,
                messageType: newMsg.messageType,
                isRead: newMsg.isRead,
                createdAt: newMsg.createdAt,
                sender: senderData
              };

              setAllMessages(prev => [...prev, newMessage]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, session?.user?.id]);


  useEffect(() => {
    scrollToBottom();
  }, [allMessages]); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        const fetchedMessages = data.messages || [];
        setAllMessages(fetchedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const fetchConversationDetails = async () => {
    try {
      const { data: participants, error } = await supabase
        .from("ConversationParticipant")
        .select(`
          user:User(
            id, 
            name, 
            image,
            sellerProfile:SellerProfile(businessName, logoImage),
            influencerProfile:InfluencerProfile(id, platform, image)
          )
        `)
        .eq("conversationId", conversationId)
        .neq("userId", session?.user?.id);

      if (error) {
        console.error("Error fetching participants:", error);
        return;
      }

      if (participants && participants.length > 0) {
        const participant = participants[0] as { 
          user: Array<{ 
            id: string; 
            name: string | null; 
            image: string | null;
            sellerProfile: Array<{ businessName: string; logoImage: string | null }>;
            influencerProfile: Array<{ id: string; platform: string; image: string | null }>;
          }>
        };

        const user = participant.user[0];
        if (!user) return;

        const sellerProfile = user.sellerProfile?.[0];
        const influencerProfile = user.influencerProfile?.[0];

        const profileImage = sellerProfile?.logoImage ||
                            influencerProfile?.image ||
                            user.image;

        const displayName = sellerProfile?.businessName ||
                          user.name;

        setOtherParticipant({
          name: displayName,
          image: profileImage
        });
      }
    } catch (error) {
      console.error("Error fetching conversation details:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    const optimisticMessage: Message & { isOptimistic: boolean } = {
      id: tempId,
      conversationId,
      senderId: session?.user?.id || '',
      content: messageContent,
      messageType: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: session?.user?.id || '',
        name: session?.user?.name || null,
        email: session?.user?.email || '',
        image: session?.user?.image || null,
        sellerProfile: null,
        influencerProfile: null,
      },
      isOptimistic: true
    };
    
    setAllMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageContent,
          messageType: "text"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      const data = await response.json();
      const realMessage = data.message;
      
      setAllMessages(prev => 
        prev.map(msg => 
            msg.id === optimisticMessage.id ? realMessage : msg
        )
      );

    } catch (error) {
      console.error("Error sending message:", error);
      setAllMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(messageContent);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full lg:hidden"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          {otherParticipant && (
            <>
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={otherParticipant.image || "/images/placeholder-avatar.jpg"}
                  alt={otherParticipant.name || "User"}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {otherParticipant.name || "Unknown User"}
                </h3>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-500">Loading messages...</span>
          </div>
        ) : (
          <>
            {allMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>No messages yet</p>
                <p className="text-sm mt-1">Send a message to start the conversation</p>
              </div>
            ) : (
              allMessages.map((message: Message & { isOptimistic?: boolean }) => {
                const isOwn = message.senderId === session?.user?.id;
                const isOptimistic = 'isOptimistic' in message && message.isOptimistic;
                
                const senderSellerProfile = message.sender.sellerProfile?.[0];
                const senderInfluencerProfile = message.sender.influencerProfile?.[0];
                
                const senderImage = senderSellerProfile?.logoImage ||
                                  senderInfluencerProfile?.image ||
                                  message.sender.image;
                
                const senderName = senderSellerProfile?.businessName ||
                                  message.sender.name;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} ${
                      isOptimistic ? "opacity-60" : "opacity-100"
                    } transition-opacity duration-200`}
                  >
                    {!isOwn && (
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                        <Image
                          src={senderImage || "/images/placeholder-avatar.jpg"}
                          alt={senderName || "User"}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                        isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {isOptimistic && isOwn && (
                        <div className="absolute -bottom-5 right-0 text-xs text-gray-400 flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400 mr-1"></div>
                          Sending...
                        </div>
                      )}
                      
                      {!isOwn && (
                        <p className="text-xs text-gray-500 mb-1">
                          {senderName || "Unknown User"}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <textarea
            ref={messageInputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-32"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className={`p-2 text-white rounded-lg transition-all duration-200 ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}