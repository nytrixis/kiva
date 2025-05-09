"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().nullable().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface Address extends AddressFormValues {
  id: string;
  line2?: string | null;
}

interface AddressFormProps {
  existingAddress?: Address;
  onCancel: () => void;
  onSuccess: (address: Address) => void;
}

export default function AddressForm({
  existingAddress,
  onCancel,
  onSuccess,
}: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: existingAddress || {
      name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India", // Default country
      phone: "",
      isDefault: false,
    },
  });
  
  const isDefault = watch("isDefault");
  
  const onSubmit = async (data: AddressFormValues) => {
    setIsSubmitting(true);
    
    try {
      const url = existingAddress
        ? `/api/addresses/${existingAddress.id}`
        : "/api/addresses";
      
      const method = existingAddress ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to save address");
      }
      
      toast({
        title: existingAddress ? "Address Updated" : "Address Added",
        description: existingAddress
          ? "Your address has been updated successfully"
          : "Your new address has been added",
        variant: "success",
      });
      
      onSuccess(result.data);
    } catch (error) {
      console.error("Error saving address:", error);
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {existingAddress ? "Edit Address" : "Add New Address"}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <Input
            {...register("name")}
            placeholder="Full Name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Phone Number</label>
          <Input
            {...register("phone")}
            placeholder="Phone Number"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Address Line 1</label>
        <Input
          {...register("line1")}
          placeholder="Street address, apartment, suite, etc."
          className={errors.line1 ? "border-red-500" : ""}
        />
        {errors.line1 && (
          <p className="text-xs text-red-500">{errors.line1.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Address Line 2 (Optional)
        </label>
        <Input
          {...register("line2")}
          placeholder="Apartment, suite, unit, building, floor, etc."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">City</label>
          <Input
            {...register("city")}
            placeholder="City"
            className={errors.city ? "border-red-500" : ""}
          />
          {errors.city && (
            <p className="text-xs text-red-500">{errors.city.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">State</label>
          <Input
            {...register("state")}
            placeholder="State"
            className={errors.state ? "border-red-500" : ""}
          />
          {errors.state && (
            <p className="text-xs text-red-500">{errors.state.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Postal Code</label>
          <Input
            {...register("postalCode")}
            placeholder="Postal Code"
            className={errors.postalCode ? "border-red-500" : ""}
          />
          {errors.postalCode && (
            <p className="text-xs text-red-500">{errors.postalCode.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Country</label>
        <Input
          {...register("country")}
          placeholder="Country"
          className={errors.country ? "border-red-500" : ""}
        />
        {errors.country && (
          <p className="text-xs text-red-500">{errors.country.message}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDefault"
          checked={isDefault}
          onCheckedChange={(checked) => {
            setValue("isDefault", checked === true);
          }}
        />
        <label
          htmlFor="isDefault"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Set as default address
        </label>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : existingAddress ? "Update Address" : "Save Address"}
        </Button>
      </div>
    </form>
  );
}
