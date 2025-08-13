"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  ExternalLink,
  Grid3X3,
  User,
  Calendar,
  Instagram,
  CheckCircle,
  Plus,
  Settings,
  Play,
  X,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useVideoThumbnail } from "@/hooks/use-video-thumbnail";

interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
    discountPercentage: number;
  } | null;
}

interface InfluencerProfile {
  id: string;
  name: string;
  bio?: string;
  image?: string;
  platform: string;
  profileLink?: string;
  followersCount: number;
  status: string;
  createdAt: string;
  stats: {
    totalReels: number;
    totalLikes: number;
    totalComments: number;
    followers: number;
  };
}

interface InfluencerProfileClientProps {
  initialData: {
    profile: InfluencerProfile;
    reels: Reel[];
  };
  influencerId: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

interface ReelModalProps {
  reel: Reel;
  onClose: () => void;
  onLike: (liked: boolean) => void;
  isLiked: boolean;
  profile: InfluencerProfile;
}

// Reel Grid Item Component with Thumbnail Generation
function ReelGridItem({ reel, onClick }: { reel: Reel; onClick: () => void }) {
  const { thumbnailUrl, isGenerating, error } = useVideoThumbnail(reel.videoUrl, reel.id);
  
  // Use existing thumbnailUrl as fallback
  const displayThumbnail = thumbnailUrl || reel.thumbnailUrl;

  return (
    <div 
      onClick={onClick}
      className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {displayThumbnail ? (
        <Image
          src={displayThumbnail}
          alt={reel.caption || "Reel"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
          onError={() => {
            // If image fails to load, trigger thumbnail regeneration
            console.warn('Thumbnail failed to load, will regenerate');
          }}
        />
      ) : isGenerating ? (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <Play className="h-8 w-8 text-gray-400" />
          <span className="text-xs text-gray-500 absolute bottom-2">Failed to load</span>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <Play className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/20 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Play className="h-5 w-5 text-white fill-white" />
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Heart className="h-3 w-3 mr-1 fill-white" />
              <span className="font-medium">{reel.likeCount}</span>
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-3 w-3 mr-1" />
              <span className="font-medium">{reel.commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReelModal({ reel, onClose, onLike, isLiked, profile }: ReelModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLiked, setCurrentLiked] = useState(isLiked);
  const [currentLikeCount, setCurrentLikeCount] = useState(reel.likeCount);

  // Update local state when props change
  useEffect(() => {
    setCurrentLiked(isLiked);
    setCurrentLikeCount(reel.likeCount);
  }, [isLiked, reel.likeCount]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/reels/${reel.id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [reel.id]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like reels",
        variant: "destructive",
      });
      return;
    }

    const newLikedState = !currentLiked;
    const newCount = currentLikeCount + (newLikedState ? 1 : -1);
    
    // Optimistic update
    setCurrentLiked(newLikedState);
    setCurrentLikeCount(newCount);
    onLike(newLikedState);

    try {
      const response = await fetch(`/api/reels/${reel.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: newLikedState }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      const data = await response.json();
      setCurrentLiked(data.liked);
      setCurrentLikeCount(data.likeCount);
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setCurrentLiked(!newLikedState);
      setCurrentLikeCount(currentLikeCount);
      onLike(!newLikedState);
      
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reels/${reel.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.comment, ...comments]);
        setNewComment("");
        
        toast({
          title: "Comment added",
          description: "Your comment has been posted",
          variant: "default",
        });
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key for comment submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmitComment();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-xl max-w-5xl w-full h-[90vh] flex overflow-hidden shadow-2xl"
      >
        {/* Video Section */}
        <div className="flex-1 bg-black flex items-center justify-center">
          <video
            src={reel.videoUrl}
            controls
            autoPlay
            muted
            loop
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Comments Section */}
        <div className="w-80 bg-background border-l border-gray-200 flex flex-col">
          {/* User Profile Section */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              <Image
                src={profile.image || "/images/placeholder-avatar.jpg"}
                alt={profile.name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-primary truncate">{profile.name}</span>
                {profile.status === "APPROVED" && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex items-center text-xs text-primary/70 gap-1">
                <Instagram className="h-3 w-3" />
                <span>@{profile.platform}</span>
              </div>
            </div>
            {profile.profileLink && (
              <a
                href={profile.profileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-primary">Comments</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Caption */}
          {reel.caption && (
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">{reel.caption}</p>
            </div>
          )}

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {comment.user.image ? (
                      <Image
                        src={comment.user.image}
                        alt={comment.user.name}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-primary">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs">Be the first to comment!</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 transition-colors ${
                  currentLiked ? "text-primary" : "text-gray-500 hover:text-primary"
                }`}
              >
                <Heart className={`h-5 w-5 transition-all duration-200 ${
                  currentLiked ? "fill-primary text-primary scale-110" : ""
                }`} />
                <span className="text-sm font-medium">{currentLikeCount}</span>
              </button>
              <div className="flex items-center gap-1 text-gray-500">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{comments.length}</span>
              </div>
            </div>

            {/* Comment Input */}
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add a comment... (Ctrl+Enter to submit)"
                className="flex-1 min-h-[2.5rem] max-h-20 resize-none"
                disabled={isSubmitting}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
                size="sm"
                className="self-end"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function InfluencerProfileClient({
  initialData,
  influencerId,
}: InfluencerProfileClientProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile] = useState<InfluencerProfile>(initialData.profile);
  const [reels, setReels] = useState<Reel[]>(initialData.reels);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [activeTab, setActiveTab] = useState<"reels" | "about">("reels");
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [reelLikes, setReelLikes] = useState<Record<string, boolean>>({});

  // Fetch user's like status for all reels
  useEffect(() => {
    const fetchLikeStatuses = async () => {
      if (!user || reels.length === 0) return;

      try {
        const reelIds = reels.map(r => r.id);
        const response = await fetch('/api/reels/likes/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reelIds }),
        });

        if (response.ok) {
          const data = await response.json();
          setReelLikes(data.likes);
        }
      } catch (error) {
        console.error('Error fetching like statuses:', error);
      }
    };

    fetchLikeStatuses();
  }, [user, reels]);

  // Fetch platform followers count
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await fetch(`/api/influencer/${influencerId}/followers`);
        if (response.ok) {
          const data = await response.json();
          setFollowerCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    };

    fetchFollowers();
  }, [influencerId]);

  // Check if user is following this influencer
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          `/api/influencer/follow?influencerId=${influencerId}`
        );
        const data = await response.json();
        setIsFollowing(data.following);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    checkFollowStatus();
  }, [user, influencerId]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to follow influencers",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingFollow(true);

    try {
      const response = await fetch("/api/influencer/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ influencerId }),
      });

      const data = await response.json();
      setIsFollowing(data.following);
      setFollowerCount(prev => data.following ? prev + 1 : prev - 1);

      toast({
        title: data.following ? "Following!" : "Unfollowed",
        description: data.following
          ? `You are now following ${profile.name}`
          : `You unfollowed ${profile.name}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleReelClick = (reel: Reel) => {
    setSelectedReel(reel);
  };

  const handleLike = (reelId: string, liked: boolean) => {
    setReelLikes(prev => ({ ...prev, [reelId]: liked }));
    
    // Update reel count locally
    setReels(prev => 
      prev.map(reel => 
        reel.id === reelId 
          ? { ...reel, likeCount: reel.likeCount + (liked ? 1 : -1) }
          : reel
      )
    );

    // Update selected reel if it matches
    if (selectedReel?.id === reelId) {
      setSelectedReel(prev => 
        prev ? { ...prev, likeCount: prev.likeCount + (liked ? 1 : -1) } : null
      );
    }
  };

  const isOwnProfile = user?.id === influencerId;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Layout */}
          <div className="block md:hidden py-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Profile Picture */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                  <Image
                    src={profile.image || "/images/placeholder-avatar.jpg"}
                    alt={profile.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="96px"
                  />
                </div>
                {profile.status === "APPROVED" && (
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 border-2 border-background">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.div>

              {/* Name and Username */}
              <div>
                <h1 className="text-xl font-bold text-primary mb-1">
                  {profile.name}
                </h1>
                <div className="flex items-center justify-center text-primary/70">
                  <Instagram className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">@{profile.platform}</span>
                  {profile.profileLink && (
                    <a
                      href={profile.profileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-8 py-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {profile.stats.totalReels}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">reels</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {followerCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {profile.stats.totalLikes}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">likes</div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="text-gray-700 text-sm max-w-xs">
                  <p className="whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 w-full max-w-xs">
                {isOwnProfile ? (
                  <>
                    <Link href="/dashboard/influencer/profile" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link href="/dashboard/influencer/reels">
                      <Button size="sm" className="px-3">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    onClick={handleFollow}
                    disabled={isLoadingFollow}
                    size="sm"
                    variant={isFollowing ? "outline" : "default"}
                      className={`w-full ${!isFollowing ? "text-background" : ""}`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block py-8">
            <div className="flex items-start gap-8 lg:gap-12">
              {/* Profile Picture */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative flex-shrink-0"
              >
                <div className="relative h-32 w-32 lg:h-40 lg:w-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
                  <Image
                    src={profile.image || "/images/placeholder-avatar.jpg"}
                    alt={profile.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 128px, 160px"
                  />
                </div>
                {profile.status === "APPROVED" && (
                  <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 border-3 border-background shadow-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </motion.div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                {/* Name and Actions Row */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                      {profile.name}
                    </h1>
                    <div className="flex items-center text-primary/70">
                      <Instagram className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">@{profile.platform}</span>
                      {profile.profileLink && (
                        <a
                          href={profile.profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {isOwnProfile ? (
                      <>
                        <Link href="/dashboard/influencer/profile">
                          <Button variant="outline" size="sm" className="font-medium">
                            <Settings className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        </Link>
                        <Link href="/dashboard/influencer/reels">
                          <Button size="sm" className="font-medium text-background">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Reel
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Button
                        onClick={handleFollow}
                        disabled={isLoadingFollow}
                        size="sm"
                        variant={isFollowing ? "outline" : "default"}
                          className={`w-full ${!isFollowing ? "text-background" : ""}`}

                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-8 mb-6">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-primary">
                      {profile.stats.totalReels}
                    </span>
                    <span className="text-gray-600 text-sm">reels</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-primary">
                      {followerCount.toLocaleString()}
                    </span>
                    <span className="text-gray-600 text-sm">followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-primary">
                      {profile.stats.totalLikes}
                    </span>
                    <span className="text-gray-600 text-sm">likes</span>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="text-gray-700 mb-4 leading-relaxed">
                    <p className="whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                )}

                {/* Member Since */}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Member since {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-background border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab("reels")}
              className={`flex items-center px-4 sm:px-6 py-4 border-b-2 transition-all duration-200 font-medium text-sm ${
                activeTab === "reels"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">REELS</span>
              <span className="sm:hidden">POSTS</span>
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`flex items-center px-4 sm:px-6 py-4 border-b-2 transition-all duration-200 font-medium text-sm ${
                activeTab === "about"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              ABOUT
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "reels" ? (
          <>
            {reels.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                {reels.map((reel, index) => (
                  <motion.div
                    key={reel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <ReelGridItem 
                      reel={reel} 
                      onClick={() => handleReelClick(reel)} 
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Grid3X3 className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-3">No reels yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    {isOwnProfile
                      ? "Start creating reels to showcase your content and connect with your audience"
                      : `${profile.name} hasn't posted any reels yet. Check back later for new content!`}
                  </p>
                  {isOwnProfile && (
                    <div className="mt-6">
                      <Link href="/dashboard/influencer/reels">
                        <Button className="font-medium">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Reel
                        </Button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-background rounded-2xl shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-primary mb-8">About {profile.name}</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-primary mb-3 text-lg">Bio</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {profile.bio || "No bio available"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-3 text-lg">Platform</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-primary/10 rounded-lg p-2 mr-3">
                        <Instagram className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-primary">@{profile.platform}</div>
                        <div className="text-sm text-gray-500">Instagram</div>
                      </div>
                    </div>
                    {profile.profileLink && (
                      <a
                        href={profile.profileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                      >
                        Visit Profile
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-3 text-lg">Statistics</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-6 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {profile.stats.totalReels}
                    </div>
                    <div className="text-sm text-primary/70 font-medium mt-1">Total Reels</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-6 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {followerCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-primary/70 font-medium mt-1">Followers</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-6 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {profile.stats.totalLikes}
                    </div>
                    <div className="text-sm text-primary/70 font-medium mt-1">Total Likes</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-6 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {profile.stats.totalComments}
                    </div>
                    <div className="text-sm text-primary/70 font-medium mt-1">Comments</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-3 text-lg">Member Since</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center text-gray-700">
                    <div className="bg-primary/10 rounded-lg p-2 mr-3">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-primary">
                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Reel Modal */}
      <AnimatePresence>
        {selectedReel && (
          <ReelModal
            reel={selectedReel}
            onClose={() => setSelectedReel(null)}
            onLike={(liked) => handleLike(selectedReel.id, liked)}
            isLiked={reelLikes[selectedReel.id] || false}
            profile={profile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}