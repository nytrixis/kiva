"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { Video } from "lucide-react";

type Reel = {
  id: string;
  url: string;
  title: string;
  description: string;
};

export default function InfluencerReelsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      const res = await fetch("/api/influencer/reels");
      const data = await res.json();
      setReels(data.reels || []);
      setLoading(false);
    };
    if (user) fetchReels();
  }, [user]);

  return (
    <div>
      <h1 className="text-3xl font-heading text-primary mb-2">Your Reels</h1>
      <p className="text-gray-600 mb-8">
        Manage your influencer reels and showcase your collaborations.
      </p>
      <Link
        href="/dashboard/influencer/reels/new"
        className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mb-6"
      >
        Upload New Reel
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div>Loading...</div>
        ) : reels.length === 0 ? (
          <div className="text-gray-500 col-span-3">No reels uploaded yet.</div>
        ) : (
          reels.map((reel) => (
            <div key={reel.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-stretch">
              <video controls src={reel.url} className="w-full rounded-lg mb-2" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{reel.title}</h3>
                <p className="text-sm text-gray-500">{reel.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}