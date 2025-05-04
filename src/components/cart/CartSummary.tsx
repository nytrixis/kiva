import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export default function CartSummary({ items, onCheckout, isUpdating }) {
  const [summary, setSummary] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });

  // Calculate cart summary whenever items change
  useEffect(() => {
    const calculateSummary = () => {
      // Calculate subtotal (original prices)
      const subtotal = items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);

      // Calculate discount amount
      const discountedSubtotal = items.reduce((sum, item) => {
        const price = item.product.discountPrice || item.product.price;
        return sum + price * item.quantity;
      }, 0);
      
      const discount = subtotal - discountedSubtotal;

      // Calculate tax (assuming 18% GST)
      const taxRate = 0.18;
      const tax = discountedSubtotal * taxRate;

      // Calculate shipping (free above ₹500, otherwise ₹50)
      const shipping = discountedSubtotal > 500 ? 0 : 50;

      // Calculate total
      const total = discountedSubtotal + tax + shipping;

      setSummary({
        subtotal,
        discount,
        tax,
        shipping,
        total,
      });
    };

    calculateSummary();
  }, [items]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-medium text-gray-800 mb-6">Order Summary</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₹{summary.subtotal.toFixed(2)}</span>
        </div>
        
        {summary.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-₹{summary.discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-gray-600">
          <span>Tax (18% GST)</span>
          <span>₹{summary.tax.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>
            {summary.shipping === 0 
              ? <span className="text-green-600">Free</span> 
              : `₹${summary.shipping.toFixed(2)}`
            }
          </span>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between font-semibold text-lg text-gray-900">
            <span>Total</span>
            <span>₹{summary.total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Including all taxes and shipping fees
          </p>
        </div>
        
        <button
          onClick={onCheckout}
          disabled={isUpdating || items.length === 0}
          className="w-full mt-6 bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-full flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
