"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/contexts/checkout-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, CreditCard, CheckCircle2 } from "lucide-react";
import { loadRazorpay } from "@/lib/razorpay-client";

export default function PaymentStep() {
  const [isLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const { setStep, orderId } = useCheckout();
  const { toast } = useToast();
  const router = useRouter();
  
  const handleBack = () => {
    setStep(2);
  };
  
  


  

interface PaymentOrderData {
  amount: number;
  currency: string;
  razorpayOrderId: string;
  name: string;
  email: string;
  phone: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const handlePaymentSuccess = useCallback(async (response: RazorpayResponse) => {
  try {
    const result = await fetch("/api/payment/success", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        paymentIntentId: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      }),
    });
    
    if (result.ok) {
      setPaymentSuccess(true);
      toast({
        title: "Payment Successful",
        description: "Your order has been placed successfully!",
        variant: "success",
      });
      
      // Redirect to success page
      router.push(`/checkout/success?orderId=${orderId}`);
    } else {
      throw new Error("Payment verification failed");
    }
  } catch (error) {
    console.error("Payment success handling error:", error);
    setPaymentError("Payment verification failed. Please contact support.");
  }
}, [orderId, router, toast]);

const handlePaymentCancel = useCallback(async () => {
  try {
    await fetch("/api/payment/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });
    
    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled. You can try again.",
      variant: "default",
    });
  } catch (error) {
    console.error("Payment cancellation error:", error);
  }
}, [orderId, toast]);

  
  const initializeRazorpay = useCallback(async (orderData: PaymentOrderData) => {
  try {
    const Razorpay = await loadRazorpay();
    
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      throw new Error("Razorpay key is not configured");
    }
    
    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount * 100, // Amount in paisa
      currency: orderData.currency,
      name: "Kiva Marketplace",
      description: "Purchase from Kiva",
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: orderData.name,
        email: orderData.email,
        contact: orderData.phone,
      },
      handler: function(response: RazorpayResponse) {
        handlePaymentSuccess(response);
      },
      modal: {
        ondismiss: function() {
          handlePaymentCancel();
        },
      },
    } as const;
    
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
  } catch (error) {
    console.error("Razorpay initialization error:", error);
    setPaymentError("Failed to initialize payment. Please try again.");
  }
}, [handlePaymentSuccess, handlePaymentCancel]);

  const loadPaymentDetails = useCallback(async () => {
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to load payment details");
    }
    
    const data = await response.json();
    
    if (data.success) {
      initializeRazorpay(data.order as PaymentOrderData);
    }
  } catch (error) {
    console.error("Error loading payment details:", error);
    setPaymentError("Failed to load payment details. Please try again.");
  }
}, [orderId, initializeRazorpay]);

useEffect(() => {
    // Load payment details when component mounts
    if (orderId) {
    loadPaymentDetails();
  }
}, [orderId, loadPaymentDetails]);
 
  
  if (paymentSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-500 mb-6">
          Your order has been placed successfully. Redirecting to order details...
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-900">Payment</h2>
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center mb-4">
          <CreditCard className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-medium">Payment Details</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Click the button below to proceed with payment. You will be redirected to Razorpays secure payment page.
        </p>
        
        {paymentError && (
          <div className="mt-4 text-sm text-red-600">{paymentError}</div>
        )}
      </div>
      
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isLoading}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Review
        </Button>
        
        <Button
          onClick={loadPaymentDetails}
          disabled={isLoading || !orderId}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </div>
  );
}
