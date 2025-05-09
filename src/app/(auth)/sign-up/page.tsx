import Link from "next/link";
import Image from "next/image";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Kiva",
  description: "Create your Kiva account",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Image/Branding (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-10 text-center">
          <h2 className="text-4xl font-heading font-bold text-white mb-6">
            Join Our Community
          </h2>
          <p className="text-lg text-white/90 max-w-md mb-8">
            Connect with local artisans, discover unique products, and be part of a growing marketplace that values authenticity.
          </p>
          
          {/* Feature highlights */}
          <div className="space-y-4 text-left max-w-md">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Support Local Businesses</h3>
                <p className="text-white/80 text-sm">Help small businesses thrive in your community</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Discover Unique Products</h3>
                <p className="text-white/80 text-sm">Find handcrafted items you won&apos;t see anywhere else</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Connect with Creators</h3>
                <p className="text-white/80 text-sm">Follow your favorite artisans and influencers</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/80 to-transparent"></div>
        <div className="absolute top-[15%] right-[20%] w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute top-[35%] right-[10%] w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute top-[60%] right-[25%] w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm"></div>
      </div>
      
      {/* Right side - Form */}
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
          
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
