"use client";

import { useState, useEffect } from "react";
import { X, Search, Plus } from "lucide-react";
import { Conversation } from "@/types/message";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import NewConversationModal from "./NewConversationModal";
import { MessageCircle } from "lucide-react";

interface DMModalProps {
  onClose: () => void;
  onUnreadCountUpdate: (count: number) => void;
}

export default function DMModal({ onClose, onUnreadCountUpdate }: DMModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        
        // Update unread count
        const totalUnread = (data.conversations || []).reduce(
          (sum: number, conv: Conversation) => sum + (conv.unreadCount || 0), 
          0
        );
        onUnreadCountUpdate(totalUnread);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const handleNewConversation = (conversationId: string) => {
    setShowNewConversation(false);
    setSelectedConversation(conversationId);
    fetchConversations();
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    return conv.participants.some(p => 
      p.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[600px] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation}
              onClose={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <NewConversationModal
          onClose={() => setShowNewConversation(false)}
          onConversationCreated={handleNewConversation}
        />
      )}
    </div>
  );
}