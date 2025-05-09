"use client";

import { useState, useEffect } from "react";
import { CheckoutProvider, useCheckout } from "@/contexts/checkout-context";
import CheckoutStepper from "./CheckoutStepper";
import AddressStep from "./AddressStep";
import ReviewStep from "./ReviewStep";
import PaymentStep from "./PaymentStep";
import CheckoutSummary from "./CheckoutSummary";

interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discountPercentage: number;
    images: string[] | any;
    stock: number;
    category?: {
      name: string;
    };
    seller?: {
      name: string;
    };
  };
}

interface CheckoutClientProps {
  cartItems: CartItem[];
  addresses: Address[];
}

export default function CheckoutClient({ cartItems, addresses }: CheckoutClientProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(
    cartItems.map((item) => item.id)
  );
  
  return (
    <CheckoutProvider initialSelectedItems={selectedItems}>
      <CheckoutContent 
        cartItems={cartItems} 
        addresses={addresses} 
        selectedItems={selectedItems} 
        setSelectedItems={setSelectedItems} 
      />
    </CheckoutProvider>
  );
}

function CheckoutContent({ 
  cartItems, 
  addresses, 
  selectedItems, 
  setSelectedItems 
}: CheckoutClientProps & { 
  selectedItems: string[]; 
  setSelectedItems: (items: string[]) => void; 
}) {
  const { setSelectedItems: setContextSelectedItems } = useCheckout();
  
  // Sync the local state with the context state
  useEffect(() => {
    console.log("Syncing selected items to context:", selectedItems);
    setContextSelectedItems(selectedItems);
  }, [selectedItems, setContextSelectedItems]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-primary mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <CheckoutStepper />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <CheckoutStepContent
              cartItems={cartItems}
              addresses={addresses as any} // Type assertion to fix type mismatch
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <CheckoutSummary
            items={cartItems.filter(item => selectedItems.includes(item.id))}
          />
        </div>
      </div>
    </div>
  );
}

function CheckoutStepContent({
  cartItems,
  addresses,
  selectedItems,
  setSelectedItems
}: {
  cartItems: CartItem[];
  addresses: Address[];
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
}) {
  const { step, setSelectedItems: setContextSelectedItems } = useCheckout();
  
  // Ensure context is updated when step changes
  useEffect(() => {
    setContextSelectedItems(selectedItems);
  }, [step, selectedItems, setContextSelectedItems]);
  
  switch (step) {
    case 1:
      return <AddressStep addresses={addresses} />;
    case 2:
      return (
        <ReviewStep
          cartItems={cartItems.filter(item => selectedItems.includes(item.id))}
          selectedItems={selectedItems}
          setSelectedItems={(items) => {
            setSelectedItems(items);
            setContextSelectedItems(items); // Update context immediately
          }}
        />
      );
    case 3:
      return <PaymentStep />;
    default:
      return <div>Unknown step</div>;
  }
}
