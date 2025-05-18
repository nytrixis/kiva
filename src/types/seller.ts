// Define the enum manually to match your schema
export enum SellerStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED'
}

export interface SellerProfileData {
  businessName: string;
  businessType: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId?: string;
  website?: string;
  phoneNumber: string;
  categories: string[];
}

export interface SellerKYCData {
  identityDocument?: string;
  businessDocument?: string;
}

export interface SellerProfile extends SellerProfileData, SellerKYCData {
  id: string;
  userId: string;
  bannerImage?: string;
  logoImage?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  status: SellerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "SELLER";
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}