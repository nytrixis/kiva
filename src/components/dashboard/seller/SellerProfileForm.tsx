"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { SellerProfileData } from "@/types/seller";

interface SellerProfileFormProps {
  initialData: SellerProfileData & {
    logoImage?: string;
    bannerImage?: string;
  };
  userData?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    createdAt?: Date;
  };
}

export function SellerProfileForm({ initialData }: SellerProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLogoImageFile] = useState<File | null>(null);
  const [, setBannerImageFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const businessTypes = [
    "Individual",
    "Sole Proprietorship",
    "Partnership",
    "Limited Liability Company (LLC)",
    "Corporation",
    "Cooperative",
    "Non-profit",
    "Other",
  ];
  
  const categoryOptions = [
    "Clothing & Apparel",
    "Jewelry & Accessories",
    "Home Decor",
    "Art & Collectibles",
    "Craft Supplies",
    "Beauty & Personal Care",
    "Food & Beverages",
    "Toys & Games",
    "Paper Goods & Stationery",
    "Electronics & Gadgets",
    "Furniture",
    "Vintage",
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, value]
        : prev.categories.filter((category) => category !== value),
    }));
  };
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoImageFile(file);
      
      // Upload the logo image
      await uploadImage(file, "logo");
    }
  };
  
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImageFile(file);
      
      // Upload the banner image
      await uploadImage(file, "banner");
    }
  };
  
  const uploadImage = async (file: File, type: "logo" | "banner") => {
    try {
      if (type === "logo") {
        setIsUploadingLogo(true);
      } else {
        setIsUploadingBanner(true);
      }
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      
      const response = await fetch("/api/seller/upload-image", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      
      const result = await response.json();
      
      // Update the form data with the image URL
      setFormData((prev) => ({
        ...prev,
        [type === "logo" ? "logoImage" : "bannerImage"]: result.url,
        [type === "logo" ? "logoImagePublicId" : "bannerImagePublicId"]: result.publicId,
      }));
      
      toast({
        title: "Image uploaded",
        description: `Your ${type} image has been uploaded successfully.`,
        variant: "success",
      });
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${type} image. Please try again.`,
        variant: "destructive",
      });
    } finally {
      if (type === "logo") {
        setIsUploadingLogo(false);
      } else {
        setIsUploadingBanner(false);
      }
    }
  };
  
  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, logoImage: "", logoImagePublicId: "" }));
    setLogoImageFile(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };
  
  const removeBanner = () => {
    setFormData((prev) => ({ ...prev, bannerImage: "", bannerImagePublicId: "" }));
    setBannerImageFile(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/seller/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save profile");
      }
      
      toast({
        title: "Profile saved",
        description: "Your seller profile has been updated successfully.",
        variant: "success",
      });
      
      // Refresh the page to show updated data
      router.refresh();
      
      // Redirect to dashboard
      router.push("/dashboard/seller");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Save failed",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-heading text-xl">Store Information</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {/* Banner Image */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Banner
          </label>
          <div className="relative">
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              {formData.bannerImage ? (
                <>
                  <Image
                    src={formData.bannerImage}
                    alt="Store Banner"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                    aria-label="Remove banner image"
                  >
                    <X className="h-4 w-4 text-gray-700" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Recommended: 1920×384px (5:1 ratio)
                  </p>
                  {isUploadingBanner && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <input
              ref={bannerInputRef}
              type="file"
              id="bannerImage"
              name="bannerImage"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
            >
              <Camera className="h-5 w-5 text-gray-700" />
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            This banner will appear at the top of your store page. Use a high-quality image that represents your brand.
          </p>
        </div>
        
        {/* Logo and Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Logo
            </label>
            <div className="relative">
              <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 border border-gray-200 mx-auto">
                {formData.logoImage ? (
                  <>
                    <Image
                      src={formData.logoImage}
                      alt="Store Logo"
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                      aria-label="Remove logo image"
                    >
                      <X className="h-3 w-3 text-gray-700" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Upload className="h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">
                      1:1 ratio
                    </p>
                    {isUploadingLogo && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <input
                ref={logoInputRef}
                type="file"
                id="logoImage"
                name="logoImage"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="absolute bottom-0 right-1/3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
              >
                <Camera className="h-4 w-4 text-gray-700" />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Square image recommended
            </p>
          </div>
          
          {/* Basic Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                Business Type *
              </label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Select Business Type</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Tell customers about your business, products, and what makes you unique..."
              />
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>
        
        {/* Address */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Business Address</h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal/ZIP Code *
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="">Select Country</option>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  {/* Add more countries as needed */}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tax Information */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Tax Information</h3>
          <div>
            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID / GST Number
            </label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={formData.taxId || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              This information will be used for tax purposes and will not be displayed publicly.
            </p>
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Product Categories</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select the categories that best describe your products (select at least one)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {categoryOptions.map((category) => (
              <div key={category} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  name="categories"
                  value={category}
                  checked={formData.categories.includes(category)}
                  onChange={handleCategoryChange}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting || formData.categories.length === 0}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 inline animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
