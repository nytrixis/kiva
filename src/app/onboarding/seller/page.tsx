// app/onboarding/seller/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SellerOnboardingForm from "@/components/seller/SellerOnboardingForm";

export const metadata = {
  title: "Seller Onboarding | Kiva",
  description: "Complete your seller profile to start selling on Kiva",
};

export default async function SellerOnboardingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/onboarding/seller");
  }
  
  // Don't check for seller profile here - this is where they create it
  
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-heading text-center text-primary mb-8">
        Seller Onboarding
      </h1>
      <SellerOnboardingForm />
    </div>
  );
}
