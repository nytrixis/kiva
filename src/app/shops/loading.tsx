import { Loader2 } from "lucide-react";

export default function ShopsLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-primary mb-2">Explore Shops</h1>
      <p className="text-gray-600 mb-8">
        Discovering local businesses and artisans...
      </p>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar skeleton */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
            <div className="h-12 bg-gray-100"></div>
            <div className="p-4 space-y-4">
              <div className="h-5 bg-gray-100 rounded w-1/3"></div>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-4 w-4 bg-gray-100 rounded mr-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
              
              <div className="h-5 bg-gray-100 rounded w-1/3 mt-6"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content skeleton */}
        <div className="w-full md:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-100"></div>
                <div className="h-20 w-20 rounded-full bg-gray-200 absolute" style={{ top: '16%', left: '6%' }}></div>
                <div className="pt-16 p-6 space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 w-12 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                  <div className="h-20 bg-gray-100 rounded"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-6 w-16 bg-gray-100 rounded-full"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}
