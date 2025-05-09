"use client";

import { useMemo } from "react";
import { ShoppingBag, Tag, Truck } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discountPercentage: number;
    images: string[] | Record<string, unknown>;
    stock: number;
    category?: {
      name: string;
    };
    seller?: {
      name: string;
    };
  };
}

interface CheckoutSummaryProps {
  items: CartItem[];
}

export default function CheckoutSummary({ items }: CheckoutSummaryProps) {
  const { subtotal, discount, tax, shipping, total } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);
    
    const discount = items.reduce((sum, item) => {
      return (
        sum +
        (item.product.price * item.product.discountPercentage / 100) * item.quantity
      );
    }, 0);
    
    // Apply tax (e.g., 5%)
    const taxRate = 0.05;
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * taxRate;
    
    // Shipping cost (could be calculated based on address, weight, etc.)
    const shipping = taxableAmount > 1000 ? 0 : 100; // Free shipping over ₹1000
    
    // Total amount
    const total = taxableAmount + tax + shipping;
    
    return {
      subtotal,
      discount,
      tax,
      shipping,
      total,
    };
  }, [items]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <ShoppingBag className="h-5 w-5 text-primary mr-2" />
        Order Summary
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
          <span className="text-gray-900 font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <Tag className="h-4 w-4 text-green-500 mr-1" />
              Discount
            </span>
            <span className="text-green-600 font-medium">-₹{discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (5%)</span>
          <span className="text-gray-900 font-medium">₹{tax.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <Truck className="h-4 w-4 text-gray-500 mr-1" />
            Shipping
          </span>
          {shipping > 0 ? (
            <span className="text-gray-900 font-medium">₹{shipping.toFixed(2)}</span>
          ) : (
            <span className="text-green-600 font-medium">Free</span>
          )}
        </div>
        
        <div className="h-px bg-gray-200 my-2"></div>
        
        <div className="flex justify-between">
          <span className="text-gray-900 font-medium">Total</span>
          <span className="text-primary font-bold text-lg">₹{total.toFixed(2)}</span>
        </div>
      </div>
      
      {shipping === 0 ? (
        <div className="mt-4 bg-green-50 text-green-700 text-xs p-2 rounded-md flex items-center">
          <Truck className="h-3 w-3 mr-1" />
          Free shipping applied on orders above ₹1000
        </div>
      ) : (
        <div className="mt-4 bg-gray-50 text-gray-600 text-xs p-2 rounded-md">
          Add ₹{(1000 - (subtotal - discount)).toFixed(2)} more to get free shipping
        </div>
      )}
    </div>
  );
}
