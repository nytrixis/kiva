import Link from "next/link";
import Image from "next/image";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Kiva",
  description: "Sign in to your Kiva account",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <Image 
                src="/images/logob.png" 
                alt="Kiva Logo" 
                width={50} 
                height={50} 
                className="mx-auto"
              />
            </Link>
          </div>
          
          <SignInForm />
        </div>
      </div>
      
      {/* Right side - Image/Branding (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/80"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-10 text-center">
          <h2 className="text-4xl font-heading font-bold text-primary mb-6">
            Discover Unique Local Brands
          </h2>
          <p className="text-lg text-gray-700 max-w-md mb-8">
            Join Kiva to explore handcrafted products from trusted local vendors with real recommendations.
          </p>
          <div className="grid grid-cols-3 gap-6 max-w-md">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <p className="font-bold text-primary text-xl">8+</p>
              <p className="text-sm text-gray-600">Years Experience</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <p className="font-bold text-primary text-xl">4k+</p>
              <p className="text-sm text-gray-600">Best Clients</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
              <p className="font-bold text-primary text-xl">4.9</p>
              <p className="text-sm text-gray-600">Customer Rating</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-accent to-transparent"></div>
        <div className="absolute top-[15%] right-[20%] w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm"></div>
        <div className="absolute top-[35%] right-[10%] w-10 h-10 rounded-full bg-primary/20 backdrop-blur-sm"></div>
        <div className="absolute top-[60%] right-[25%] w-14 h-14 rounded-full bg-white/40 backdrop-blur-sm"></div>
      </div>
    </div>
  );
}
