import Link from "next/link";
import { User, ArrowLeft } from "lucide-react";

export default function InfluencerNotFound() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <div className="max-w-md mx-auto">
        <div className="inline-flex items-center justify-center p-6 bg-primary/10 rounded-full mb-6">
          <User className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-3xl font-heading text-primary mb-4">Influencer Not Found</h1>
        
        <p className="text-gray-600 mb-8">
          The influencer profile you are looking for does not exist or may have been removed.
        </p>
        
        <Link 
          href="/reels" 
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reels
        </Link>
      </div>
    </div>
  );
}