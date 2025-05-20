import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
// import { AppPageRouteHandlerContext } from "next/dist/server/route-modules/app-page/module";

enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
  INFLUENCER = "INFLUENCER",
}

type Product = {
  id: string;
  name: string;
  images: string[] | string;
  price: number;
  createdAt: string;
  stock: number;
  viewCount: number;
  category?: {
    name: string;
  };
};


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await props.params;

  // Fetch seller data for metadata
  const { data: seller } = await supabase
    .from("user")
    .select(`
      name,
      sellerProfile: SellerProfile(businessName)
    `)
    .eq("id", id)
    .single();

  const sellerName =
  Array.isArray(seller?.sellerProfile) && seller.sellerProfile.length > 0
    ? seller.sellerProfile[0].businessName
    : seller?.name || "Seller";

  return {
    title: `${sellerName} Details | Admin Dashboard | Kiva`,
  };
}

export default async function SellerDetailsPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/sign-in?callbackUrl=/admin/sellers");
  }

  // Fetch seller with profile and products
  const { data: seller } = await supabase
    .from("User")
    .select(`
      *,
      sellerProfile: SellerProfile(*),
      products: Product(
        *,
        category: Category(*)
      )
    `)
    .eq("id", id)
    .single();

  if (!seller) {
    redirect("/admin/sellers");
  }

  // Sort and limit products to 5 most recent
  const products = (seller.products || [])
    .sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-primary">Seller Details</h1>
        <Link 
          href="/admin/sellers"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
        >
          Back to Sellers
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full overflow-hidden relative">
                    <Image 
                      src={seller.image || "https://via.placeholder.com/64"} 
                      alt={seller.name || "Seller"} 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-medium text-gray-900">{seller.name}</h2>
                  <p className="text-sm text-gray-500">{seller.email}</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                  <div className="mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      seller.sellerProfile?.status === "APPROVED" 
                        ? "bg-green-100 text-green-800" 
                        : seller.sellerProfile?.status === "PENDING" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : seller.sellerProfile?.status === "SUSPENDED"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                    }`}>
                      {seller.sellerProfile?.status || "INCOMPLETE"}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {seller.createdAt ? format(new Date(seller.createdAt), 'PPP') : "Unknown"}
                  </p>
                </div>
                
                {seller.sellerProfile?.verifiedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Verified On</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {format(new Date(seller.sellerProfile.verifiedAt), 'PPP')}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Actions</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {seller.sellerProfile?.status === "PENDING" && (
                      <>
                        <Link 
                          href={`/api/admin/sellers/${seller.id}/approve`}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                        >
                          Approve
                        </Link>
                        <Link 
                          href={`/api/admin/sellers/${seller.id}/reject`}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                        >
                          Reject
                        </Link>
                      </>
                    )}
                    
                    {seller.sellerProfile?.status === "APPROVED" && (
                      <Link 
                        href={`/api/admin/sellers/${seller.id}/suspend`}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
                      >
                        Suspend
                      </Link>
                    )}
                    
                    {(seller.sellerProfile?.status === "REJECTED" || seller.sellerProfile?.status === "SUSPENDED") && (
                      <Link 
                        href={`/api/admin/sellers/${seller.id}/reset`}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
                      >
                        Reset Status
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Business Information</h3>
            </div>
            
            {seller.sellerProfile ? (
              <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{seller.sellerProfile.businessName}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Business Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{seller.sellerProfile.businessType}</dd>
                  </div>
                  
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">{seller.sellerProfile.description || "No description provided"}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{seller.sellerProfile.phoneNumber}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {seller.sellerProfile.website ? (
                        <a 
                          href={seller.sellerProfile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {seller.sellerProfile.website}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                  
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {seller.sellerProfile.address}, {seller.sellerProfile.city}, {seller.sellerProfile.state} {seller.sellerProfile.postalCode}, {seller.sellerProfile.country}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {seller.sellerProfile.taxId || "Not provided"}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Categories</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {seller.sellerProfile.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {seller.sellerProfile.categories.map((category: string) => (
                            <span 
                              key={category} 
                              className="px-2 py-1 bg-accent/30 text-primary text-xs rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "No categories selected"
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm text-gray-500">No business information provided</p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Verification Documents</h3>
            </div>
            
            {seller.sellerProfile ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Identity Document</h4>
                    {seller.sellerProfile.identityDocument ? (
                      <div>
                        <div className="relative h-40 w-full border rounded-md overflow-hidden">
                          <Image 
                            src={seller.sellerProfile.identityDocument} 
                            alt="Identity Document" 
                            fill
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                        <div className="mt-2">
                          <a 
                            href={seller.sellerProfile.identityDocument} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Full Size
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No identity document uploaded</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Business Document</h4>
                    {seller.sellerProfile.businessDocument ? (
                      <div>
                        <div className="relative h-40 w-full border rounded-md overflow-hidden">
                          <Image 
                            src={seller.sellerProfile.businessDocument} 
                            alt="Business Document" 
                            fill
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                        <div className="mt-2">
                          <a 
                            href={seller.sellerProfile.businessDocument} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Full Size
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No business document uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm text-gray-500">No verification documents uploaded</p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-medium">Recent Products</h3>
              <Link 
                href={`/admin/products?sellerId=${seller.id}`}
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            
            <div className="divide-y">
              {products.length > 0 ? (
                products.map((product: Product) => (
                  <div key={product.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 relative h-16 w-16 rounded-md overflow-hidden">
                        <Image 
                          src={Array.isArray(product.images) && product.images.length > 0 
                              ? String(product.images[0]) 
                              : "https://via.placeholder.com/64"
                          } 
                          alt={product.name} 
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.category?.name} • ${product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {product.stock} • Views: {product.viewCount}
                        </p>
                      </div>
                      <div>
                        <Link 
                          href={`/admin/products/${product.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">No products found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}