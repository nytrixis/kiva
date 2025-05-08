"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { SellerProfileData } from "@/types/seller";
import { useToast } from "@/hooks/use-toast";

const businessTypes = [
  { value: "individual", label: "Individual" },
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation" },
];

const categoryOptions = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing & Fashion" },
  { value: "home", label: "Home & Kitchen" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "books", label: "Books & Media" },
  { value: "toys", label: "Toys & Games" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "food", label: "Food & Grocery" },
  { value: "health", label: "Health & Wellness" },
  { value: "jewelry", label: "Jewelry & Accessories" },
];

const sellerProfileSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  description: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(5, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  taxId: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
});

export default function SellerOnboardingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SellerProfileData>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: {
      categories: [],
    },
  });
  
  const onSubmit = async (data: SellerProfileData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/seller/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit seller profile");
      }
      
      toast({
        title: "Success",
        description: "Profile submitted successfully!",
        variant: "success",
      });
      router.push("/onboarding/seller/kyc");
    } catch (error) {
      console.error("Error submitting seller profile:", error);
      toast({
        title: "Error",
        description: "Failed to submit profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const selectedCategories = watch("categories");
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-heading text-primary">Seller Onboarding</h1>
        <p className="text-sm text-gray-500">
          Complete your business information to start selling on Kiva
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Business Information</h3>
          <div className="h-px bg-muted w-full"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="businessName" className="block text-sm font-medium">
                Business Name
              </label>
              <input
                id="businessName"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your Business Name"
                {...register("businessName")}
              />
              {errors.businessName && (
                <p className="text-sm text-red-500">{errors.businessName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="businessType" className="block text-sm font-medium">
                Business Type
              </label>
              <select
                id="businessType"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                {...register("businessType")}
              >
                <option value="">Select Business Type</option>
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.businessType && (
                <p className="text-sm text-red-500">{errors.businessType.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Business Description
            </label>
            <textarea
              id="description"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tell us about your business"
              rows={4}
              {...register("description")}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="categories" className="block text-sm font-medium">
              Product Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <label key={category.value} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={category.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isChecked = e.target.checked;
                      const current = [...selectedCategories];
                      
                      if (isChecked && !current.includes(value)) {
                        setValue("categories", [...current, value]);
                      } else if (!isChecked && current.includes(value)) {
                        setValue(
                          "categories",
                          current.filter((c) => c !== value)
                        );
                      }
                    }}
                    className="mr-1"
                  />
                  <span className="text-sm">{category.label}</span>
                </label>
              ))}
            </div>
            {errors.categories && (
              <p className="text-sm text-red-500">{errors.categories.message}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Contact Information</h3>
          <div className="h-px bg-muted w-full"></div>
          
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium">
              Street Address
            </label>
            <input
              id="address"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="123 Main St"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="city" className="block text-sm font-medium">
                City
              </label>
              <input
                id="city"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="City"
                {...register("city")}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="state" className="block text-sm font-medium">
                State/Province
              </label>
              <input
                id="state"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="State"
                {...register("state")}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="postalCode" className="block text-sm font-medium">
                Postal Code
              </label>
              <input
                id="postalCode"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Postal Code"
                {...register("postalCode")}
              />
              {errors.postalCode && (
                <p className="text-sm text-red-500">{errors.postalCode.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm font-medium">
              Country
            </label>
            <input
              id="country"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Country"
              {...register("country")}
            />
            {errors.country && (
              <p className="text-sm text-red-500">{errors.country.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+1 (555) 123-4567"
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="taxId" className="block text-sm font-medium">
                Tax ID (Optional)
              </label>
              <input
                id="taxId"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tax ID"
                {...register("taxId")}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="website" className="block text-sm font-medium">
              Website (Optional)
            </label>
            <input
              id="website"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://yourbusiness.com"
              {...register("website")}
            />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website.message}</p>
            )}
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-md transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Continue to KYC Verification"}
          </button>
        </div>
      </form>
    </div>
  );
}
