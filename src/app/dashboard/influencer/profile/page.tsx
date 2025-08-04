"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { InfluencerProfileForm } from "@/components/dashboard/influencer/InfluencerProfileForm";

export default function InfluencerProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  interface InfluencerProfile {
    user?: {
      name?: string;
      image?: string;
    };
    image?: string;
    bio?: string;
    platform?: string;
    profilelink?: string;
    followerscount?: string;
    panortaxid?: string;
  }

  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in?callbackUrl=/dashboard/influencer/profile");
      return;
    }
    if (!user) return;

    // Try to restore from localStorage first
    const draft = localStorage.getItem("influencerProfileDraft");
    if (draft) {
      setProfile(JSON.parse(draft));
      setLoading(false);
      return;
    }

    // Only fetch from API if no draft exists
    const fetchProfile = async () => {
      setLoading(true);
      const res = await fetch("/api/user/influencer-profile");
      const data = await res.json();
      setProfile(data.profile);
      setLoading(false);
    };
    fetchProfile();
  }, [isLoading, user, router]);

  // Save profile to localStorage on change
  useEffect(() => {
    if (profile) {
      localStorage.setItem("influencerProfileDraft", JSON.stringify(profile));
    }
  }, [profile]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Format the influencer profile data for the form
  const formattedProfile = profile
    ? {
        name: profile.user?.name || "",
        image: profile.image || "",
        bio: profile.bio || "",
        platform: profile.platform || "",
        profileLink: profile.profilelink || "",
        followerscount: profile.followerscount !== undefined ? String(profile.followerscount) : "",
        panOrTaxId: profile.panortaxid || "",
      }
    : {
        name: "",
        image: "",
        bio: "",
        platform: "",
        profileLink: "",
        followerscount: "",
        panOrTaxId: "",
      };

  return (
    <div>
      <h1 className="text-3xl font-heading text-primary mb-6">Influencer Profile</h1>
      <p className="text-gray-600 mb-8">
        Manage your influencer information and appearance
      </p>
      <InfluencerProfileForm initialData={formattedProfile} />
    </div>
  );
}