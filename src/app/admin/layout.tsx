import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Admin Dashboard | Ajyaa",
  description: "Manage your admin settings, users, and content",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated or not an influencer
  if (!session?.user || session.user.role !== "ADMIN") {
    // @ts-expect-error: redirect is not typed in this context
    return redirect("/sign-in?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}