import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/seller/Sidebar";

export const metadata = {
  title: "Seller Dashboard | Kiva",
  description: "Manage your products, orders, and seller profile",
};

export default async function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated or not a seller
  if (!session?.user || session.user.role !== "SELLER") {
    redirect("/sign-in?callbackUrl=/dashboard/seller");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}