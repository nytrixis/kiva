import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Manage Sellers | Admin Dashboard | Kiva",
};

export default async function AdminSellersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/sign-in?callbackUrl=/admin/sellers");
  }
  
  // Fetch all sellers with their profiles
  const sellers = await prisma.user.findMany({
    where: {
      role: UserRole.SELLER,
    },
    include: {
      sellerProfile: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
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
              {sellers.map((seller) => (
                <tr key={seller.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src={seller.image || "https://via.placeholder.com/40"} 
                          alt={seller.name || "Seller"} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {seller.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {seller.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {seller.sellerProfile ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {seller.sellerProfile.businessName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {seller.sellerProfile.businessType}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {seller.sellerProfile?.status ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        seller.sellerProfile.status === "APPROVED" 
                          ? "bg-green-100 text-green-800" 
                          : seller.sellerProfile.status === "PENDING" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-red-100 text-red-800"
                      }`}>
                        {seller.sellerProfile.status}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Incomplete</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {seller.createdAt ? formatDistanceToNow(new Date(seller.createdAt), { addSuffix: true }) : "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {seller.sellerProfile ? (
                      <div className="flex space-x-2">
                        {seller.sellerProfile.identityDocument && (
                          <a 
                            href={seller.sellerProfile.identityDocument} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            ID Document
                          </a>
                        )}
                        {seller.sellerProfile.businessDocument && (
                          <a 
                            href={seller.sellerProfile.businessDocument} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            Business Document
                          </a>
                        )}
                        {!seller.sellerProfile.identityDocument && !seller.sellerProfile.businessDocument && (
                          <span>No documents</span>
                        )}
                      </div>
                    ) : (
                      <span>N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {seller.sellerProfile?.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <Link 
                          href={`/api/admin/sellers/${seller.id}/approve`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </Link>
                        <Link 
                          href={`/api/admin/sellers/${seller.id}/reject`}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </Link>
                      </div>
                    )}
                    {seller.sellerProfile?.status === "APPROVED" && (
                      <Link 
                        href={`/api/admin/sellers/${seller.id}/suspend`}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Suspend
                      </Link>
                    )}
                    {seller.sellerProfile?.status === "REJECTED" && (
                      <Link 
                        href={`/api/admin/sellers/${seller.id}/reset`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Reset Status
                      </Link>
                    )}
                    <Link 
                      href={`/admin/sellers/${seller.id}`}
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
