// src/components/dm/NewConversationModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Search, Users } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@supabase/supabase-js";
import { User } from "@/types/message";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NewConversationModalProps {
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export default function NewConversationModal({
  onClose,
  onConversationCreated,
}: NewConversationModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    setIsLoading(true);
    try {
      // ✅ Search in User table with joined profiles
      const { data, error } = await supabase
        .from("User")
        .select(`
          id, 
          name, 
          email, 
          image,
          sellerProfile:SellerProfile(businessName, logoImage),
          influencerProfile:InfluencerProfile(id, platform, image)
        `)
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;

      // ✅ Also search sellers by business name
      const { data: sellerData, error: sellerError } = await supabase
        .from("SellerProfile")
        .select(`
          userId,
          businessName,
          logoImage,
          user:User(id, name, email, image)
        `)
        .ilike("businessName", `%${searchQuery}%`)
        .limit(10);

      if (sellerError) console.error("Seller search error:", sellerError);

      // ✅ Combine and deduplicate results
      const allUsers: User[] = [...(data || [])];
      
      // Add sellers found by business name (avoid duplicates)
      if (sellerData) {
        sellerData.forEach(seller => {
          const userObj = Array.isArray(seller.user) ? seller.user[0] : seller.user;
          if (userObj && !allUsers.find(u => u.id === userObj.id)) {
            allUsers.push({
              id: userObj.id,
              name: userObj.name,
              email: userObj.email,
              image: userObj.image,
              sellerProfile: [{
                businessName: seller.businessName,
                logoImage: seller.logoImage
              }],
              influencerProfile: null
            });
          }
        });
      }

      setUsers(allUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const createConversation = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds: selectedUsers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error:", errorData);
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.existing) {
        toast({
          title: "Info",
          description: "Conversation already exists",
        });
      } else {
        toast({
          title: "Success",
          description: "Conversation created successfully",
        });
      }

      onConversationCreated(data.conversation.id);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create conversation",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getUserDisplayName = (user: User) => {
    const sellerProfile = user.sellerProfile?.[0];
    return sellerProfile?.businessName || user.name || user.email;
  };

  const getUserDisplayImage = (user: User) => {
    const sellerProfile = user.sellerProfile?.[0];
    const influencerProfile = user.influencerProfile?.[0];
    return sellerProfile?.logoImage || 
           influencerProfile?.image || 
           user.image || 
           "/images/placeholder-avatar.jpg";
  };

  const selectedUserObjects = users.filter(user => selectedUsers.includes(user.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">New Conversation</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Selected ({selectedUsers.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedUserObjects.map(user => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src={getUserDisplayImage(user)}
                      alt={getUserDisplayName(user)}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>
                  <span>{getUserDisplayName(user)}</span>
                  <button
                    onClick={() => toggleUserSelection(user.id)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery.length < 2 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Type at least 2 characters to search for users</p>
            </div>
          ) : isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <p>Searching...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => toggleUserSelection(user.id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedUsers.includes(user.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={getUserDisplayImage(user)}
                        alt={getUserDisplayName(user)}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    {selectedUsers.includes(user.id) && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <X className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createConversation}
              disabled={selectedUsers.length === 0 || isCreating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? "Creating..." : "Start Chat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}