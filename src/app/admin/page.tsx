import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Users, UserCheck, Store, Upload, BarChart3, AlertCircle } from "lucide-react";
import { cookies } from "next/headers";

enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
  INFLUENCER = "INFLUENCER",
}

export const metadata = {
  title: "Admin Dashboard | Kiva",
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/sign-in?callbackUrl=/admin");
  }

  // Fetch stats for dashboard
  const cookieStore = await cookies();
  
  const [sellersRes, influencersRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/sellers`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() },
    }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/influencers`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() },
    }),
  ]);

  if (!sellersRes.ok) {
      console.error("Sellers API failed:", sellersRes.status, sellersRes.statusText);
    }
    if (!influencersRes.ok) {
      console.error("Influencers API failed:", influencersRes.status, influencersRes.statusText);
    }

    const sellersData = await sellersRes.json();
    const influencersData = await influencersRes.json();

    const sellers = sellersData.data || [];
    const influencers = influencersData.data || [];

    // // Debug logs
    // console.log("Sellers Response:", sellersData);
    // console.log("Sellers Array Length:", sellers.length);
    // console.log("First Seller:", sellers[0]);
    // console.log("Influencers Response:", influencersData);
    // console.log("Influencers Array Length:", influencers.length);

    // Calculate stats with detailed logging
    const sellersStats = {
    total: sellers.length,
    pending: sellers.filter((s: Account) => {
        console.log("Seller status:", s.status);
        return s.status === "PENDING";
    }).length,
    approved: sellers.filter((s: Account) => s.status === "APPROVED").length,
    rejected: sellers.filter((s: Account) => s.status === "REJECTED").length,
    suspended: sellers.filter((s: Account) => s.status === "SUSPENDED").length, // Add this
    };

    const influencersStats = {
      total: influencers.length,
      pending: influencers.filter((i: Account) => i.status === "PENDING").length,
      approved: influencers.filter((i: Account) => i.status === "APPROVED").length,
      rejected: influencers.filter((i: Account) => i.status === "REJECTED").length,
    };

    // console.log("Final Stats - Sellers:", sellersStats);
    // console.log("Final Stats - Influencers:", influencersStats);



  // Define types for sellers and influencers
  type Account = {
    status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    [key: string]: unknown;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading text-primary mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage sellers, influencers, and platform content</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sellers</p>
              <p className="text-2xl font-semibold text-gray-900">{sellersStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Influencers</p>
              <p className="text-2xl font-semibold text-gray-900">{influencersStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sellersStats.pending + influencersStats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved Accounts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sellersStats.approved + influencersStats.approved}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sellers Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Store className="h-5 w-5 mr-2 text-blue-600" />
                Sellers
            </h2>
            <Link
                href="/admin/sellers"
                className="text-sm text-primary hover:text-primary/80 font-medium"
            >
                View All
            </Link>
            </div>
        </div>
        <div className="p-6">
            <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Review</span>
                <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">
                    {sellersStats.pending}
                </span>
                {sellersStats.pending > 0 && (
                    <Link
                    href="/admin/sellers?status=PENDING"
                    className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                    >
                    Review
                    </Link>
                )}
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="text-sm font-medium text-green-600">
                {sellersStats.approved}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Suspended</span>
                <span className="text-sm font-medium text-orange-600">
                {sellersStats.suspended}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rejected</span>
                <span className="text-sm font-medium text-red-600">
                {sellersStats.rejected}
                </span>
            </div>
            </div>
            <div className="mt-6">
            <Link
                href="/admin/sellers"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
            >
                Manage Sellers
            </Link>
            </div>
        </div>
        </div>

        {/* Influencers Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Influencers
              </h2>
              <Link
                href="/admin/influencers"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Review</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">
                    {influencersStats.pending}
                  </span>
                  {influencersStats.pending > 0 && (
                    <Link
                      href="/admin/influencers?status=PENDING"
                      className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                    >
                      Review
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="text-sm font-medium text-green-600">
                  {influencersStats.approved}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rejected</span>
                <span className="text-sm font-medium text-red-600">
                  {influencersStats.rejected}
                </span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/admin/influencers"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Manage Influencers
              </Link>
            </div>
          </div>
        </div>

        {/* Content Management Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Content Management
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Link
                href="/admin/categories/upload"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 rounded-md bg-blue-100">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Categories</p>
                  <p className="text-xs text-gray-500">Manage product categories</p>
                </div>
              </Link>

              <Link
                href="/admin/categories/upload"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 rounded-md bg-purple-100">
                  <Upload className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Upload Banners</p>
                  <p className="text-xs text-gray-500">Category banner images</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sellersStats.pending > 0 && (
                <Link
                  href="/admin/sellers?status=PENDING"
                  className="flex items-center p-4 rounded-lg bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-colors"
                >
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Review {sellersStats.pending} Seller{sellersStats.pending > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-yellow-600">Pending approval</p>
                  </div>
                </Link>
              )}

              {influencersStats.pending > 0 && (
                <Link
                  href="/admin/influencers?status=PENDING"
                  className="flex items-center p-4 rounded-lg bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-colors"
                >
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Review {influencersStats.pending} Influencer{influencersStats.pending > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-yellow-600">Pending approval</p>
                  </div>
                </Link>
              )}

              <Link
                href="/admin/categories/upload"
                className="flex items-center p-4 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <Upload className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Upload Banner</p>
                  <p className="text-xs text-blue-600">Add category images</p>
                </div>
              </Link>

              <Link
                href="/admin/categories/upload"
                className="flex items-center p-4 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">Manage Categories</p>
                  <p className="text-xs text-green-600">Edit category settings</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}