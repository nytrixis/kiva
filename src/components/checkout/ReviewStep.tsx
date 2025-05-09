"use client";

import Image from "next/image";
import { useCheckout } from "@/contexts/checkout-context";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

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

interface ReviewStepProps {
  cartItems: CartItem[];
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
}

export default function ReviewStep({ 
  cartItems, 
  selectedItems, 
  setSelectedItems 
}: ReviewStepProps) {
  const { setStep, processPayment, isLoading, selectedAddressId } = useCheckout();
  
  
  const handleBack = () => {
    setStep(1);
  };
  
  const handleContinue = () => {
    console.log("Selected Address ID:", selectedAddressId);
    console.log("Selected Items:", selectedItems);
    setSelectedItems(selectedItems);

    processPayment();
  };  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-900">Review Order</h2>
      </div>
      
      <div className="space-y-4">
        {cartItems.length > 0 ? (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => {
                    const discountedPrice = item.product.price * (1 - item.product.discountPercentage / 100);
                    const totalPrice = discountedPrice * item.quantity;
                    
                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16 relative rounded overflow-hidden">
                              <Image
                                src={Array.isArray(item.product.images) ? item.product.images[0] : item.product.images}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.product.category?.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Seller: {item.product.seller?.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{discountedPrice.toFixed(2)}
                          </div>
                          {item.product.discountPercentage > 0 && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{item.product.price.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Shipping
              </Button>
              
              <Button
                onClick={handleContinue}
                disabled={selectedItems.length === 0 || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? "Processing..." : "Continue to Payment"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items in cart</h3>
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Button
              onClick={() => window.location.href = "/marketplace"}
              className="bg-primary hover:bg-primary/90"
            >
              Shop Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
