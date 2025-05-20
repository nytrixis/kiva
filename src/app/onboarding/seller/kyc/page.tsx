import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import KYCDocumentUpload from "@/components/seller/KYCDocumentUpload";

export const metadata = {
  title: "KYC Verification | Kiva",
  description: "Complete your KYC verification to start selling on Kiva",
};

export default async function SellerKYCPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/onboarding/seller/kyc");
  }

  // Check if user has a seller profile via REST API (Supabase)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/seller-profile/${session.user.id}`,
    { cache: "no-store" }
  );
  const sellerProfile = res.ok ? await res.json() : null;

  // If no seller profile, redirect to profile creation
  if (!sellerProfile) {
    redirect("/onboarding/seller");
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-heading text-center text-primary mb-8">
        Seller Verification
      </h1>
      <KYCDocumentUpload />
    </div>
  );
}