import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
  INFLUENCER = "INFLUENCER",
}

type SellerProfileWithUser = {
  id: string;
  businessName?: string;
  businessType?: string;
  status?: string;
  identityDocument?: string;
  businessDocument?: string;
  logoImage?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    createdAt?: string;
  };
};

export const metadata = {
  title: "Manage Sellers | Admin Dashboard | Kiva",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function AdminSellersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/sign-in?callbackUrl=/admin/sellers");
  }

  // Fetch all sellers with their profiles

   const cookieStore = await cookies();
const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/sellers`, {
  cache: "no-store",
  headers: {
    Cookie: cookieStore.toString(),
  },
});
  const { data: sellers = [] } = await res.json();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-heading text-primary mb-6">Manage Sellers</h1>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">Seller Accounts</h2>
          <div className="flex space-x-2">
            <Link 
              href="/admin/sellers?status=PENDING" 
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full"
            >
              Pending
            </Link>
            <Link 
              href="/admin/sellers?status=APPROVED" 
              className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full"
            >
              Approved
            </Link>
            <Link 
              href="/admin/sellers?status=REJECTED" 
              className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full"
            >
              Rejected
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
  {sellers.map((sellerProfile: SellerProfileWithUser) => (
    <tr key={sellerProfile.id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <Image
              className="h-10 w-10 rounded-full"
              src={sellerProfile.logoImage || "https://via.placeholder.com/40"}
              alt={sellerProfile.businessName || "Business Logo"}
              width={40}
              height={40}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {sellerProfile.user?.name}
            </div>
            <div className="text-sm text-gray-500">
              {sellerProfile.user?.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {sellerProfile.businessName || <span className="text-gray-500">Not provided</span>}
          </div>
          <div className="text-sm text-gray-500">
            {sellerProfile.businessType || ""}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {sellerProfile.status ? (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            sellerProfile.status === "APPROVED"
              ? "bg-green-100 text-green-800"
              : sellerProfile.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}>
            {sellerProfile.status}
          </span>
        ) : (
          <span className="text-sm text-gray-500">Incomplete</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {sellerProfile.user?.createdAt
          ? formatDistanceToNow(new Date(sellerProfile.user.createdAt), { addSuffix: true })
          : "Unknown"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex space-x-2">
          {sellerProfile.identityDocument && (
            <a
              href={sellerProfile.identityDocument}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              ID Document
            </a>
          )}
          {sellerProfile.businessDocument && (
            <a
              href={sellerProfile.businessDocument}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              Business Document
            </a>
          )}
          {!sellerProfile.identityDocument && !sellerProfile.businessDocument && (
            <span>No documents</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {sellerProfile.status === "PENDING" && (
          <div className="flex space-x-2">
            <Link
              href={`/api/admin/sellers/${sellerProfile.user?.id}/approve`}
              className="text-green-600 hover:text-green-900"
            >
              Approve
            </Link>
            <Link
              href={`/api/admin/sellers/${sellerProfile.user?.id}/reject`}
              className="text-red-600 hover:text-red-900"
            >
              Reject
            </Link>
          </div>
        )}
        {sellerProfile.status === "APPROVED" && (
          <Link
            href={`/api/admin/sellers/${sellerProfile.user?.id}/suspend`}
            className="text-yellow-600 hover:text-yellow-900"
          >
            Suspend
          </Link>
        )}
        {sellerProfile.status === "REJECTED" && (
          <Link
            href={`/api/admin/sellers/${sellerProfile.user?.id}/reset`}
            className="text-blue-600 hover:text-blue-900"
          >
            Reset Status
          </Link>
        )}
        <Link
          href={`/admin/sellers/${sellerProfile.user?.id}`}
          className="ml-2 text-primary hover:text-primary/80"
        >
          View Details
        </Link>
      </td>
    </tr>
  ))}
  {sellers.length === 0 && (
    <tr>
      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
        No sellers found
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}