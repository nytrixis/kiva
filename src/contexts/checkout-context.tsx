"use client";

import React, { createContext, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CheckoutContextType {
  isLoading: boolean;
  step: number;
  setStep: (step: number) => void;
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  orderId: string | null;
  processPayment: () => Promise<void>;
}

// Create a new interface for provider props
interface CheckoutProviderProps {
  children: React.ReactNode;
  initialSelectedItems?: string[];
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ 
  children, 
  initialSelectedItems = [] 
}: CheckoutProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelectedItems);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  
  const processPayment = async () => {
    console.log("Processing payment with:", {
      selectedAddressId,
      selectedItems,
      itemsLength: selectedItems.length
    });
    
    if (!selectedAddressId || selectedItems.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select an address and at least one item",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First create the order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          items: selectedItems.map(id => ({ id })),
        }),
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }
      
      setOrderId(orderData.orderId);
      setStep(3); // Move to payment step
    } catch (error) {
      console.error("Order creation error:", error);
      toast({
        title: "Order Error",
        description: "There was a problem creating your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    isLoading,
    step,
    setStep,
    selectedAddressId,
    setSelectedAddressId,
    selectedItems,
    setSelectedItems,
    orderId,
    processPayment,
  };
  
  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
