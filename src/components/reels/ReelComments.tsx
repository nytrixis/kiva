"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
    sellerProfile: {
          businessName: string;
          logoImage: string;
          select: {
            businessName: true,
            logoImage: true,
          },
        },
  };
}

interface ReelCommentsProps {
  reelId: string;
  onClose: () => void;
}

export default function ReelComments({ reelId, onClose }: ReelCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/reels/${reelId}/comments`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
        
        const data = await response.json();
        setComments(data.comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchComments();
  }, [reelId, toast]);
  
  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);
  
  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment",
        variant: "destructive",
      });
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/reels/${reelId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add comment");
      }
      
      const data = await response.json();
      setComments(prev => [data.comment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Comments</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isFetching ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
  src={
    comment.user.sellerProfile?.logoImage || 
    comment.user.image || 
    "/images/placeholder-avatar.jpg"
  }
  alt={comment.user.sellerProfile?.businessName || comment.user.name || "User"}
  fill
  className="object-cover"
/>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="font-medium text-sm">{comment.user.name}</p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                                        <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 resize-none"
              rows={1}
              maxLength={500}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={isLoading || !newComment.trim()}
              className="ml-2 bg-primary hover:bg-primary/90 p-2 rounded-full"
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

