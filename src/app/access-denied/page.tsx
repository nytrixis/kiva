import { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Access Denied | Kiva",
  description: "You don't have permission to access this page",
};

// Remove the custom interface and use the correct pattern for Next.js pages
export default function AccessDeniedPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const message = searchParams.message || "You don't have permission to access this page";
  
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="h-8 w-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-heading font-bold text-gray-800 mb-3">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            Return to Home
          </Link>
          
          <Link
            href="/contact"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
