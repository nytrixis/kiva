"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function InfluencerProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  interface InfluencerProfile {
    id: string;
    name: string;
    bio: string;
    image?: string;
    followerCount: number;
    // Add other fields as needed
  }

  interface Reel {
    id: string;
    url: string;
    title: string;
    // Add other fields as needed
  }

  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const profileRes = await fetch(`/api/influencer/profile?id=${id}`);
      const profileData = await profileRes.json();
      setProfile(profileData);

      const reelsRes = await fetch(`/api/influencer/reels?id=${id}`);
      const reelsData = await reelsRes.json();
      setReels(reelsData.reels || []);

      // If you have posts
      // const postsRes = await fetch(`/api/influencer/posts?id=${id}`);
      // const postsData = await postsRes.json();
      // setPosts(postsData.posts || []);

      setLoading(false);
    }
    fetchData();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      {profile && (
        <div className="flex items-center mb-8">
          <div className="relative h-20 w-20 rounded-full overflow-hidden bg-primary/10">
            <Image
              src={profile.image || "/images/placeholder-user.jpg"}
              alt={profile.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-gray-600">{profile.bio}</p>
            <div className="flex space-x-4 mt-2">
              <span>{profile.followerCount} followers</span>
              <span>{reels.length} reels</span>
              {/* <span>{posts.length} posts</span> */}
            </div>
          </div>
          {user?.id === id && (
            <Link
              href="/dashboard/influencer/reels/new"
              className="ml-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload Reel
            </Link>
          )}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Reels</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : reels.length === 0 ? (
          <div className="text-gray-500 col-span-3">No reels yet.</div>
        ) : (
          reels.map((reel) => (
            <Link key={reel.id} href={`/reels/${reel.id}`}>
              <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden relative group">
                <video
                  src={reel.url}
                  className="object-cover w-full h-full"
                  muted
                  loop
                  playsInline
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white p-2 text-xs group-hover:bg-black/60 transition">
                  {reel.title}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* If you have posts, add a similar grid for posts */}
    </div>
  );
}