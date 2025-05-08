// app/onboarding/seller/kyc/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
  
  // Check if user has a seller profile
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  
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
