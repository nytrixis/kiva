import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/influencer/Sidebar";

export const metadata = {
  title: "Influencer Dashboard | Ajyaa",
  description: "Manage your influencer profile, reels, referrals, and KYC",
};

export default async function InfluencerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated or not an influencer
  if (!session?.user || session.user.role !== "INFLUENCER") {
    // @ts-expect-error: redirect is not typed in this context
    return redirect("/sign-in?callbackUrl=/dashboard/influencer");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}