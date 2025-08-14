// src/types/message.ts
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  // ✅ These should be arrays since Supabase returns arrays for one-to-many relations
  sellerProfile?: Array<{ businessName: string; logoImage: string | null }> | null;
  influencerProfile?: Array<{ id: string; platform: string; image: string | null }> | null;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: string;
  user: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: string;
  sender: User; // ✅ Use the same User interface
}

export interface CreateConversationRequest {
  participantIds: string[];
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
}