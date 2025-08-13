import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { cookies } from "next/headers";

enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
  INFLUENCER = "INFLUENCER",
}

export default async function AdminInfluencerDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/sign-in?callbackUrl=/admin/influencers");
  }

  const cookieStore = await cookies();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/influencers/${id}`,
    {
      cache: "no-store",
      headers: {
        Cookie: cookieStore.toString(),
      },
    }
  );
  const { data: influencer } = await res.json();

  if (!influencer) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-heading text-primary mb-6">
          Influencer Not Found
        </h1>
        <Link
          href="/admin/influencers"
          className="text-primary hover:underline"
        >
          Back to Influencers
        </Link>
      </div>
    );
  }

  const placeholderAvatar = "/placeholder-avatar.png";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-primary">Influencer Details</h1>
        <Link
          href="/admin/influencers"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
        >
          Back to Influencers
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Profile summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full overflow-hidden relative">
                    <Image
                      src={placeholderAvatar}
                      alt={influencer.user?.name || "Influencer"}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-medium text-gray-900">
                    {influencer.user?.name}
                  </h2>
                  <p className="text-sm text-gray-500">{influencer.user?.email}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Account Status
                  </h3>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        influencer.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : influencer.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : influencer.status === "SUSPENDED"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {influencer.status || "INCOMPLETE"}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {influencer.user?.createdAt
                      ? format(new Date(influencer.user.createdAt), "PPP")
                      : "Unknown"}
                  </p>
                </div>

                {/* Actions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Actions</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {influencer.status === "PENDING" && (
                      <>
                        <Link
                          href={`/api/admin/influencers/${influencer.user?.id}/approve`}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                        >
                          Approve
                        </Link>
                        <Link
                          href={`/api/admin/influencers/${influencer.user?.id}/reject`}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                        >
                          Reject
                        </Link>
                      </>
                    )}
                    {influencer.status === "APPROVED" && (
                      <Link
                        href={`/api/admin/influencers/${influencer.user?.id}/suspend`}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
                      >
                        Suspend
                      </Link>
                    )}
                    {(influencer.status === "REJECTED" ||
                      influencer.status === "SUSPENDED") && (
                      <Link
                        href={`/api/admin/influencers/${influencer.user?.id}/reset`}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
                      >
                        Reset Status
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Influencer info and KYC */}
        <div className="md:col-span-2 space-y-6">
          {/* Influencer Info */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Influencer Information</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Platform</dt>
                  <dd className="mt-1 text-sm text-gray-900">{influencer.platform}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Profile Link</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a
                      href={influencer.profilelink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {influencer.profilelink}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Followers</dt>
                  <dd className="mt-1 text-sm text-gray-900">{influencer.followerscount}</dd>
                </div>
                {influencer.secondaryplatform && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Secondary Platform</dt>
                    <dd className="mt-1 text-sm text-gray-900">{influencer.secondaryplatform}</dd>
                  </div>
                )}
                {influencer.secondaryprofilelink && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Secondary Profile Link</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a
                        href={influencer.secondaryprofilelink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {influencer.secondaryprofilelink}
                      </a>
                    </dd>
                  </div>
                )}
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm text-gray-900">{influencer.bio || "No bio provided"}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{influencer.address}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Bank & KYC */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Bank & KYC Details</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{influencer.bankaccountname}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{influencer.bankaccountnumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">IFSC/SWIFT</dt>
                  <dd className="mt-1 text-sm text-gray-900">{influencer.ifsccode}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{influencer.bankname}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Branch</dt>
                  <dd className="mt-1 text-sm text-gray-900">{influencer.bankbranch}</dd>
                </div>
                {influencer.upiid && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">UPI ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{influencer.upiid}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">PAN/Tax ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{influencer.panortaxid}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">KYC Document</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {influencer.kycdocument ? (
                      <a
                        href={influencer.kycdocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View KYC Document
                      </a>
                    ) : (
                      <span>No KYC Document</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}