import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { cookies } from "next/headers";

enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
  INFLUENCER = "INFLUENCER",
}

type InfluencerProfileWithUser = {
  id: string;
  platform: string;
  profilelink: string;
  followerscount: number;
  secondaryplatform?: string;
  secondaryprofilelink?: string;
  bankaccountname: string;
  bankaccountnumber: string;
  ifsccode: string;
  bankname: string;
  bankbranch: string;
  upiid?: string;
  panortaxid: string;
  kycdocument: string;
  address: string;
  bio?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    createdAt?: string;
  };
};

export const metadata = {
  title: "Manage Influencers | Admin Dashboard | Ajyaa",
};

export default async function AdminInfluencersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/sign-in?callbackUrl=/admin/influencers");
  }

  const cookieStore = await cookies();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/influencers`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  const { data: influencers = [] } = await res.json();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-heading text-primary mb-6">Manage Influencers</h1>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">Influencer Accounts</h2>
          <div className="flex space-x-2">
            <Link 
              href="/admin/influencers?status=PENDING" 
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full"
            >
              Pending
            </Link>
            <Link 
              href="/admin/influencers?status=APPROVED" 
              className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full"
            >
              Approved
            </Link>
            <Link 
              href="/admin/influencers?status=REJECTED" 
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Influencer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {influencers.map((profile: InfluencerProfileWithUser) => (
                <tr key={profile.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image
                          className="h-10 w-10 rounded-full"
                          src="/placeholder-avatar.png"
                          alt={profile.user?.name || "Influencer"}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {profile.user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {profile.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {profile.platform}
                      </div>
                      <div className="text-sm text-gray-500">
                        <a
                          href={profile.profilelink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {profile.profilelink}
                        </a>
                        <div>
                          Followers: {profile.followerscount}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {profile.status ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        profile.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : profile.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}>
                        {profile.status}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Incomplete</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profile.user?.createdAt
                      ? formatDistanceToNow(new Date(profile.user.createdAt), { addSuffix: true })
                      : "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profile.kycdocument ? (
                      <a
                        href={profile.kycdocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        KYC Document
                      </a>
                    ) : (
                      <span>No KYC</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {profile.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <form action={`/api/admin/influencers/${profile.user?.id}/approve`} method="POST">
                          <button
                            type="submit"
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={`/api/admin/influencers/${profile.user?.id}/reject`} method="POST">
                          <button
                            type="submit"
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    )}
                    {profile.status === "APPROVED" && (
                      <form action={`/api/admin/influencers/${profile.user?.id}/suspend`} method="POST">
                        <button
                          type="submit"
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
                        >
                          Suspend
                        </button>
                      </form>
                    )}
                    {profile.status === "REJECTED" && (
                      <form action={`/api/admin/influencers/${profile.user?.id}/reset`} method="POST">
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
                        >
                          Reset Status
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/admin/influencers/${profile.user?.id}`}
                      className="text-primary hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {influencers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No influencers found
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