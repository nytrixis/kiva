export interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage: number;
  images: string[];
  stock?: number;
  category: {
    id?: string;
    name: string;
    slug?: string;
  } | null;
  seller: {
    id: string;
    name: string | null;
    image?: string | null;
    sellerProfile?: {
      businessName?: string;
      logoImage?: string | null; // Added business logo
    };
  };
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  viewCount?: number;
  isFavorite?: boolean;
  originalPrice?: number | null;
  link?: string;
}