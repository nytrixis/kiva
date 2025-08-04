"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import Link from "next/link";
import {
  Megaphone,
  Users,
  Star,
  FileText,
  BadgePercent,
  Video,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export default function InfluencerDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  interface InfluencerProfile {
    followerscount: number;
    platform: string;
    status: string;
    bio?: string;
    profilelink?: string;
    panortaxid?: string;
    image?: string;
    user?: {
      name?: string;
    };
  }

  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in");
      return;
    }
    if (!user) return;

    // Try to restore from localStorage first
    const cached = localStorage.getItem("influencerDashboardProfile");
    if (cached) {
      setProfile(JSON.parse(cached));
      setLoading(false);
      return;
    }

    // Only fetch from API if no cached data exists
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/user/influencer-profile");
        const data = await res.json();
        setProfile(data.profile);
        localStorage.setItem("influencerDashboardProfile", JSON.stringify(data.profile));
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isLoading, user, router]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem("influencerDashboardProfile", JSON.stringify(profile));
    }
  }, [profile]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  // Status badge with icon
  function StatusBadge({ status }: { status: string }) {
    let color = "text-yellow-600";
    let bg = "bg-yellow-50";
    let icon = <Clock className="inline h-4 w-4 mr-1" />;
    if (status === "APPROVED") {
      color = "text-green-600";
      bg = "bg-green-50";
      icon = <CheckCircle2 className="inline h-4 w-4 mr-1" />;
    } else if (status === "REJECTED") {
      color = "text-red-600";
      bg = "bg-red-50";
      icon = <XCircle className="inline h-4 w-4 mr-1" />;
    }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${color} ${bg}`}>
        {icon}
        {status}
      </span>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-heading text-primary mb-6">Influencer Dashboard</h1>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Followers</p>
            <h3 className="text-2xl font-semibold">{profile?.followerscount}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <div className="p-3 bg-accent/30 rounded-full">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Platform</p>
            <h3 className="text-2xl font-semibold">{profile?.platform}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <Megaphone className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Status</p>
            <h3 className="text-2xl font-semibold">
              <StatusBadge status={profile?.status ?? "PENDING"} />
            </h3>
          </div>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0">
            <Image
              src={profile?.image || "/placeholder-avatar.png"}
              alt={profile?.user?.name || "Influencer"}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>

          <div className="md:ml-6">
            <h2 className="text-2xl font-heading text-primary">
              {profile?.user?.name || user.name}
            </h2>
            <p className="text-gray-600 mb-2">{profile?.platform}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-3 py-1 bg-accent/30 text-primary text-xs rounded-full">
                {profile?.followerscount} Followers
              </span>
              <span className="px-3 py-1 bg-accent/30 text-primary text-xs rounded-full">
                Status: {profile?.status}
              </span>
            </div>
          </div>

          <div className="mt-4 md:mt-0 md:ml-auto">
            <Link
              href="/dashboard/influencer/profile"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500">Bio</p>
            <p className="font-medium">{profile?.bio || "No bio"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Profile Link</p>
            <a
              href={profile?.profilelink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              {profile?.profilelink}
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-500">PAN/Tax ID</p>
            <p className="font-medium">{profile?.panortaxid}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-heading text-lg mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/influencer/reels"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Video className="h-5 w-5 text-primary mr-3" />
              <span>Manage Reels</span>
            </Link>
            <Link
              href="/dashboard/influencer/kyc"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FileText className="h-5 w-5 text-primary mr-3" />
              <span>KYC Verification</span>
            </Link>
            <Link
              href="/dashboard/influencer/referrals"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BadgePercent className="h-5 w-5 text-primary mr-3" />
              <span>Referrals</span>
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
          <h3 className="font-heading text-lg mb-4">Influencer Status</h3>
          {profile?.status === "APPROVED" ? (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">You are verified!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your influencer profile is verified and active. You can now collaborate and earn with Kiva.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : profile?.status === "PENDING" ? (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Verification pending</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Your profile is under review. This usually takes 1-3 business days. You can still update your profile and upload reels.</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/dashboard/influencer/kyc"
                      className="text-sm font-medium text-yellow-800 hover:text-yellow-700"
                    >
                      Check verification status →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Verification required</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Your profile needs to be verified before you can start collaborating. Please complete the verification process.</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/dashboard/influencer/kyc"
                      className="text-sm font-medium text-red-800 hover:text-red-700"
                    >
                      Complete verification →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}