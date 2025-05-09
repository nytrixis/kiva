import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import KYCDocumentUpload from "@/components/seller/KYCDocumentUpload";

export const metadata = {
  title: "Verification | Seller Dashboard | Kiva",
  description: "Complete your seller verification by uploading required documents",
};

export default async function SellerKYCPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard/seller/kyc");
  }
  
  return (
    <div>
      <h1 className="text-3xl font-heading text-primary mb-2">Seller Verification</h1>
      <p className="text-gray-600 mb-8">
        Complete your verification to start selling on Kiva
      </p>
      
      <KYCDocumentUpload />
    </div>
  );
}
