"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { BadgePercent } from "lucide-react";

type Referral = {
  id: string;
  name: string;
  email: string;
  earnings: number;
};

type InfluencerUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: string;
  image?: string | null;
  referralCode?: string;
};

export default function InfluencerReferralsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true);
      const res = await fetch("/api/influencer/referrals");
      const data = await res.json();
      setReferrals(data.referrals || []);
      setLoading(false);
    };
    if (user) fetchReferrals();
  }, [user]);

  if (isLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  return (
    <div>
      <div>
        <h1 className="text-3xl font-heading text-primary mb-2">Referrals</h1>
        <p className="text-gray-600 mb-8">
          Track your referral earnings and invited users.
        </p>
        <div className="flex items-center">
          <BadgePercent className="h-8 w-8 text-primary mr-4" />
          <div>
            <div className="font-medium text-lg">Your Referral Code:</div>
            <div className="text-xl font-bold text-primary">{(user as InfluencerUser)?.referralCode || "N/A"}</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Referred Users</h2>
        {loading ? (
          <div>Loading...</div>
        ) : referrals.length === 0 ? (
          <div className="text-gray-500">No referrals yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {referrals.map((ref) => (
              <li key={ref.id} className="py-2 flex justify-between">
                <span>{ref.name} ({ref.email})</span>
                <span className="text-green-600 font-semibold">₹{ref.earnings}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
