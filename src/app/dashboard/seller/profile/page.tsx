import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SellerProfileForm } from "@/components/dashboard/seller/SellerProfileForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Seller Profile | Kiva",
  description: "Manage your seller profile and store information",
};

export default async function SellerProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard/seller/profile");
  }

  const userId = session.user.id;

  // Fetch seller profile from your REST API
  const sellerProfileRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/seller/profile`,
    { cache: "no-store" }
  );
  const sellerProfile = sellerProfileRes.ok ? await sellerProfileRes.json() : null;

  // Fetch user data from your REST API
  const userRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/user/${userId}`,
    { cache: "no-store" }
  );
  const user = userRes.ok ? await userRes.json() : null;

  // Format the seller profile data for the form
  const formattedSellerProfile = sellerProfile
    ? {
        businessName: sellerProfile.businessName || "",
        businessType: sellerProfile.businessType || "",
        description: sellerProfile.description || "",
        address: sellerProfile.address || "",
        city: sellerProfile.city || "",
        state: sellerProfile.state || "",
        postalCode: sellerProfile.postalCode || "",
        country: sellerProfile.country || "",
        taxId: sellerProfile.taxId || "",
        website: sellerProfile.website || "",
        phoneNumber: sellerProfile.phoneNumber || "",
        categories: sellerProfile.categories || [],
        bannerImage: sellerProfile.bannerImage || "",
        logoImage: sellerProfile.logoImage || "",
      }
    : {
        businessName: "",
        businessType: "",
        description: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        taxId: "",
        website: "",
        phoneNumber: "",
        categories: [],
        bannerImage: "",
        logoImage: "",
      };

  return (
    <div>
      <h1 className="text-3xl font-heading text-primary mb-6">Seller Profile</h1>
      <p className="text-gray-600 mb-8">
        Manage your store information and appearance
      </p>

      <SellerProfileForm
        initialData={formattedSellerProfile}
        userData={user || undefined}
      />
    </div>
  );
}